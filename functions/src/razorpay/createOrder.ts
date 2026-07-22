import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Razorpay from "razorpay";
import { createAuditLog } from "../utils/auditLog";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_mock";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "mock_secret";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const createOrder = functions.https.onCall(async (data, context) => {
  // Enforce authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to create a payment order."
    );
  }

  const { amount, currency = "INR", titleId, receiptId } = data;

  if (!amount || !titleId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Amount and titleId are required."
    );
  }

  try {
    const db = admin.firestore();
    
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
    } else {
      // Call actual Razorpay API (Test Mode)
      order = await razorpay.orders.create(options);
    }

    // Save initial payment intent to Firestore
    const paymentRef = db.collection("payments").doc(order.id);
    await paymentRef.set({
      userId: context.auth.uid,
      titleId,
      amount,
      currency,
      status: "created",
      orderId: order.id,
      receiptId: options.receipt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await createAuditLog(
      "PAYMENT_ORDER_CREATED", 
      order.id, 
      { amount, titleId }, 
      context.auth.uid
    );

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID
    };

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new functions.https.HttpsError("internal", "Failed to create payment order.");
  }
});
