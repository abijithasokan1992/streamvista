'use client';

import { useState, useEffect } from 'react';
import { Package, MapPin, AlertTriangle, ArrowRightLeft, Search, Filter, Plus, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface InventoryItem {
  INVENTORY_ID: number;
  PRODUCT_NAME: string;
  SKU: string;
  QUANTITY: number;
  RESERVED_QUANTITY: number;
  BIN_LOCATION: string;
  WAREHOUSE_NAME: string;
}

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const [invRes, alertRes] = await Promise.all([
          api.get('/products'), // Default to all products for listing
          api.get('/inventory/alerts?threshold=10')
        ]);
        
        // In a real scenario, we'd have a specific /inventory/all endpoint
        // For now, we'll fetch inventory for the first few products to populate
        setAlerts(alertRes.data);
      } catch (err) {
        console.error('Failed to fetch inventory data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventoryData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Inventory Management</h1>
          <p className="text-zinc-500 mt-1">Monitor stock levels and manage warehouse locations.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all text-sm shadow-lg shadow-zinc-900/10">
            <Plus className="w-4 h-4" /> Add Stock
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-600 font-bold rounded-xl hover:bg-zinc-50 transition-all text-sm">
            <ArrowRightLeft className="w-4 h-4" /> Transfer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search by SKU, Part No, or Location..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Part Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Warehouse</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">In Stock</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4 h-16 bg-white" />
                      </tr>
                    ))
                  ) : (
                    /* Mocking some rows for visual representation */
                    [
                      { id: 1, name: 'Brake Pad Set', sku: 'BK-4552', wh: 'MUM-01', qty: 45, bin: 'RACK-A4', status: 'Optimal' },
                      { id: 2, name: 'Oil Filter - Synthetic', sku: 'OF-9901', wh: 'MUM-01', qty: 8, bin: 'RACK-B2', status: 'Low Stock' },
                      { id: 3, name: 'Spark Plug Platinum', sku: 'SP-1022', wh: 'BLR-02', qty: 156, bin: 'BIN-12', status: 'Optimal' },
                      { id: 4, name: 'Air Filter Element', sku: 'AF-5520', wh: 'MUM-01', qty: 2, bin: 'RACK-A2', status: 'Critical' },
                    ].map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                          <p className="text-[10px] font-mono text-zinc-400">{item.sku}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            {item.wh}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-black text-zinc-900">{item.qty}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold rounded uppercase tracking-tighter">
                            {item.bin}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'Optimal' ? 'bg-green-50 text-green-600' :
                            item.status === 'Low Stock' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Critical Alerts</h2>
            </div>
            
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert: any, idx: number) => (
                  <div key={idx} className="p-4 bg-zinc-800 rounded-2xl border border-zinc-700">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-zinc-100">{alert.PRODUCT_NAME}</p>
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-black rounded uppercase">
                        {alert.QUANTITY} Left
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500">{alert.WAREHOUSE_NAME} • {alert.BIN_LOCATION}</p>
                    <button className="mt-3 w-full py-2 bg-zinc-700 hover:bg-zinc-600 text-[10px] font-bold text-zinc-300 rounded-lg transition-colors">
                      Quick Restock
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-xs text-zinc-500 italic">No critical alerts today.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" /> Recent Transfers
            </h2>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-6 border-l-2 border-zinc-100 last:pb-0 pb-6">
                  <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-600" />
                  <p className="text-xs font-bold text-zinc-900">50x Brake Pads</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-tighter">
                    MUM-01 <ArrowRightLeft className="inline-block w-2 h-2 mx-1" /> BLR-02
                  </p>
                  <p className="text-[9px] text-zinc-300 mt-2 font-medium">Completed • 2h ago</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
