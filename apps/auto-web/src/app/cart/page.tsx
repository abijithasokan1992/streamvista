'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package, Truck } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-zinc-200">
        <div className="p-6 bg-zinc-50 rounded-full mb-6">
          <ShoppingBag className="w-12 h-12 text-zinc-300" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Your cart is empty</h2>
        <p className="text-zinc-500 mt-2 max-w-sm text-center">
          Looks like you haven&apos;t added any parts to your cart yet. Browse our catalog to find the right parts for your vehicle.
        </p>
        <Link 
          href="/products" 
          className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Shopping Cart</h1>
        <p className="text-zinc-500 mt-1">Review your items before proceeding to checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.PRODUCT_ID} className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col md:flex-row gap-6 hover:shadow-lg hover:shadow-zinc-200/50 transition-shadow">
              <div className="w-24 h-24 bg-zinc-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-zinc-200" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.BRAND_NAME}</p>
                      <h3 className="text-lg font-bold text-zinc-900 leading-tight">{item.PRODUCT_NAME}</h3>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.PRODUCT_ID)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-100 p-1 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.PRODUCT_ID, item.quantity - 1)}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-zinc-600 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-zinc-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.PRODUCT_ID, item.quantity + 1)}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-zinc-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Unit: ₹{item.PRICE.toLocaleString()}</p>
                    <p className="text-xl font-bold text-zinc-900">₹{(item.PRICE * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside>
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 sticky top-24 shadow-xl shadow-zinc-200/50">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>GST (18%)</span>
                <span className="font-semibold text-zinc-900">₹{(cartTotal * 0.18).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span className="text-green-600 font-bold uppercase tracking-tighter">Free</span>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-baseline">
                <span className="text-lg font-bold text-zinc-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600">₹{(cartTotal * 1.18).toLocaleString()}</span>
                  <p className="text-[10px] text-zinc-400">Tax included</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link 
                href="/checkout"
                className="w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/25 active:scale-[0.98]"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                <Truck className="w-5 h-5 text-zinc-400" />
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Standard delivery available. Est: 2-4 business days.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
