import React, { useEffect, useState } from 'react';
import { supabase, SUPABASE_URL } from '../services/supabase';

type AuthMethod = 'password' | 'magic_link' | 'otp';
type PlatformRole = 'creator' | 'buyer' | 'studio' | 'founder';
const ROLE_OPTIONS: Array<{ value: PlatformRole; label: string }> = [
  { value: 'creator', label: 'Creator' },
  { value: 'buyer', label: 'OTT Buyer' },
  { value: 'studio', label: 'VFX Studio' },
  { value: 'founder', label: 'Founder / Admin' },
];
const AUTH_METHODS: Array<{ value: AuthMethod; label: string }> = [
  { value: 'password', label: 'PASSWORD' },
  { value: 'magic_link', label: 'MAGIC LINK' },
  { value: 'otp', label: '2-FACTOR OTP' },
];

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [role, setRole] = useState<PlatformRole>('creator');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => { if (mounted) setActiveUser(Boolean(data.user)); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setActiveUser(Boolean(session?.user));
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
      localStorage.removeItem(`sb-${projectRef}-auth-token`);
      sessionStorage.removeItem(`sb-${projectRef}-auth-token`);
      setActiveUser(false);
      window.location.replace('/home');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to terminate the active session.');
      setLoggingOut(false);
    }
  };

  const redirectToWorkspace = () => window.location.assign('/dashboard');

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isSignUp) {
        if (authMethod !== 'password') {
          setMessage('New accounts use password setup. Switch to PASSWORD to register, then use the other channels to sign in.');
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim(), app_role: role } },
        });
        if (error) throw error;
        if (data.session) { redirectToWorkspace(); return; }
        setMessage('Registration submitted. Check your email to confirm the account.');
        return;
      }

      if (authMethod === 'password') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        redirectToWorkspace();
        return;
      }

      if (authMethod === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMessage('Magic Link sent. Check your inbox to continue to the workspace.');
        return;
      }

      if (!otpRequested) {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
        if (error) throw error;
        setOtpRequested(true);
        setMessage('Verification code sent. Enter the code to continue.');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otpCode.trim(), type: 'email' });
      if (error) throw error;
      redirectToWorkspace();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication channel failure.');
    } finally {
      setLoading(false);
    }
  };

  const selectMethod = (method: AuthMethod) => {
    setAuthMethod(method);
    setOtpRequested(false);
    setOtpCode('');
    setMessage('');
  };

  const toggleMode = () => {
    setIsSignUp((current) => !current);
    setOtpRequested(false);
    setOtpCode('');
    setMessage('');
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white flex items-center justify-center">
      <section className="w-full max-w-lg rounded-2xl border border-[#27272a] bg-[#18181b] p-6 shadow-2xl sm:p-8">
        <header className="mb-7 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">StreamVista Identity</p>
          <h1 className="text-2xl font-bold sm:text-3xl">{isSignUp ? 'Create your workspace identity' : 'Enter your workspace'}</h1>
          <p className="mt-2 text-sm text-gray-400">Choose an authentication channel and, for registration, the platform role that describes your workspace.</p>
        </header>

        {activeUser && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase text-amber-300">Active Session</p><p className="text-[11px] text-gray-400">Authenticated profile detected</p></div>
              <button type="button" onClick={handleLogout} disabled={loggingOut} className="rounded border border-red-500/50 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50">{loggingOut ? 'Logging Out...' : 'Log Out Session'}</button>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-3 rounded-xl border border-[#27272a] bg-[#09090b] p-1" role="tablist" aria-label="Authentication channels">
          {AUTH_METHODS.map((method) => <button key={method.value} type="button" role="tab" aria-selected={authMethod === method.value} onClick={() => selectMethod(method.value)} className={`rounded-lg px-2 py-2 text-[11px] font-bold transition sm:text-xs ${authMethod === method.value ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{method.label}</button>)}
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {isSignUp && <>
            <div><label htmlFor="display-name" className="mb-1 block text-xs font-bold uppercase text-gray-400">Display Name</label><input id="display-name" type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required className="w-full rounded-lg border border-[#27272a] bg-[#09090b] p-3 text-sm outline-none focus:border-blue-500" placeholder="Your name" /></div>
            <div><label htmlFor="platform-role" className="mb-1 block text-xs font-bold uppercase text-gray-400">Platform Role</label><select id="platform-role" value={role} onChange={(event) => setRole(event.target.value as PlatformRole)} className="w-full rounded-lg border border-[#27272a] bg-[#09090b] p-3 text-sm text-white outline-none focus:border-blue-500">{ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          </>}

          <div><label htmlFor="email" className="mb-1 block text-xs font-bold uppercase text-gray-400">Email Address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full rounded-lg border border-[#27272a] bg-[#09090b] p-3 text-sm outline-none focus:border-blue-500" placeholder="you@company.com" /></div>

          {authMethod === 'password' && <div><label htmlFor="password" className="mb-1 block text-xs font-bold uppercase text-gray-400">Password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={isSignUp ? 'new-password' : 'current-password'} className="w-full rounded-lg border border-[#27272a] bg-[#09090b] p-3 text-sm outline-none focus:border-blue-500" placeholder="••••••••" /></div>}

          {authMethod === 'otp' && otpRequested && <div><label htmlFor="otp-code" className="mb-1 block text-xs font-bold uppercase text-gray-400">Verification Code</label><input id="otp-code" type="text" inputMode="numeric" pattern="[0-9]{6}" value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required autoComplete="one-time-code" className="w-full rounded-lg border border-[#27272a] bg-[#09090b] p-3 text-center font-mono text-xl tracking-[0.35em] outline-none focus:border-blue-500" placeholder="000000" maxLength={6} /></div>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 p-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Processing…' : isSignUp ? 'Create Secured Profile' : authMethod === 'otp' && otpRequested ? 'Verify and Enter Workspace' : authMethod === 'magic_link' ? 'Send Magic Link' : authMethod === 'otp' ? 'Send Verification Code' : 'Authorize Identity'}</button>
        </form>

        <button type="button" onClick={toggleMode} className="mt-6 w-full text-center text-xs text-gray-400 transition hover:text-white">{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create a Profile"}</button>
        {message && <div role="status" aria-live="polite" className="mt-5 rounded-lg border border-blue-500/30 bg-[#27272a] p-3 text-center text-xs text-blue-300">{message}</div>}
      </section>
    </main>
  );
}
