import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return setMessage('Authentication is not configured yet.');
    if (password.length < 8) return setMessage('Use a password with at least 8 characters.');
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    if (data.session) navigate('/creator-studio', { replace: true });
    else setMessage('Account created. Check your email to confirm your address, then sign in.');
  };

  return (
    <div className="min-h-screen bg-[#050607] px-6 text-white grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/35">Crayons Pictures</div>
          <h1 className="mt-3 text-3xl font-medium tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-white/40">One secure identity for your studio workspace.</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="Full name" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-white/25" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" placeholder="Email address" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-white/25" />

          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 focus-within:border-white/25">
            <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" placeholder="Password (8+ characters)" className="w-full bg-transparent py-3 text-white outline-none placeholder:text-white/20" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="ml-2 rounded-md p-1 text-white/35 hover:text-white/70">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {message && <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">{message}</p>}

          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black transition hover:bg-white/90 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? 'Creating…' : 'Create account'}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/35">Already registered? <Link to="/login" className="text-white/70 hover:text-white">Sign in</Link></p>
      </div>
    </div>
  );
}
