'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, Search, Filter, ChevronRight, Package, User, MapPin } from 'lucide-react';
import api from '@/lib/api';

interface Order {
  ORDER_ID: number;
  TOTAL_AMOUNT: number;
  STATUS: string;
  CREATED_AT: string;
  CUSTOMER_NAME?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real scenario, this would be /admin/orders
        const { data } = await api.get('/orders/customer/1'); // Mocking for now
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PACKED': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'SHIPPED': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Order Fulfillment</h1>
          <p className="text-zinc-500 mt-1">Manage picking, packing, and dispatch workflows.</p>
        </div>
        <div className="flex bg-white border border-zinc-200 p-1 rounded-xl shadow-sm">
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900">12</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">To Pick</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900">8</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">To Pack</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900">24</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">In Transit</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900">142</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Completed</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Warehouse</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-16 bg-white" />
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.ORDER_ID} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-zinc-900">#OS-{order.ORDER_ID}</p>
                      <p className="text-[10px] text-zinc-400">{new Date(order.CREATED_AT).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                          {order.CUSTOMER_NAME ? order.CUSTOMER_NAME.charAt(0) : 'C'}
                        </div>
                        <p className="text-xs font-bold text-zinc-600">{order.CUSTOMER_NAME || 'Auto Customer'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-zinc-900">₹{order.TOTAL_AMOUNT.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg border text-[10px] font-black tracking-tight ${getStatusColor(order.STATUS)}`}>
                        {order.STATUS}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
                        <MapPin className="w-3 h-3" /> MUM-01
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Static mock data if API returns empty for this user/tenant context */
                [
                  { id: 452, customer: 'Abijith Asokan', amount: 4520, status: 'CONFIRMED', date: '2026-07-02' },
                  { id: 451, customer: 'Rajesh Kumar', amount: 12800, status: 'PACKED', date: '2026-07-02' },
                  { id: 450, customer: 'StreamVista Fleet', amount: 89000, status: 'SHIPPED', date: '2026-07-01' },
                ].map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-zinc-900">#OS-{order.id}</p>
                      <p className="text-[10px] text-zinc-400">{order.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                          {order.customer.charAt(0)}
                        </div>
                        <p className="text-xs font-bold text-zinc-600">{order.customer}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-zinc-900">₹{order.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg border text-[10px] font-black tracking-tight ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
                        <MapPin className="w-3 h-3" /> MUM-01
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
