"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const auditLog_1 = require("../utils/auditLog");
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
exports.verifyWebhook = functions.https.onRequest(async (req, res) => {
    if (!RAZORPAY_WEBHOOK_SECRET) {
        console.error("Missing RAZORPAY_WEBHOOK_SECRET");
        res.status(500).send("Configuration error");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    const signature = req.headers["x-razorpay-signature"];
    const body = req.rawBody; // Need raw body for signature verification
    if (!signature || !body) {
        console.error("Missing signature or body");
        res.status(400).send("Bad Request");
        return;
    }
    // Verify signature
    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");
    if (signature !== expectedSignature) {
        console.error("Invalid Razorpay webhook signature");
        res.status(400).send("Invalid Signature");
        return;
    }
    try {
        const payload = req.body;
        const db = admin.firestore();
        await (0, auditLog_1.createAuditLog)("PAYMENT_WEBHOOK_RECEIVED", payload.event, payload);
        if (payload.event === "payment.captured") {
            const paymentEntity = payload.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            if (!orderId) {
                console.error("No order ID in payload");
                res.status(400).send("Invalid Payload");
                return;
            }
            const orderRef = db.collection("orders").doc(orderId);
            // Use a Firestore transaction to ensure atomic updates and idempotency
            await db.runTransaction(async (t) => {
                const orderSnap = await t.get(orderRef);
                if (!orderSnap.exists) {
                    throw new Error("Order not found");
                }
                const orderData = orderSnap.data();
                if (orderData?.status === "captured") {
                    // Idempotency check: Already processed
                    return;
                }
                // 1. Mark Order as captured
                t.update(orderRef, {
                    status: "captured",
                    paymentId: paymentEntity.id,
                    method: paymentEntity.method,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                // 2. Append to Immutable Ledger: Platform Commission
                const ledgerRefCommission = db.collection("ledgers").doc();
                t.set(ledgerRefCommission, {
                    type: "platform_commission",
                    amount: orderData?.commissionAmount,
                    currency: orderData?.currency,
                    orderId,
                    titleId: orderData?.titleId,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                // 3. Append to Immutable Ledger: Creator Payable
                const ledgerRefCreator = db.collection("ledgers").doc();
                t.set(ledgerRefCreator, {
                    type: "creator_payable",
                    creatorId: orderData?.creatorId,
                    amount: orderData?.creatorPayable,
                    currency: orderData?.currency,
                    orderId,
                    titleId: orderData?.titleId,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    settlementStatus: "pending" // track whether this chunk has been paid out
                });
                // 4. Update the transactional aggregated wallet balance
                if (orderData?.creatorId && orderData?.creatorPayable) {
                    const walletRef = db.collection("wallets").doc(orderData.creatorId);
                    const walletSnap = await t.get(walletRef);
                    if (!walletSnap.exists) {
                        t.set(walletRef, {
                            availableBalance: orderData.creatorPayable,
                            pendingBalance: 0,
                            reservedBalance: 0,
                            settledBalance: 0,
                            totalEarned: orderData.creatorPayable,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                    else {
                        const currentWallet = walletSnap.data();
                        t.update(walletRef, {
                            availableBalance: (currentWallet?.availableBalance || 0) + orderData.creatorPayable,
                            totalEarned: (currentWallet?.totalEarned || 0) + orderData.creatorPayable,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }
                // 5. Create Invoice
                const invoiceRef = db.collection("invoices").doc(orderId);
                t.set(invoiceRef, {
                    orderId,
                    userId: orderData?.userId,
                    titleId: orderData?.titleId,
                    amount: orderData?.baseAmount,
                    currency: orderData?.currency,
                    paymentId: paymentEntity.id,
                    issuedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                // 6. Create Entitlement (Secure License)
                const entitlementRef = db.collection("entitlements").doc(`${orderData?.userId}_${orderData?.titleId}`);
                t.set(entitlementRef, {
                    userId: orderData?.userId,
                    titleId: orderData?.titleId,
                    orderId,
                    accessGrantedAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: "active"
                });
            });
            await (0, auditLog_1.createAuditLog)("PAYMENT_VERIFIED", orderId, { paymentId: paymentEntity.id }, "SYSTEM");
        }
        else if (payload.event === "payment.failed") {
            const paymentEntity = payload.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            if (orderId) {
                await db.collection("orders").doc(orderId).update({
                    status: "failed",
                    errorReason: paymentEntity.error_description,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                await (0, auditLog_1.createAuditLog)("PAYMENT_FAILED", orderId, { reason: paymentEntity.error_description });
            }
        }
        res.status(200).send("OK");
    }
    catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=verifyWebhook.js.map