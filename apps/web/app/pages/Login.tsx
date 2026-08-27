import React, { useState } from 'react';
import { Terminal, Shield, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login
    localStorage.setItem('isAuthenticated', 'true');
    window.location.href = '/creator-studio';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] font-mono">
      <div className="w-full max-w-md p-8 border border-cyan-900/50 bg-black/40 backdrop-blur-xl rounded-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-cyan-500/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-cyan-400">SECURE_GATEWAY_AUTH</h1>
          <p className="text-[10px] text-zinc-500 uppercase mt-2">StreamVista NOC Access Portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Operator ID (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-cyan-900/30 rounded px-4 py-2 text-cyan-400 focus:outline-none focus:border-cyan-500/50"
              placeholder="operator@streamvista.io"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Access Cipher</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-cyan-900/30 rounded px-4 py-2 text-cyan-400 focus:outline-none focus:border-cyan-500/50"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Lock className="w-4 h-4" />
            INITIATE_SESSION
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-cyan-900/20 text-center">
          <p className="text-[10px] text-zinc-600">UNAUTHORIZED ACCESS ATTEMPTS ARE LOGGED</p>
        </div>
      </div>
    </div>
  );
}
