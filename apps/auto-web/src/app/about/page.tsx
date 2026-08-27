'use client';

import { MapPin, Phone, Mail, Clock, ShieldCheck, Globe, Truck, Ship, Plane, Bike } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-[40px] overflow-hidden bg-zinc-900 flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1486006920555-c77dcf18193b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            UNION <span className="text-blue-500">HERITAGE</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium">
            A 40-year legacy in the Indian Automotive industry, digitally upgraded for the next generation of global mobility.
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Our Founder</span>
          </div>
          <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight">
            Built on the Legacy of <br />
            <span className="text-blue-600">Asokan Chettan</span>
          </h2>
          <div className="prose prose-zinc lg:prose-lg text-zinc-600">
            <p>
              Union Auto Spares was born from the vision of <strong>Asokan U K</strong> in Kanjiramattom, Ernakulam. 
              For over four decades, "Asokan Chettan" has been a trusted name for quality and reliability in Kerala's 
              automotive landscape.
            </p>
            <p>
              We deal in genuine replacement parts for 2-wheelers, cars, mini-trucks, and LCVs. We are proud 
              authorized distributors for premium brands including <strong>Bosch, TVS Lucas, Minda, Lumax, and Rolon</strong>.
            </p>
            <p>
              Today, this platform represents the digital bridge between that legacy and the future of transport. 
              Built and architected by the son of Asokan Chettan, UNION now deals in all means of transport: 
              <strong> Road, Air, Water, and EV</strong>, including cycles and high-performance energy solutions.
            </p>
          </div>
        </div>
        
        {/* Timeline & Cards */}
        <div className="space-y-12">
          <div className="space-y-6">
            <TimelineItem year="1984" title="The Beginning" description="Founded by Asokan U K in Kanjiramattom." />
            <TimelineItem year="2005" title="Market Expansion" description="Became a regional authority in Kerala automotive spares." />
            <TimelineItem year="2026" title="Digital Transformation" description="Launch of UNION Auto Spares - The AI-driven Operating System." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TransportCard icon={<Truck />} label="Road" />
            <TransportCard icon={<Ship />} label="Water" />
            <TransportCard icon={<Plane />} label="Air" />
            <TransportCard icon={<Bike />} label="Cycle & EV" />
          </div>
        </div>
      </div>

      {/* Location & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-10 rounded-[32px] border border-zinc-200 space-y-8">
          <h3 className="text-2xl font-bold text-zinc-900">Visit Our Heritage</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 h-fit">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-zinc-900">UNION Heritage</p>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Kanjiramattom Railway Station Road,<br />
                  Ernakulam, Kerala - 682315
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600 h-fit">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-zinc-900">Direct Line</p>
                <p className="text-sm text-zinc-500">+91 98765 43210</p>
              </div>
            </div>
          </div>
          <button className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-zinc-900/10">
            Open in Google Maps
          </button>
        </div>
        <div className="lg:col-span-2 rounded-[32px] overflow-hidden border border-zinc-200 h-[450px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.567!2d76.432!3d9.876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNTInMzMuNiJOIDc2wrAyNSc1NS4yIkU!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
          />
        </div>
      </div>
    </div>
  );
}

function TransportCard({ icon, label }: any) {
  return (
    <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-500/5">
      <div className="p-4 bg-white rounded-2xl text-zinc-400 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-sm">
        {icon}
      </div>
      <p className="font-black text-zinc-900 uppercase tracking-tighter">{label}</p>
    </div>
  );
}
