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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto_1 = __importDefault(require("crypto"));
const auditLog_1 = require("../utils/auditLog");
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";
exports.verifyWebhook = functions.https.onRequest(async (req, res) => {
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
    const expectedSignature = crypto_1.default
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");
    if (signature !== expectedSignature && RAZORPAY_WEBHOOK_SECRET !== "mock_webhook_secret") {
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
            const paymentRef = db.collection("payments").doc(orderId);
            // Update payment state securely from the backend via Webhook
            await paymentRef.update({
                status: "captured",
                paymentId: paymentEntity.id,
                method: paymentEntity.method,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // Grant access logic can go here or trigger another function based on 'payments' update
            const paymentDoc = await paymentRef.get();
            if (paymentDoc.exists) {
                const data = paymentDoc.data();
                await (0, auditLog_1.createAuditLog)("PAYMENT_VERIFIED", orderId, { paymentId: paymentEntity.id }, data?.userId);
            }
        }
        else if (payload.event === "payment.failed") {
            const paymentEntity = payload.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            if (orderId) {
                await db.collection("payments").doc(orderId).update({
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