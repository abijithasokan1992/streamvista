import Link from 'next/link';
import { Truck, Ship, Plane, Bike, ShieldCheck, Zap } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';

export default function LandingPage() {
  return (
    <PageContainer>
      <div className="space-y-24 pb-20">
        {/* Hero */}
        <section className="relative h-[80vh] flex items-end pb-20 -mt-8 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-zinc-950 overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed" />
          </div>
          <div className="relative z-10 w-full space-y-4 px-12">
            <span className="text-blue-500 font-black tracking-[0.2em] uppercase text-sm">Since 1984</span>
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none">
              FROM CYCLE<br/>TO EV.
            </h1>
            <p className="text-zinc-300 text-xl font-light max-w-xl border-l border-blue-500 pl-6">
              Four decades of motion, architected for the future of all transport.
            </p>
          </div>
        </section>

        {/* Brand Promise (Lean) */}
        <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <Feature label="Trusted Legacy" desc="40 years by Asokan Chettan" icon={<ShieldCheck />} />
          <Feature label="Total Mobility" desc="Parts for Road, Air, Water, EV" icon={<Truck />} />
          <Feature label="AI Powered" desc="Perfect fit, every time." icon={<Zap />} />
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter">Everything That Moves</h2>
            <p className="text-zinc-500 mt-2">Comprehensive spare parts for all transport modes.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard icon={<Truck />} label="Road" />
            <CategoryCard icon={<Ship />} label="Water" />
            <CategoryCard icon={<Plane />} label="Air" />
            <CategoryCard icon={<Bike />} label="EV & Cycle" />
          </div>
        </section>

        {/* Legacy Banner */}
        <section className="max-w-7xl mx-auto px-4 bg-zinc-900 rounded-[40px] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <ShieldCheck className="w-12 h-12 text-blue-500" />
            <h2 className="text-4xl font-black tracking-tighter">The Union Heritage</h2>
            <p className="text-zinc-400 leading-relaxed">
              Founded by <strong>Asokan U K</strong> in Kanjiramattom, UNION has been the backbone of local transport for four decades.
              Now, we are taking this legacy global, ensuring that Asokan Chettan&apos;s promise of quality reaches every corner of the mobility world.
            </p>
            <Link href="/about" className="inline-block px-6 py-3 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-all">
              Read Our Story
            </Link>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-zinc-800 rounded-3xl" />
        </section>
      </div>
    </PageContainer>
  );
}

function Feature({ label, desc, icon }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-blue-600">{icon}</div>
      <div>
        <h3 className="font-black text-zinc-900 uppercase tracking-tighter">{label}</h3>
        <p className="text-sm text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}

function CategoryCard({ icon, label }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-zinc-200 flex flex-col items-center gap-4 hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">{icon}</div>
      <p className="font-black text-zinc-900 uppercase tracking-tighter">{label}</p>
    </div>
  );
}
