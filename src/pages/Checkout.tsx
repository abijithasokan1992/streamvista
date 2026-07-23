import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Loader2, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { functions } from "../services/firebase";
import { httpsCallable } from "firebase/functions";

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load Razorpay Script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    async function load() {
      if (!id) return;
      try {
        const data = await databaseService.getTitleById(id);
        setTitle(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();

    return () => {
      document.body.removeChild(script);
    };
  }, [id]);

  const handleCheckout = async () => {
    if (!title || !user) return;
    setProcessing(true);

    try {
      // 1. Create Order via Firebase Cloud Functions
      const createOrder = httpsCallable(functions, 'createOrder');
      const response = await createOrder({
        amount: title.price,
        titleId: title.id,
      });

      const orderData = (response.data as any);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StreamVista OS",
        description: `Acquisition: ${title.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            console.log("Payment successful, verifying on backend...");
            // Backend handles actual ledger entry via webhook, 
            // but we can poll for completion or show a success screen.
            alert(`Payment successful! Order ID: ${response.razorpay_order_id}. Processing on backend...`);
            navigate("/buyer");
          } catch (e) {
            console.error(e);
            alert("Error verifying payment");
          }
        },
        prefill: {
          email: user?.email || "",
        },
        theme: {
          color: "#D4AF37"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setProcessing(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Checkout failed");
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold h-12 w-12" /></div>;
  }

  if (!title) return <div>Title not found</div>;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful</h1>
        <p className="text-slate-400 mb-8">
          The transaction has been captured. Our backend is verifying the webhook.
          Once verified, you will receive an invoice and the entitlement will be activated in your portal.
        </p>
        <Button variant="primary" onClick={() => navigate('/buyer')}>Go to My Screenings</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Button variant="secondary" className="mb-6" onClick={() => navigate(`/buyer/title/${title.id}`)}>
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-6">Secure Checkout</h1>
          <Card className="bg-brand-navy border-white/10 mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img src={title.posterUrl} className="w-20 h-30 object-cover rounded" alt="Poster" />
                <div>
                  <h3 className="font-bold text-lg text-white">{title.title}</h3>
                  <p className="text-sm text-slate-400">{title.contentType} • {title.licensingModel}</p>
                </div>
              </div>
              <div className="border-t border-white/10 mt-6 pt-4 flex justify-between items-center">
                <span className="text-slate-300">Total Price</span>
                <span className="text-2xl font-bold text-brand-gold">₹{title.price?.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-brand-navy-light/50 border-brand-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={18} className="text-brand-gold" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <h4 className="font-medium text-white mb-2">License Agreement</h4>
                  <p className="text-xs text-slate-400 mb-4 h-24 overflow-y-auto pr-2">
                    By proceeding with this transaction, you agree to the StreamVista OS Master Terms of Service.
                    This license grants you the rights specified in the selected model ({title.licensingModel}) for the territories ({title.rightsAvailable?.join(", ")}).
                    All payments are securely processed and irrevocably posted to the StreamVista distributed ledger.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                    />
                    <span className="text-sm text-slate-300">I have read and agree to the License Agreement</span>
                  </label>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full py-6 text-lg bg-brand-gold text-brand-navy hover:bg-yellow-500 font-bold"
                  disabled={!agreed || processing}
                  onClick={handleCheckout}
                >
                  {processing ? <Loader2 className="animate-spin mr-2" /> : null}
                  {processing ? "Processing..." : `Pay ₹${title.price?.toLocaleString()}`}
                </Button>
                
                <p className="text-xs text-center text-slate-500 mt-4">
                  Secured by Razorpay Test Mode. Do not use real card details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
