'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Get in Touch</h1>
        <p className="text-zinc-500 max-w-lg mx-auto">Have questions about a part, a partnership, or our 40-year legacy? We're here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ContactCard icon={<MapPin />} title="Visit Us" detail="Bharathi Bhavan Bldg, Kanjiramattom, Amballoor, Ernakulam - 682315" />
        <ContactCard icon={<Phone />} title="Call Support" detail="094462 10740" />
        <ContactCard icon={<ShieldCheck />} title="GST Verified" detail="32AUFPA0144C1ZP" />
      </div>

      <form className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <input type="text" placeholder="Name" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
          <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <textarea placeholder="Message" rows={5} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
        <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          Send Message <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function ContactCard({ icon, title, detail }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 text-center space-y-3">
      <div className="text-blue-600 mx-auto w-10 h-10 bg-blue-50 flex items-center justify-center rounded-xl">{icon}</div>
      <h3 className="font-bold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500">{detail}</p>
    </div>
  );
}
