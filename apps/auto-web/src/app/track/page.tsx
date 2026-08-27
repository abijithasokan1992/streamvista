'use client';

import { useState } from 'react';
import { Truck, Search, Package, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    } catch (err) {
      alert('Order not found');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Track Your Order</h1>
        <p className="text-zinc-500">Enter your order ID to see the status of your shipment.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2">
        <input 
          type="text" 
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. #OS-452"
          className="flex-1 px-4 py-4 bg-white border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all flex items-center gap-2">
          {isLoading ? '...' : <Search className="w-5 h-5" />} Track
        </button>
      </form>

      {order && (
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-lg shadow-zinc-200/50 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Order Status: <span className="text-blue-600">{order.STATUS}</span></h2>
            <Truck className="w-8 h-8 text-zinc-300" />
          </div>
          
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.item_id} className="flex justify-between items-center py-4 border-b">
                <div className="flex items-center gap-3">
                  <Package className="text-zinc-400" />
                  <p className="font-medium text-zinc-900">{item.product_name}</p>
                </div>
                <p className="font-bold">x{item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
