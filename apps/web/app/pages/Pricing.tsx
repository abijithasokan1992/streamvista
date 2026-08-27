import React from 'react';
import { CreditCard, Zap, Crown, Check } from 'lucide-react';

export default function Pricing() {
  const plans = [
    { name: 'FREE_TIER', price: '₹0', features: ['1GB Storage', 'Standard QC', 'Basic Metadata'], color: 'zinc' },
    { name: 'CREATOR_PRO', price: '₹999', features: ['10GB Storage', 'Advanced QC', 'Vertical Optimization', 'Distribution Constraints'], color: 'cyan' },
    { name: 'STUDIO_ULTRA', price: '₹4999', features: ['100GB Storage', 'Manual Human Audit', 'AI Auto-Sort', 'Direct Bridge Priority'], color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-cyan-400 font-mono p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tighter mb-4">SUBSCRIPTION_MODELS</h1>
          <p className="text-zinc-500 uppercase text-xs tracking-[0.2em]">Select your operational capacity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`p-8 border ${plan.name === 'CREATOR_PRO' ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-cyan-900/30'} bg-black/40 rounded-xl flex flex-col`}>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-white mb-2">{plan.price}<span className="text-xs text-zinc-500 font-normal ml-2">/month</span></div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-xs">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-3 rounded font-bold transition-all ${
                plan.name === 'CREATOR_PRO' ? 'bg-cyan-600 text-black hover:bg-cyan-500' : 'bg-zinc-900 text-cyan-400 hover:bg-zinc-800 border border-cyan-900/30'
              }`}>
                {plan.name === 'FREE_TIER' ? 'CURRENT_PLAN' : 'UPGRADE_NOW'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
