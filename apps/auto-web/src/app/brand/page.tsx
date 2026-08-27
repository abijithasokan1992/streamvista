'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, AlertCircle, Search } from 'lucide-react';
import api from '@/lib/api';

export default function BrandDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        // In a real scenario, the backend would extract brandId from JWT
        const { data } = await api.get('/products'); 
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch brand data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrandData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Brand Portal</h1>
        <p className="text-zinc-500 mt-1">Real-time visibility into your inventory and sales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Products" value={products.length.toString()} icon={<Package />} color="blue" />
        <StatCard title="Total Stock Units" value="1,248" icon={<TrendingUp />} color="green" />
        <StatCard title="Pending Settlements" value="₹4,25,000" icon={<DollarSign />} color="orange" />
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">Your Catalog</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Part Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SKU</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Stock</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr key={product.PRODUCT_ID} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-zinc-900">{product.PRODUCT_NAME}</td>
                <td className="px-6 py-4 text-[10px] font-mono text-zinc-500">{product.SKU}</td>
                <td className="px-6 py-4 text-center text-sm font-black">{Math.floor(Math.random() * 100)}</td>
                <td className="px-6 py-4 text-sm text-zinc-900">₹{product.PRICE.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-zinc-900">{value}</p>
      </div>
    </div>
  );
}
