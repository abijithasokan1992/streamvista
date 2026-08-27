'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, MapPin, CreditCard, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    const totalWithTax = cartTotal * 1.18;

    try {
      // 1. Create Razorpay Order on Backend
      const { data: rpOrder } = await api.post('/payments/create-order', {
        amount: totalWithTax
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'AutoOS Platform',
        description: 'Order Payment',
        order_id: rpOrder.id,
        handler: async (response: any) => {
          try {
            // 3. Verify Payment and Create Order on Backend
            const { data } = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                customerId: 1, // Mock customer ID
                totalAmount: totalWithTax,
                items: cart,
                address
              }
            });

            if (data.success) {
              clearCart();
              router.push(`/checkout/success?id=${data.orderId}`);
            }
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Order placement failed:', err);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) return null; // Should redirect to cart

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Checkout</h1>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <span className={step === 1 ? 'text-blue-600' : ''}>Shipping</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 2 ? 'text-blue-600' : ''}>Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {step === 1 ? (
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={address.fullName}
                    onChange={(e) => setAddress({...address, fullName: e.target.value})}
                    placeholder="John Doe" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Street Address</label>
                  <input 
                    type="text" 
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    placeholder="123, Street Name" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">City</label>
                  <input 
                    type="text" 
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    placeholder="Mumbai" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Zip Code</label>
                  <input 
                    type="text" 
                    value={address.zipCode}
                    onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    placeholder="400001" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-[0.98]"
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Payment Method</h2>
              </div>

              <div className="p-6 border-2 border-blue-500 bg-blue-50/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-zinc-900 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase italic">
                    Razorpay
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Razorpay Secure Checkout</p>
                    <p className="text-xs text-zinc-500">Cards, UPI, Netbanking, Wallet</p>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Your payment is secured by Razorpay. We do not store any of your credit card details. All transactions are 100% encrypted.
                </p>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay ₹{(cartTotal * 1.18).toLocaleString()}</>}
              </button>

              <button 
                onClick={() => setStep(1)}
                className="w-full py-2 text-zinc-400 text-sm font-medium hover:text-zinc-600 transition-colors"
              >
                Back to Shipping
              </button>
            </div>
          )}
        </div>

        <aside>
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 sticky top-24 shadow-xl shadow-zinc-200/50">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Order Details</h2>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.PRODUCT_ID} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-zinc-300">x{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-zinc-900 truncate">{item.PRODUCT_NAME}</p>
                    <p className="text-[10px] text-zinc-400">₹{item.PRICE.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-zinc-100 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>GST (18%)</span>
                <span className="font-semibold text-zinc-900">₹{(cartTotal * 0.18).toLocaleString()}</span>
              </div>
              <div className="pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-zinc-900">Total</span>
                <span className="text-xl font-black text-blue-600">₹{(cartTotal * 1.18).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
