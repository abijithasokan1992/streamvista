import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * StreamVista Payment Gateway Service
 * Handles Razorpay order creation and payment verification.
 */
class PaymentService {
    private razorpay: Razorpay;

    constructor() {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            throw new Error('Razorpay server credentials are not configured');
        }

        this.razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
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
            amount,
            currency,
            receipt,
        };
        try {
            return await this.razorpay.orders.create(options);
        } catch (error) {
            console.error('Razorpay Order Creation Error:', error);
            throw error;
        }
    }

    /**
     * Verify the payment signature received from the frontend.
     */
    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) return false;

        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(`${orderId}|${paymentId}`);
        const generatedSignature = hmac.digest('hex');
        return crypto.timingSafeEqual(
            Buffer.from(generatedSignature, 'utf8'),
            Buffer.from(signature, 'utf8'),
        );
    }
}

export const paymentService = new PaymentService();
