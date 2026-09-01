import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return setMessage('Authentication is not configured yet.');
    setBusy(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    setMessage(error ? error.message : 'Recovery email sent. Check your inbox for the password reset link.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">
      <div className="w-full max-w-md rounded-2xl border border-cyan-900/40 bg-black/50 p-8 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <Shield className="mx-auto mb-4 h-10 w-10 text-cyan-400" />
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-500">Crayons Bridge</div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-zinc-500">We’ll send a secure recovery link to your email.</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div className="flex items-center rounded-lg border border-white/10 bg-zinc-950 px-3">
            <Mail className="mr-2 h-4 w-4 text-zinc-500" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" placeholder="you@example.com" className="w-full bg-transparent py-3 text-white outline-none" />
          </div>
          {message && <p className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-cyan-300">{message}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? 'Sending…' : 'Send recovery link'}
          </button>
        </form>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
      </div>
    </div>
  );
}
