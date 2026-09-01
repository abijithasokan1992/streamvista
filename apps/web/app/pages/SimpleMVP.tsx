import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SimpleMVP() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [input, setInput] = useState('');
  const [step, setStep] = useState<'home' | 'create' | 'process' | 'output'>('home');
  const [busy, setBusy] = useState(false);

  const start = () => setStep('create');

  const login = async () => {
    if (supabase) navigate('/login');
    else navigate('/login');
  };

  const process = async () => {
    setBusy(true);
    setStep('process');
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBusy(false);
    setStep('output');
  };

  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/simple-mvp" className="text-sm font-semibold tracking-[0.3em]">STREAMVISTA</Link>
          <div className="flex gap-2">
            <button onClick={login} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75">Log in</button>
            <Link to="/signup" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Sign up</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
        {step === 'home' && (
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.25em] text-white/40">SIMPLE MVP</p>
            <h1 className="mt-4 text-5xl font-medium tracking-tight md:text-7xl">Create. Pay. Process. Get your result.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/45">One simple StreamVista workflow with no unnecessary complexity.</p>
            <button onClick={start} className="mt-9 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Create →</button>
          </div>
        )}

        {step === 'create' && (
          <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-10">
            <p className="text-xs tracking-[0.25em] text-white/40">CREATE</p>
            <h2 className="mt-3 text-3xl font-medium">Create your project</h2>
            <label className="mt-8 block text-sm text-white/60">Project name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My project" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <label className="mt-5 block text-sm text-white/60">Input</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe what you want processed" className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" />
            <button disabled={!name.trim() || !input.trim()} onClick={process} className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-30">Pay & Process →</button>
          </div>
        )}

        {step === 'process' && (
          <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-xs tracking-[0.25em] text-white/40">PROCESS</p>
            <h2 className="mt-4 text-3xl font-medium">Processing your request…</h2>
            <p className="mt-4 text-white/45">{busy ? 'Please wait.' : 'Finishing.'}</p>
          </div>
        )}

        {step === 'output' && (
          <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-10">
            <p className="text-xs tracking-[0.25em] text-white/40">OUTPUT</p>
            <h2 className="mt-4 text-3xl font-medium">Your result is ready</h2>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-sm text-white/45">Project</div>
              <div className="mt-1 text-lg">{name}</div>
              <div className="mt-5 text-sm text-white/45">Status</div>
              <div className="mt-1 text-lg">Completed</div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setStep('home')} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Create another</button>
              <button onClick={() => supabase?.auth.signOut()} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/70">Log out</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
