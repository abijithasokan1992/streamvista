import * as admin from "firebase-admin";
import { createOrder } from "./razorpay/createOrder";
import { verifyWebhook } from "./razorpay/verifyWebhook";

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export functions
export const razorpay = {
  createOrder,
  verifyWebhook
};
