import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { supabase, getFreshSession } from '../lib/supabase';
import { startPlanCheckout, type PaidCycle } from '../lib/pay';

const PLANS: Array<{
  cycle: PaidCycle | 'free';
  name: string;
  price: string;
  note: string;
  features: string[];
}> = [
  {
    cycle: 'free',
    name: 'Free',
    price: '₹0',
    note: 'workspace only',
    features: ['Login + profile', 'No paid storage pack'],
  },
  {
    cycle: 'creator',
    name: 'Creator',
    price: '₹767',
    note: '₹650 + 18% GST / TB / month',
    features: ['1 TB included', 'Server-priced via Razorpay', 'Unlocks paid studio tier'],
  },
  {
    cycle: 'topup',
    name: '1 TB top-up',
    price: '₹767',
    note: 'one-shot extra TB',
    features: ['Same GST-inclusive price', 'PAYG block', 'Requires login'],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const buy = async (cycle: PaidCycle) => {
    setMessage(null);
    if (!supabase) {
      setMessage('Auth is not configured');
      return;
    }
    const session = await getFreshSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setBusy(cycle);
    const result = await startPlanCheckout(cycle);
    setBusy(null);
    if (!result.ok) setMessage(result.error ?? 'Payment failed');
    else {
      setMessage('Payment verified. Plan unlocked.');
      navigate('/creator-studio');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-cyan-400 p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Plans</h1>
          <p className="text-zinc-500 uppercase text-xs tracking-[0.2em]">
            Live Razorpay · price from server · INR
          </p>
        </div>

        {message && (
          <p className="mb-8 rounded-lg border border-cyan-900/40 bg-black/40 p-3 text-sm text-zinc-200 text-center">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 border ${
                plan.cycle === 'creator'
                  ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                  : 'border-cyan-900/30'
              } bg-black/40 rounded-xl flex flex-col`}
            >
              <h3 className="text-xl font-bold mb-1 text-white">{plan.name}</h3>
              <div className="text-3xl font-bold text-white mb-1">
                {plan.price}
                {plan.cycle !== 'free' && (
                  <span className="text-xs text-zinc-500 font-normal ml-2">incl. GST</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mb-6">{plan.note}</p>
              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
              {plan.cycle === 'free' ? (
                <a
                  href="/signup"
                  className="w-full py-3 rounded font-bold text-center bg-zinc-900 text-cyan-400 border border-cyan-900/30"
                >
                  Create account
                </a>
              ) : (
                <button
                  disabled={busy !== null}
                  onClick={() => buy(plan.cycle)}
                  className="w-full py-3 rounded font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60"
                >
                  {busy === plan.cycle ? 'Opening Razorpay…' : 'Pay with Razorpay'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
