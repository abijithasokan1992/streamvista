'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, Camera, ScanText, Loader2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';

export default function Navbar() {
  const [search, setSearch] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiType, setAiType] = useState<'IMAGE' | 'VIN' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vin, setVin] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { cartCount } = useCart();

  useEffect(() => {
    // Simple check: if token exists, show admin tools
    setIsAdmin(!!localStorage.getItem('token'));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/ai/identify-part', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSearch(data.Possible_Part_Name || data["Possible Part Name"]);
      setIsAiModalOpen(false);
      router.push(`/products?q=${encodeURIComponent(data.Possible_Part_Name || data["Possible Part Name"])}`);
    } catch (err) {
      console.error('AI identification failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVinParse = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/ai/parse-vin', { vin });
      setSearch(`${data.Make} ${data.Model} ${data.Year}`);
      setIsAiModalOpen(false);
      router.push(`/products?q=${encodeURIComponent(`${data.Make} ${data.Model}`)}`);
    } catch (err) {
      console.error('VIN parsing failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 lg:hidden text-zinc-600 cursor-pointer" />
            <Link href="/" className="text-2xl font-black text-zinc-900 tracking-tighter">
              UNI<span className="text-blue-600">ON</span>
              <span className="block text-[8px] font-bold text-zinc-400 tracking-[0.3em] uppercase -mt-1">Auto Spares</span>
            </Link>

          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 gap-2">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parts, OEM, VIN..." 
                className="w-full pl-10 pr-12 py-2 bg-zinc-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
              {isAdmin && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => { setAiType('IMAGE'); setIsAiModalOpen(true); }}
                    className="p-1.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-blue-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
            {isAdmin && (
              <button 
                onClick={() => { setAiType('VIN'); setIsAiModalOpen(true); }}
                className="px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <ScanText className="w-4 h-4" /> VIN
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-zinc-600" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/login" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <User className="w-5 h-5 text-zinc-600" />
            </Link>
          </div>
        </div>
      </nav>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAiModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAiModalOpen(false)}
              className="absolute right-6 top-6 p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {aiType === 'IMAGE' ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Visual Part ID</h3>
                  <p className="text-sm text-zinc-500 mt-1">Upload a photo to identify the spare part.</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Select Image'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto text-white">
                  <ScanText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">VIN Search</h3>
                  <p className="text-sm text-zinc-500 mt-1">Enter your vehicle&apos;s 17-digit VIN number.</p>
                </div>
                <input 
                  type="text" 
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Enter 17-character VIN"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-center font-mono tracking-widest uppercase"
                />
                <button 
                  onClick={handleVinParse}
                  disabled={isLoading || vin.length < 10}
                  className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/25 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze VIN'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
