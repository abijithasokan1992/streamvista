import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * StreamVista Payment Gateway Service
 * Handles Razorpay order creation and payment verification.
 */
class PaymentService {
    private razorpay: any;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
        });
    }

    /**
     * Create a new order for a film asset license or subscription.
     * @param amount - Amount in paise (e.g., 50000 for ₹500.00)
     * @param currency - Default 'INR'
     * @param receipt - Unique identifier for the transaction
     */
    async createOrder(amount: number, currency: string = 'INR', receipt: string) {
        const options = {
            amount: amount,
            currency: currency,
            receipt: receipt,
        };
        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        } catch (error) {
            console.error('Razorpay Order Creation Error:', error);
            throw error;
        }
    }

    /**
     * Verify the payment signature received from the frontend.
     */
    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string);
        hmac.update(orderId + "|" + paymentId);
        const generated_signature = hmac.digest('hex');
        return generated_signature === signature;
    }
}

export const paymentService = new PaymentService();
