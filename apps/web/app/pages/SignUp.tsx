import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

type UserRole = 'creator' | 'studio' | 'buyer';

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  { value: 'creator', label: 'Creator', description: 'Create, manage and license your content' },
  { value: 'studio', label: 'Studio', description: 'Manage productions, rights and delivery' },
  { value: 'buyer', label: 'Buyer', description: 'Discover, review and license content' },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return setMessage('Authentication is not configured yet.');
    if (!role) return setMessage('Select your user role to continue.');
    if (password.length < 8) return setMessage('Use a password with at least 8 characters.');
    setBusy(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role } },
    });

    if (error) {
      setBusy(false);
      return setMessage(error.message);
    }

    if (data.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: data.user.id, role }, { onConflict: 'user_id' });

      if (roleError) {
        setBusy(false);
        return setMessage(`Account created, but role provisioning failed: ${roleError.message}`);
      }
    }

    setBusy(false);
    if (data.session) navigate('/creator-studio', { replace: true });
    else setMessage('Account created. Check your email to confirm your address, then sign in.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-cyan-900/40 bg-black/50 p-8 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <Shield className="mx-auto mb-4 h-10 w-10 text-cyan-400" />
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-500">StreamVista</div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-zinc-500">Choose your workspace role. Access is governed by RBAC.</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" placeholder="Email address" className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none" />

          <div>
            <label htmlFor="user-role" className="mb-2 block text-sm font-medium text-zinc-300">User role</label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole | '')}
              required
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-cyan-500/60"
            >
              <option value="" disabled>Select your role</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>

          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} autoComplete="new-password" placeholder="Password (8+ characters)" className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none" />
          {message && <p className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-cyan-300">{message}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? 'Creating…' : 'Create account'}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">Already registered? <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link></p>
      </div>
    </div>
  );
}
