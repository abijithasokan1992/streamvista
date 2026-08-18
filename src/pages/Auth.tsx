import React, { useEffect, useState } from 'react';
import { supabase, SUPABASE_URL } from '../services/supabase';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'magic_link' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [role, setRole] = useState('creator');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadActiveUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setActiveUser(Boolean(data.user));
    };

    loadActiveUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setActiveUser(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;

      // Supabase removes its persisted session on local sign-out. Remove the
      // canonical project's auth cache as a final client-side cleanup guard.
      const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
      localStorage.removeItem(`sb-${projectRef}-auth-token`);
      sessionStorage.removeItem(`sb-${projectRef}-auth-token`);
      setActiveUser(false);
      window.location.replace('/home');
    } catch (err: any) {
      setMessage(err.message || 'Unable to terminate the active session.');
      setLoggingOut(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // Sign Up Flow with selected app_role metadata sync
        const { data, error } = await supabase.auth.signUp({
          email,
          password: authMethod === 'password' ? password : Math.random().toString(36),
          options: {
            data: {
              display_name: displayName,
              app_role: role,
            }
          }
        });
        if (error) throw error;
        setMessage('Sign up successful! Check your email configuration.');
      } else {
        // Login Flow based on chosen multi-channel auth factor
        if (authMethod === 'password') {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          window.location.href = '/dashboard';
        } else if (authMethod === 'magic_link') {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: 'https://streamvista.in' }
          });
          if (error) throw error;
          setMessage('Magic Link transmitted! Check your inbox.');
        } else if (authMethod === 'otp') {
          // 2-Factor OTP Secure Validation
          if (!otpCode) {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            setMessage('Secure 6-digit verification code transmitted to email.');
          } else {
            const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'magiclink' });
            if (error) throw error;
            window.location.href = '/dashboard';
          }
        }
      }
    } catch (err: any) {
      setMessage(err.message || 'Authentication channel failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center text-white px-4">
      <div className="w-full max-w-md bg-[#18181b] p-8 rounded-xl border border-[#27272a] shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-2">StreamVista Identity Core</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          {isSignUp ? 'Create your platform account and assign role workspace.' : 'Access StreamVista secure rights management node.'}
        </p>

        {activeUser && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-amber-300">Active Session</p>
                <p className="text-[11px] text-gray-400">Authenticated profile detected</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded border border-red-500/50 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut ? 'Logging Out...' : 'Log Out Session'}
              </button>
            </div>
          </div>
        )}

        {/* AUTH METHOD SELECTOR ON THE UI */}
        <div className="flex justify-around border-b border-[#27272a] mb-6 pb-2 text-xs font-semibold">
          <button onClick={() => setAuthMethod('password')} className={`pb-2 ${authMethod === 'password' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>PASSWORD</button>
          <button onClick={() => setAuthMethod('magic_link')} className={`pb-2 ${authMethod === 'magic_link' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>MAGIC LINK</button>
          <button onClick={() => setAuthMethod('otp')} className={`pb-2 ${authMethod === 'otp' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>2-FACTOR OTP</button>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Your Name" />
              </div>
              
              {/* COMPLIANT HIGH-FIDELITY ROLE SELECTION MATRIX */}
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Select Platform Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-sm focus:outline-none focus:border-blue-500 text-white">
                  <option value="creator">Creator / Content Rights Holder</option>
                  <option value="buyer">OTT Buyer / Distribution Partner</option>
                  <option value="studio">Studio Service Provider / VFX Vendor</option>
                  <option value="founder">Founder / Workspace Admin</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-sm focus:outline-none focus:border-blue-500" placeholder="you@company.com" />
          </div>

          {authMethod === 'password' && (
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-sm focus:outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
          )}

          {authMethod === 'otp' && message.includes('verification code') && (
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Enter 6-Digit Code</label>
              <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-sm text-center tracking-widest font-mono text-xl focus:outline-none focus:border-blue-500" placeholder="000000" maxLength={6} />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 transition text-sm font-bold p-2.5 rounded text-white mt-4">
            {loading ? 'Processing Validation...' : isSignUp ? 'Create Secured Profile' : authMethod === 'otp' && message.includes('verification code') ? 'Verify and Enter Workspace' : 'Authorize Identity'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <button onClick={() => setIsSignUp(!isSignUp)} className="hover:text-white transition">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create Secured Profile"}
          </button>
        </div>

        {message && (
          <div className="mt-4 p-2 bg-[#27272a] border border-blue-500/30 rounded text-center text-xs text-blue-400">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
