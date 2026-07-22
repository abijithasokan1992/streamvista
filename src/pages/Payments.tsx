import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CreditCard, Loader2 } from "lucide-react";
import { paymentService } from "../services/payment";

export default function Payments() {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please wait.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on the backend
      const orderData = await paymentService.createOrder("test-title-123", 499); // $4.99 equivalent

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StreamVista",
        description: "Test Transaction",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // In real setup, the webhook handles this securely.
          // For local mock we can trigger a state update.
          alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
          if (import.meta.env.VITE_DATA_MODE === "mock") {
             await paymentService.verifyMockPayment(response.razorpay_order_id);
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#F59E0B" // brand-gold
        }
      };

      if (options.key === "rzp_test_mock") {
        // Mocking the checkout window for totally offline mock mode
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_order_id: options.order_id,
            razorpay_signature: "mock_signature"
          });
        }, 1500);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error) {
      console.error(error);
      alert("Payment failed to initialize.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Payments & Revenue</h1>
        <p className="text-slate-400">Track financial transactions, payouts, and title revenue securely.</p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4">
            <CreditCard size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Razorpay Checkout Test</h3>
          <p className="text-slate-400 max-w-md mb-6">Click below to test the secure Razorpay integration flow.</p>
          <Button onClick={handlePayment} disabled={loading || !razorpayLoaded} className="min-w-[150px]">
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Test Payment (₹499)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
