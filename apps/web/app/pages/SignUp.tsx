import React, { useState } from 'react';
import { UserPlus, Shield, ArrowRight } from 'lucide-react';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] font-mono">
      <div className="w-full max-w-md p-8 border border-cyan-900/50 bg-black/40 backdrop-blur-xl rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-cyan-500/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-cyan-400">PROVISION_NEW_OPERATOR</h1>
          <p className="text-[10px] text-zinc-500 uppercase mt-2">Join the StreamVista Strategic Data Network</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Full Legal Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-cyan-900/30 rounded px-4 py-2 text-cyan-400 focus:outline-none focus:border-cyan-500/50"
              placeholder="Abijith Asokan"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold">Primary Identity (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-cyan-900/30 rounded px-4 py-2 text-cyan-400 focus:outline-none focus:border-cyan-500/50"
              placeholder="operator@crayonspictures.com"
            />
          </div>
          <button 
            className="w-full bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            REQUEST_ACCESS
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <a href="/login" className="text-[10px] text-cyan-700 hover:text-cyan-500 uppercase underline decoration-cyan-900/50">Existing Operator? Return to Gateway</a>
        </div>
      </div>
    </div>
  );
}
