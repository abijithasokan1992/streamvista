import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Razorpay from "razorpay";
import { createAuditLog } from "../utils/auditLog";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID!,
  key_secret: RAZORPAY_KEY_SECRET!,
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
    
    // 1. Fetch Dynamic Platform Configuration (Commission Rate)
    // Fallback to 0.35 if config is missing, but log a warning.
    let platformCommissionRate = 0.35; 
    const configDoc = await db.collection("settings").doc("finance").get();
    if (configDoc.exists) {
      platformCommissionRate = configDoc.data()?.platformCommissionRate || 0.35;
    } else {
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

    // Call actual Razorpay API (Test Mode)
    const order = await razorpay.orders.create(options);

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

    await createAuditLog(
      "PAYMENT_ORDER_CREATED", 
      order.id, 
      { amount, titleId, commissionRate: platformCommissionRate }, 
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
