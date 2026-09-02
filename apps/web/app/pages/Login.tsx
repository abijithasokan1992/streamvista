import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cleanAuthErrorMessage } from '../lib/authError';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return setMessage('Authentication is not configured yet.');
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setMessage(cleanAuthErrorMessage(error));
      navigate('/creator-studio', { replace: true });
    } catch (error) {
      setMessage(cleanAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">
      <div className="w-full max-w-md rounded-2xl border border-cyan-900/40 bg-black/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10">
            <Shield className="h-8 w-8 text-cyan-400" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500">Crayons Bridge</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500">Secure access to your StreamVista workspace.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block text-sm text-zinc-300">
            Email
            <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-zinc-950 px-3">
              <Mail className="mr-2 h-4 w-4 text-zinc-500" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className="w-full bg-transparent py-3 text-white outline-none" />
            </div>
          </label>
          <label className="block text-sm text-zinc-300">
            Password
            <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-zinc-950 px-3">
              <Lock className="mr-2 h-4 w-4 text-zinc-500" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" className="w-full bg-transparent py-3 text-white outline-none" />
            </div>
          </label>
          {message && <p className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">{message}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? 'Signing in…' : 'Enter Bridge'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link className="text-cyan-400 hover:text-cyan-300" to="/forgot-password">Forgot password?</Link>
          <Link className="text-zinc-400 hover:text-white" to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
