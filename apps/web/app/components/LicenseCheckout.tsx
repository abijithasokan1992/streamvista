import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LicenseCheckoutProps {
  assetId: string;
  title: string;
  price: number;
  onSuccess: () => void;
  onClose: () => void;
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const LicenseCheckout: React.FC<LicenseCheckoutProps> = ({
  assetId,
  title,
  price,
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState('');

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(true), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    setLoading(true);
    setStatus('PROCESSING');
    setError('');

    if (!supabase) {
      setError('Authentication is not configured for this deployment.');
      setStatus('ERROR');
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError('Your secure session has expired. Please sign in again.');
      setStatus('ERROR');
      setLoading(false);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Razorpay checkout failed to load.');
      setStatus('ERROR');
      setLoading(false);
      return;
    }

    try {
      const dealResponse = await fetch('/api/marketplace/create-deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titleId: assetId }),
      });
      const dealResult = await dealResponse.json();
      if (!dealResponse.ok || !dealResult?.ok || !dealResult?.data?.deal?.id) {
        throw new Error(dealResult?.error?.message || 'Marketplace deal was not created');
      }

      const dealId = dealResult.data.deal.id;
      const idempotencyKey = `sv_${dealId.replace(/[^A-Za-z0-9]/g, '').slice(0, 48)}_${crypto.randomUUID()}`;

      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          dealId,
          idempotencyKey,
          amount: price,
        }),
      });
      const orderResult = await orderResponse.json();
      if (!orderResponse.ok || !orderResult?.ok || !orderResult?.data?.payment?.provider_order_id || !orderResult?.data?.keyId) {
        throw new Error(orderResult?.error?.message || 'Payment order was not created');
      }

      const payment = orderResult.data.payment;
      const paymentObject = new window.Razorpay({
        key: orderResult.data.keyId,
        amount: Math.round(Number(payment.amount) * 100),
        currency: payment.currency || 'INR',
        name: 'StreamVista · Crayons Bridge',
        description: `License for ${title}`,
        order_id: payment.provider_order_id,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dealId,
                titleId: assetId,
              }),
            });
            const verifyResult = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyResult?.ok || verifyResult?.data?.payment?.status !== 'captured') {
              throw new Error(verifyResult?.error?.message || 'Payment verification failed');
            }
            setStatus('SUCCESS');
            onSuccess();
          } catch (verificationError: any) {
            setError(verificationError?.message || 'Payment verification failed.');
            setStatus('ERROR');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setStatus('IDLE');
            setLoading(false);
          },
        },
        theme: { color: '#D4AF37' },
      });

      paymentObject.on('payment.failed', (paymentError: any) => {
        setError(paymentError?.error?.description || 'Razorpay reported a failed payment.');
        setStatus('ERROR');
        setLoading(false);
      });
      paymentObject.open();
      setLoading(false);
    } catch (paymentError: any) {
      setError(paymentError?.message || 'Could not initiate payment.');
      setStatus('ERROR');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        {status === 'IDLE' && (
          <div className="checkout-content">
            <h2>Secure Licensing</h2>
            <div className="checkout-summary">
              <div className="summary-item"><span>Asset</span><span>{title}</span></div>
              <div className="summary-item"><span>Asset ID</span><span className="mono">{assetId}</span></div>
              <div className="summary-item total"><span>Total Amount</span><span>₹{price.toLocaleString('en-IN')}</span></div>
            </div>
            <p className="legal-note">Payment is verified server-side before any entitlement is granted.</p>
            <div className="checkout-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              <button type="button" className="proceed-btn" onClick={handlePayment} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}
        {status === 'PROCESSING' && (
          <div className="status-view"><Loader2 className="animate-spin w-12 h-12" /><p>Initializing secure transaction…</p></div>
        )}
        {status === 'SUCCESS' && (
          <div className="status-view">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <h3>Payment Verified</h3>
            <p>Your entitlement is being issued.</p>
            <button type="button" className="proceed-btn" onClick={onClose}>Back to Marketplace</button>
          </div>
        )}
        {status === 'ERROR' && (
          <div className="status-view">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3>Transaction Failed</h3>
            <p>{error}</p>
            <button type="button" className="proceed-btn" onClick={() => setStatus('IDLE')}>Try Again</button>
          </div>
        )}
      </div>
      <style>{`
        .checkout-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:2000}
        .checkout-modal{background:var(--obsidian);border:1px solid var(--glass-border);border-radius:12px;padding:40px;width:90%;max-width:500px;box-shadow:var(--glass-shadow)}
        .checkout-content h2{font-family:var(--font-display);color:var(--royal-gold);text-align:center;margin-bottom:30px}
        .checkout-summary{background:rgba(255,255,255,.03);border-radius:8px;padding:24px;margin-bottom:24px}
        .summary-item{display:flex;justify-content:space-between;gap:20px;margin-bottom:12px;font-size:.9rem;color:var(--studio-silver-muted)}
        .summary-item.total{border-top:1px solid rgba(255,255,255,.1);padding-top:12px;margin-top:12px;font-weight:700;color:var(--royal-gold);font-size:1.1rem}
        .mono{font-family:monospace}.legal-note{font-size:.7rem;color:var(--studio-silver-muted);text-align:center;margin-bottom:30px}
        .checkout-actions{display:flex;gap:16px}.cancel-btn{flex:1;border:1px solid rgba(255,255,255,.1);color:var(--studio-silver);padding:12px;border-radius:6px}
        .proceed-btn{flex:2;background:var(--royal-gold);color:var(--obsidian);padding:12px;border-radius:6px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px}
        .status-view{display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center}.status-view h3{color:white}.status-view p{color:var(--studio-silver-muted)}
        .animate-spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

export default LicenseCheckout;