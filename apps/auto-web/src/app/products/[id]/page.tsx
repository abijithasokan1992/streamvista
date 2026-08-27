'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Package, ShieldCheck, Truck, RotateCcw, CheckCircle2, ShoppingCart, ChevronRight, Info } from 'lucide-react';
import api from '@/lib/api';

interface Compatibility {
  MAKE: string;
  MODEL: string;
  YEAR_START: number;
  YEAR_END: number;
  ENGINE_TYPE: string;
}

interface Product {
  PRODUCT_ID: number;
  PRODUCT_NAME: string;
  SKU: string;
  PART_NUMBER: string;
  OEM_NUMBER: string;
  PRICE: number;
  TAX_RATE: number;
  BRAND_NAME: string;
  CATEGORY_NAME: string;
  DESCRIPTION: string;
  compatibility: Compatibility[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="aspect-square bg-zinc-100 rounded-3xl" />
      <div className="space-y-4">
        <div className="h-8 bg-zinc-100 rounded w-3/4" />
        <div className="h-4 bg-zinc-100 rounded w-1/2" />
        <div className="h-20 bg-zinc-100 rounded" />
      </div>
    </div>
  </div>;

  if (!product) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Info className="w-12 h-12 text-zinc-300 mb-4" />
      <h2 className="text-xl font-bold text-zinc-900">Product Not Found</h2>
      <p className="text-zinc-500">The part you are looking for does not exist or has been removed.</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Placeholder */}
        <div className="aspect-square bg-zinc-50 rounded-3xl border border-zinc-200 flex items-center justify-center relative overflow-hidden group">
          <Package className="w-32 h-32 text-zinc-200 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md border border-zinc-100 rounded-xl text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {product.BRAND_NAME} Official Part
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">
              {product.CATEGORY_NAME} <ChevronRight className="w-3 h-3" /> {product.BRAND_NAME}
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 leading-tight mb-4">{product.PRODUCT_NAME}</h1>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <p>Part No: <span className="font-mono text-zinc-900 font-semibold">{product.PART_NUMBER}</span></p>
              <p>OEM: <span className="font-mono text-zinc-900 font-semibold">{product.OEM_NUMBER}</span></p>
            </div>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-6 mb-8 border border-zinc-100">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-zinc-900">₹{product.PRICE.toLocaleString()}</span>
              <span className="text-zinc-500 text-sm">incl. {product.TAX_RATE}% GST</span>
            </div>
            <p className="text-green-600 text-sm font-semibold flex items-center gap-1.5 mb-6">
              <CheckCircle2 className="w-4 h-4" /> In Stock - Ready to Ship
            </p>
            
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button className="px-6 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-bold py-4 rounded-xl transition-all active:scale-[0.98]">
                Buy Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-[10px] font-bold text-zinc-900 uppercase">Genuine Part</p>
              <p className="text-[10px] text-zinc-500">100% Verified</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
              <Truck className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-[10px] font-bold text-zinc-900 uppercase">Fast Delivery</p>
              <p className="text-[10px] text-zinc-500">2-3 Days ETA</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
              <RotateCcw className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-[10px] font-bold text-zinc-900 uppercase">Easy Returns</p>
              <p className="text-[10px] text-zinc-500">10 Days Policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Description</h2>
            <div className="prose prose-zinc max-w-none">
              <p className="text-zinc-600 leading-relaxed">
                {product.DESCRIPTION || "High-quality automotive spare part engineered for performance and durability. This genuine part meets or exceeds OEM specifications for a perfect fit and long-lasting service life."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Technical Specifications</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="flex flex-col">
                <span className="text-zinc-400">SKU</span>
                <span className="font-semibold text-zinc-900">{product.SKU}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-400">Brand</span>
                <span className="font-semibold text-zinc-900">{product.BRAND_NAME}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-400">Category</span>
                <span className="font-semibold text-zinc-900">{product.CATEGORY_NAME}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-400">Condition</span>
                <span className="font-semibold text-zinc-900">New</span>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <div className="bg-zinc-900 text-white rounded-3xl p-8 sticky top-24">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" /> Vehicle Compatibility
            </h2>
            <div className="space-y-6">
              {product.compatibility && product.compatibility.length > 0 ? (
                product.compatibility.map((comp, idx) => (
                  <div key={idx} className="border-l-2 border-zinc-700 pl-4 space-y-1">
                    <p className="text-sm font-bold text-zinc-100">{comp.MAKE} {comp.MODEL}</p>
                    <p className="text-xs text-zinc-400">{comp.YEAR_START} - {comp.YEAR_END}</p>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">{comp.ENGINE_TYPE}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-zinc-500 text-sm italic">Universal Fit / No specific data</p>
                </div>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-500 leading-tight">
                Disclaimer: Compatibility data is for reference only. Please verify with your vehicle manual or professional mechanic before purchase.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
