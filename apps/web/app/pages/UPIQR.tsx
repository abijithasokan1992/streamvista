import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode-generator';

const DEFAULT_VPA = import.meta.env.VITE_UPI_VPA || '';
const DEFAULT_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || 'StreamVista';

function buildUpiUri(vpa: string, name: string, amount: string, note: string) {
  const params = new URLSearchParams({ pa: vpa.trim(), pn: name.trim() });
  if (amount && Number(amount) > 0) params.set('am', Number(amount).toFixed(2));
  if (note.trim()) params.set('tn', note.trim());
  params.set('cu', 'INR');
  return `upi://pay?${params.toString()}`;
}

function createQrSvg(value: string) {
  const qr = QRCode(0, 'M');
  qr.addData(value);
  qr.make();
  return qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}

export default function UPIQR() {
  const [vpa, setVpa] = useState(DEFAULT_VPA);
  const [name, setName] = useState(DEFAULT_NAME);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const upiUri = useMemo(() => buildUpiUri(vpa, name, amount, note), [vpa, name, amount, note]);

  useEffect(() => {
    if (!vpa.trim()) {
      setQrSvg('');
      setError('Add a UPI ID to generate the payment QR.');
      return;
    }
    try {
      setQrSvg(createQrSvg(upiUri));
      setError('');
    } catch {
      setQrSvg('');
      setError('Could not generate the QR. Check the payment details.');
    }
  }, [upiUri, vpa]);

  const copyUri = async () => {
    await navigator.clipboard.writeText(upiUri);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    const shareData = { title: `${name} — UPI Payment`, text: `Pay ${name} using UPI${amount ? ` · ₹${amount}` : ''}.`, url: upiUri };
    if (navigator.share) await navigator.share(shareData);
    else await copyUri();
  };

  const download = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'upi-payment'}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const qrSrc = qrSvg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}` : '';

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#171717] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold tracking-[0.25em] text-zinc-500">STREAMVISTA PAY</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Scan & Pay</h1>
          </div>
          <div className="rounded-full bg-[#111] px-3 py-1.5 text-xs font-medium text-white">UPI</div>
        </header>

        <section className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_70px_rgba(0,0,0,.08)]">
          <div className="px-6 pb-5 pt-7 text-center">
            <div className="text-sm text-zinc-500">Pay securely to</div>
            <div className="mt-1 text-xl font-semibold">{name || 'Your business'}</div>
            <div className="mt-1 text-xs text-zinc-400">{vpa || 'UPI ID not configured'}</div>
          </div>

          <div className="mx-auto flex w-[min(78vw,310px)] aspect-square items-center justify-center rounded-3xl border border-black/5 bg-white p-3">
            {qrSrc ? <img src={qrSrc} alt="UPI payment QR code" className="h-full w-full" /> : <div className="px-8 text-center text-sm text-zinc-400">Enter a UPI ID below to generate your QR.</div>}
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-xs font-medium text-zinc-500">UPI ID
                <input value={vpa} onChange={(e) => setVpa(e.target.value)} placeholder="business@upi" className="mt-1.5 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-black/30" />
              </label>
              <label className="col-span-2 text-xs font-medium text-zinc-500">Business / recipient name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="StreamVista" className="mt-1.5 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-black/30" />
              </label>
              <label className="text-xs font-medium text-zinc-500">Amount (optional)
                <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="₹ 0.00" className="mt-1.5 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-black/30" />
              </label>
              <label className="text-xs font-medium text-zinc-500">Purpose / order ref
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Order #123" className="mt-1.5 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-black/30" />
              </label>
            </div>

            {error && <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">{error}</div>}

            <div className="mt-5 grid grid-cols-3 gap-2">
              <button onClick={copyUri} disabled={!qrSvg} className="rounded-xl border border-black/10 px-3 py-3 text-xs font-semibold disabled:opacity-40">{copied ? 'Copied' : 'Copy'}</button>
              <button onClick={share} disabled={!qrSvg} className="rounded-xl border border-black/10 px-3 py-3 text-xs font-semibold disabled:opacity-40">Share</button>
              <button onClick={download} disabled={!qrSvg} className="rounded-xl bg-[#111] px-3 py-3 text-xs font-semibold text-white disabled:opacity-40">Save QR</button>
            </div>

            <a href={upiUri} className={`mt-3 flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold ${qrSvg ? 'bg-[#111] text-white' : 'pointer-events-none bg-zinc-200 text-zinc-400'}`}>Open UPI app</a>

            <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-xs leading-5 text-zinc-500">
              <strong className="text-zinc-700">Before paying:</strong> verify the recipient name and amount in your UPI app. This page only creates the payment intent; it does not claim a payment is successful.
            </div>
          </div>
        </section>

        <p className="px-5 py-5 text-center text-[11px] leading-5 text-zinc-400">Original StreamVista payment interface. UPI payments are processed by the user's chosen UPI app/bank.</p>
      </div>
    </main>
  );
}
