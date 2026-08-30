import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return setMessage('Authentication is not configured yet.');
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return setMessage('Authentication is not configured yet.');
    if (password.length < 8) return setMessage('Use a password with at least 8 characters.');
    if (password !== confirm) return setMessage('Passwords do not match.');
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage('Password updated successfully.');
    setTimeout(() => navigate('/login', { replace: true }), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">
      <div className="w-full max-w-md rounded-2xl border border-cyan-900/40 bg-black/50 p-8 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <Shield className="mx-auto mb-4 h-10 w-10 text-cyan-400" />
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-500">Crayons Bridge</div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Create a new password</h1>
          <p className="mt-2 text-sm text-zinc-500">Your recovery link establishes a secure reset session.</p>
        </div>

        {!ready && !message ? <p className="text-center text-sm text-zinc-400">Open this page from the recovery link in your email.</p> : (
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm text-zinc-300">
              New password
              <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-zinc-950 px-3">
                <Lock className="mr-2 h-4 w-4 text-zinc-500" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" className="w-full bg-transparent py-3 text-white outline-none" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide new password' : 'Show new password'} className="ml-2 text-zinc-500 hover:text-zinc-200">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block text-sm text-zinc-300">
              Confirm password
              <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-zinc-950 px-3">
                <Lock className="mr-2 h-4 w-4 text-zinc-500" />
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type={showConfirm ? 'text' : 'password'} required minLength={8} autoComplete="new-password" className="w-full bg-transparent py-3 text-white outline-none" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'} className="ml-2 text-zinc-500 hover:text-zinc-200">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            {message && <p className="rounded-lg border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-300">{message}</p>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? 'Updating…' : 'Set new password'}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm text-zinc-400 hover:text-white">Back to login</Link>
      </div>
    </div>
  );
}
