import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

const roles = [
  { value: 'creator', label: 'Creator' },
  { value: 'buyer', label: 'Buyer / OTT' },
  { value: 'studio', label: 'Studio' },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creator');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return setMessage('Authentication is not configured yet.');
    if (password.length < 8) return setMessage('Use a password with at least 8 characters.');
    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim(), role, workspace: role === 'buyer' ? 'crayons-bridge' : 'creator-studio' } },
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    if (data.session) navigate('/creator-studio', { replace: true });
    else setMessage('Account created. Check your email to confirm your address, then sign in.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">
      <div className="w-full max-w-md rounded-2xl border border-cyan-900/40 bg-black/50 p-8 backdrop-blur-xl">
        <div className="mb-8 text-center"><Shield className="mx-auto mb-4 h-10 w-10 text-cyan-400" /><div className="text-xs uppercase tracking-[0.35em] text-cyan-500">Crayons Bridge</div><h1 className="mt-2 text-2xl font-semibold text-white">Create your account</h1><p className="mt-2 text-sm text-zinc-500">Secure access starts with your verified identity.</p></div>
        <form onSubmit={submit} className="space-y-5">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" placeholder="Email address" className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none" aria-label="Account role">{roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} autoComplete="new-password" placeholder="Password (8+ characters)" className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none" />
          {message && <p className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-cyan-300">{message}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Creating…' : 'Create account'}{!busy && <ArrowRight className="h-4 w-4" />}</button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">Already registered? <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link></p>
      </div>
    </div>
  );
}
