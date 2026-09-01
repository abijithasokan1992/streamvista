'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="text-3xl font-black text-zinc-900 text-center mb-2">Order Confirmed!</h1>
      <p className="text-zinc-500 text-center max-w-md mb-12">
        Thank you for your purchase. Your order <span className="font-mono font-bold text-zinc-900">#OS-{orderId}</span> has been successfully placed and is being processed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        <Link 
          href="/products"
          className="flex items-center justify-center gap-2 p-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all group"
        >
          Continue Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <button className="flex items-center justify-center gap-2 p-4 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-50 transition-all">
          <Download className="w-4 h-4" /> Download Invoice
        </button>
      </div>

      <div className="mt-16 p-6 bg-zinc-50 rounded-3xl border border-zinc-100 w-full max-w-lg flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900">What&apos;s next?</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            You will receive an email confirmation shortly. Our warehouse team will begin picking and packing your items. You can track your delivery status in your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
