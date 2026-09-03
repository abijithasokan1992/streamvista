import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return setMessage('Authentication is not configured yet.');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setMessage(error.message);
    navigate('/creator-studio', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#050607] px-6 text-white grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/35">Crayons Pictures</div>
          <h1 className="mt-3 text-3xl font-medium tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-white/40">Secure access to your studio workspace.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block text-sm text-white/65">
            Email
            <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 focus-within:border-white/25">
              <Mail className="mr-2 h-4 w-4 text-white/35" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className="w-full bg-transparent py-3 text-white outline-none placeholder:text-white/20" placeholder="you@example.com" />
            </div>
          </label>

          <label className="block text-sm text-white/65">
            Password
            <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 focus-within:border-white/25">
              <LockKeyhole className="mr-2 h-4 w-4 text-white/35" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="w-full bg-transparent py-3 text-white outline-none placeholder:text-white/20" placeholder="Your password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="ml-2 rounded-md p-1 text-white/35 hover:text-white/70">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {message && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{message}</p>}

          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black transition hover:bg-white/90 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link className="text-white/45 hover:text-white" to="/forgot-password">Forgot password?</Link>
          <Link className="text-white/70 hover:text-white" to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
