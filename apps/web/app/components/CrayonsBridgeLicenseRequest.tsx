import React, { useState } from 'react';
import { CheckCircle2, FileText, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  titleId: string;
  title: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function CrayonsBridgeLicenseRequest({ titleId, title, onClose, onSubmitted }: Props) {
  const [territory, setTerritory] = useState('');
  const [platform, setPlatform] = useState('');
  const [exclusivity, setExclusivity] = useState('Non-exclusive');
  const [licensingModel, setLicensingModel] = useState('Negotiated license');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError('');
    if (!supabase) return setError('Supabase is not configured for this deployment.');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setError('Please sign in again.');
    setBusy(true);
    const { error: insertError } = await supabase.from('sv_screening_requests').insert({ buyer_id: user.id, title_id: titleId, status: 'requested' });
    setBusy(false);
    if (insertError && !insertError.message.toLowerCase().includes('duplicate')) {
      setError(insertError.message);
      return;
    }
    setSuccess(true);
    onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#07090d] p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">CRAYONS BRIDGE · LICENSING</div><h2 className="mt-2 text-2xl font-semibold text-white">Request licensing discussion</h2><p className="mt-2 text-sm text-white/45">{title}</p></div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        {success ? (
          <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-cyan-300" /><h3 className="mt-4 text-xl font-semibold text-white">Request submitted</h3><p className="mt-2 text-sm text-white/45">Your licensing request is now in the Bridge workflow. No payment has been initiated.</p><button type="button" onClick={onClose} className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Back to catalog</button></div>
        ) : (
          <>
            {error && <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">{error}</div>}
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label><span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">Territory</span><input value={territory} onChange={(e) => setTerritory(e.target.value)} placeholder="India / Worldwide / Specific territory" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-400/40" /></label>
              <label><span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">Platform</span><input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="OTT / TV / FAST / Other" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-400/40" /></label>
              <label><span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">Exclusivity</span><select value={exclusivity} onChange={(e) => setExclusivity(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"><option>Non-exclusive</option><option>Exclusive</option><option>To be negotiated</option></select></label>
              <label><span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">Licensing model</span><select value={licensingModel} onChange={(e) => setLicensingModel(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"><option>Negotiated license</option><option>Fixed fee</option><option>Minimum guarantee</option><option>Revenue share</option><option>MG + Revenue share</option></select></label>
              <label className="md:col-span-2"><span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">Buyer notes</span><textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Rights scope, intended use, proposed terms, or other discussion points" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-400/40" /></label>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6"><div className="flex items-center gap-2 text-xs text-white/35"><FileText size={15} /> Negotiation and agreement follow the Deal Room workflow.</div><button type="button" onClick={submit} disabled={busy} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? <span className="inline-flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Submitting…</span> : 'Submit licensing request'}</button></div>
          </>
        )}
      </div>
    </div>
  );
}
