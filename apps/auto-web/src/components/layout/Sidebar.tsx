'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Package, ShoppingBag, Truck, BarChart3, Users, Settings, Sparkles } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin' },
  { icon: Sparkles, label: 'AI Agents', href: '/admin/agents' },
  { icon: Package, label: 'Brand Portal', href: '/brand' },
  { icon: Package, label: 'Inventory', href: '/admin/inventory' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: Truck, label: 'Logistics', href: '/admin/logistics' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem('token'));
  }, []);

  if (!isAdmin) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-white border-r border-zinc-200">
      <div className="p-4 flex flex-col gap-1">
        {menuItems.map((item) => (
          <Link 
            key={item.label}
            href={item.href} 
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
