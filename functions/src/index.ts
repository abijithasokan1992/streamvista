import * as admin from "firebase-admin";
import { createOrder } from "./razorpay/createOrder";
import { verifyWebhook } from "./razorpay/verifyWebhook";
import { getWalletSummary, requestSettlement } from "./finance";
import { InstagramController } from "./instagram/instagramController";

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export functions
export const razorpay = {
  createOrder,
  verifyWebhook
};

export const finance = {
  getWalletSummary,
  requestSettlement
};

export const instagram = {
  InstagramController
};


