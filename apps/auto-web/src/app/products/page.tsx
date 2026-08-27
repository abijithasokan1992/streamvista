'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search, Filter, ArrowUpDown, ChevronRight, Info, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  PRODUCT_ID: number;
  PRODUCT_NAME: string;
  SKU: string;
  PART_NUMBER: string;
  OEM_NUMBER: string;
  PRICE: number;
  BRAND_NAME: string;
  CATEGORY_NAME: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/products', { params: { search: query } });
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Product Catalog</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {products.length} parts found {query && `for "${query}"`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <ArrowUpDown className="w-4 h-4" /> Sort
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 h-80 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.PRODUCT_ID} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-zinc-200 border-dashed">
          <div className="p-4 bg-zinc-50 rounded-full mb-4">
            <Search className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">No parts found</h3>
          <p className="text-zinc-500 text-sm mt-1">Try searching for a different OEM number or part name.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all flex flex-col">
      <Link href={`/products/${product.PRODUCT_ID}`} className="aspect-square bg-zinc-50 relative flex items-center justify-center overflow-hidden">
        <Package className="w-12 h-12 text-zinc-200 group-hover:scale-110 transition-transform" />
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm border border-zinc-100 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
          {product.BRAND_NAME}
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.PRODUCT_ID}`} className="flex-1 block">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{product.CATEGORY_NAME}</p>
          <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
            {product.PRODUCT_NAME}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-[11px] text-zinc-400 flex items-center justify-between">
              Part No: <span className="font-mono text-zinc-600">{product.PART_NUMBER}</span>
            </p>
            <p className="text-[11px] text-zinc-400 flex items-center justify-between">
              OEM: <span className="font-mono text-zinc-600">{product.OEM_NUMBER}</span>
            </p>
          </div>
        </Link>
        <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
          <div className="text-lg font-bold text-zinc-900">
            ₹{product.PRICE.toLocaleString()}
          </div>
          <button 
            onClick={() => addToCart(product)}
            className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-blue-600 transition-colors group-hover:shadow-lg group-hover:shadow-blue-500/25 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
