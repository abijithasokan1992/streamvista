import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface LicenseCheckoutProps {
  assetId: string;
  title: string;
  price: number;
  onSuccess: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const LicenseCheckout: React.FC<LicenseCheckoutProps> = ({ assetId, title, price, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setStatus('PROCESSING');
    setError('');

    const token = localStorage.getItem('token');
    const resScript = await loadRazorpayScript();

    if (!token) {
      setError('Your secure session has expired. Please sign in again.');
      setStatus('ERROR');
      setLoading(false);
      return;
    }

    if (!resScript) {
      setError('Razorpay checkout failed to load.');
      setStatus('ERROR');
      setLoading(false);
      return;
    }

    try {
      const orderRes = await axios.post('/api/payments/create-order', {
        amount: price * 100,
        assetId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { order, keyId } = orderRes.data || {};
      if (!order?.id || !keyId) {
        throw new Error('Payment configuration unavailable');
      }

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'StreamVista Marketplace',
        description: `License for ${title}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await axios.post('/api/payments/verify', {
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              assetId,
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!verifyRes.data?.success) {
              throw new Error('Payment verification failed');
            }

            setStatus('SUCCESS');
            onSuccess();
          } catch {
            setError('Payment verification failed.');
            setStatus('ERROR');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatus('IDLE');
          },
        },
        theme: {
          color: '#D4AF37',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Could not initiate payment. Please try again.');
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
              <div className="summary-item">
                <span>Asset</span>
                <span>{title}</span>
              </div>
              <div className="summary-item">
                <span>Asset ID</span>
                <span className="mono">{assetId}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount</span>
                <span>₹{price.toLocaleString()}</span>
              </div>
            </div>
            <p className="legal-note">By clicking proceed, you agree to the StreamVista Master Licensing Agreement (Non-Sublicensable).</p>
            <div className="checkout-actions">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="proceed-btn" onClick={handlePayment} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

        {status === 'PROCESSING' && (
          <div className="status-view">
            <Loader2 className="animate-spin w-12 h-12 text-royal-gold" />
            <p>Initializing Secure Transaction...</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="status-view">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <h3>Payment Successful</h3>
            <p>Your license deed is being generated.</p>
            <button className="proceed-btn" onClick={onClose}>Back to Marketplace</button>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="status-view">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3>Transaction Failed</h3>
            <p>{error}</p>
            <button className="proceed-btn" onClick={() => setStatus('IDLE')}>Try Again</button>
          </div>
        )}
      </div>

      <style>{`
        .checkout-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .checkout-modal {
          background: var(--obsidian);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 40px;
          width: 90%;
          max-width: 500px;
          box-shadow: var(--glass-shadow);
        }

        .checkout-content h2 {
          font-family: var(--font-display);
          color: var(--royal-gold);
          text-align: center;
          margin-bottom: 30px;
        }

        .checkout-summary {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: var(--studio-silver-muted);
        }

        .summary-item.total {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 12px;
          margin-top: 12px;
          font-weight: 700;
          color: var(--royal-gold);
          font-size: 1.1rem;
        }

        .mono { font-family: monospace; }

        .legal-note {
          font-size: 0.7rem;
          color: var(--studio-silver-muted);
          text-align: center;
          margin-bottom: 30px;
        }

        .checkout-actions {
          display: flex;
          gap: 16px;
        }

        .cancel-btn {
          flex: 1;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--studio-silver);
          padding: 12px;
          border-radius: 6px;
        }

        .proceed-btn {
          flex: 2;
          background: var(--royal-gold);
          color: var(--obsidian);
          padding: 12px;
          border-radius: 6px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .status-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          text-align: center;
        }

        .status-view h3 { color: white; }
        .status-view p { color: var(--studio-silver-muted); }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LicenseCheckout;
