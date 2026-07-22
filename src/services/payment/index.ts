import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../lib/firebase";

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export const paymentService = {
  async createOrder(titleId: string, amount: number): Promise<PaymentOrderResult> {
    const isMock = import.meta.env.VITE_DATA_MODE === "mock";
    
    if (isMock || !app) {
      console.log(`[Mock] Creating payment order for Title: ${titleId}, Amount: ${amount}`);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        orderId: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        keyId: "rzp_test_mock"
      };
    }

    try {
      const functions = getFunctions(app);
      const createOrderCallable = httpsCallable<any, PaymentOrderResult>(functions, "createOrder");
      const result = await createOrderCallable({ titleId, amount, currency: "INR" });
      return result.data;
    } catch (error) {
      console.error("Failed to create order via Cloud Functions:", error);
      throw error;
    }
  },

  async verifyMockPayment(orderId: string): Promise<boolean> {
    // In real mode, Razorpay webhooks handle the verification in the backend.
    // This is ONLY for resolving mock UI states quickly.
    console.log(`[Mock] Verifying payment for order: ${orderId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
};
