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
exports.createOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const razorpay_1 = __importDefault(require("razorpay"));
const auditLog_1 = require("../utils/auditLog");
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_mock";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
const razorpay = new razorpay_1.default({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});
exports.createOrder = functions.https.onCall(async (data, context) => {
    // Enforce authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to create a payment order.");
    }
    const { amount, currency = "INR", titleId, receiptId } = data;
    if (!amount || !titleId) {
        throw new functions.https.HttpsError("invalid-argument", "Amount and titleId are required.");
    }
    try {
        const db = admin.firestore();
        // 1. Fetch Dynamic Platform Configuration (Commission Rate)
        // Fallback to 0.35 if config is missing, but log a warning.
        let platformCommissionRate = 0.35;
        const configDoc = await db.collection("settings").doc("finance").get();
        if (configDoc.exists) {
            platformCommissionRate = configDoc.data()?.platformCommissionRate || 0.35;
        }
        else {
            console.warn("Finance settings not found. Falling back to default commission rate 35%.");
        }
        // 2. Fetch Title details (to ensure it exists and get creator ID)
        const titleDoc = await db.collection("titles").doc(titleId).get();
        if (!titleDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Title not found.");
        }
        const titleData = titleDoc.data();
        const creatorId = titleData?.creatorOwnerId;
        if (!creatorId) {
            throw new functions.https.HttpsError("failed-precondition", "Title missing creator owner.");
        }
        // Calculate distributions
        const commissionAmount = amount * platformCommissionRate;
        const creatorPayable = amount - commissionAmount;
        // Idempotency / Order prep
        const options = {
            amount: Math.round(amount * 100), // convert to smallest currency unit (paise)
            currency,
            receipt: receiptId || `rcpt_${Date.now()}`,
            notes: {
                titleId,
                userId: context.auth.uid
            }
        };
        let order;
        // If we are fully mocked (no real key), return a mock order
        if (RAZORPAY_KEY_ID === "rzp_test_mock") {
            order = {
                id: `order_mock_${Date.now()}`,
                amount: options.amount,
                currency: options.currency,
                receipt: options.receipt,
                status: "created"
            };
        }
        else {
            // Call actual Razorpay API (Test Mode)
            order = await razorpay.orders.create(options);
        }
        // Save Immutable Pricing Snapshot & Order Intent to Firestore
        const orderRef = db.collection("orders").doc(order.id);
        await orderRef.set({
            userId: context.auth.uid, // Buyer
            creatorId, // Seller
            titleId,
            baseAmount: amount,
            currency,
            platformCommissionRate,
            commissionAmount,
            creatorPayable,
            status: "created",
            orderId: order.id,
            receiptId: options.receipt,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await (0, auditLog_1.createAuditLog)("PAYMENT_ORDER_CREATED", order.id, { amount, titleId, commissionRate: platformCommissionRate }, context.auth.uid);
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: RAZORPAY_KEY_ID
        };
    }
    catch (error) {
        console.error("Error creating Razorpay order:", error);
        throw new functions.https.HttpsError("internal", "Failed to create payment order.");
    }
});
//# sourceMappingURL=createOrder.js.map