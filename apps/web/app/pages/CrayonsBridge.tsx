import React from 'react';
import { Link } from 'react-router-dom';
import Marketplace from './marketplace/Marketplace';

export default function CrayonsBridge() {
  return (
    <div className="min-h-screen bg-[#050607] text-white px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-12">
          <p className="text-xs font-semibold tracking-[0.24em] text-white/35">CRAYONS BRIDGE · BY STREAMVISTA</p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-medium tracking-[-0.04em] md:text-6xl">One bridge from content to market.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/50 md:text-lg">Prepare, protect and commercialize films, series and shows through one secure rights and licensing workflow.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Create account</Link>
                <Link to="/login" className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/75">Log in</Link>
                <Link to="/pricing" className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/75">Plans & payments</Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['01', 'UPLOAD', 'Masters, audio, subtitles, artwork and rights documents'],
                ['02', 'QC + RIGHTS', 'Technical review, ownership, territory and availability'],
                ['03', 'LICENSE', 'Buyer access, offers, negotiation and commercial approvals'],
                ['04', 'DELIVER', 'Controlled delivery after the approved commercial workflow'],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-[10px] tracking-[0.2em] text-white/25">{number}</div>
                  <div className="mt-4 text-sm font-semibold tracking-[0.14em] text-white/75">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-white/40">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['Creator / Studio', 'Submit titles, manage rights, QC and buyer interest.'],
            ['Verified Buyer', 'Discover approved titles and start controlled licensing workflows.'],
            ['StreamVista Operations', 'Approve access, manage deals and authorize delivery.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/40">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-7 md:p-10">
          <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-white/30">LIVE MARKETPLACE</p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight md:text-4xl">Verified titles. Controlled licensing.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">The marketplace below uses the existing authenticated StreamVista data path and payment workflow; no duplicate commerce backend is introduced.</p>
            </div>
            <Link to="/login" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/70">Enter workspace →</Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#070809] p-4 md:p-7">
            <Marketplace />
          </div>
        </section>
      </div>
    </div>
  );
}
