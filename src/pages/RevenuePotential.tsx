import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CircleDollarSign, Film, HandCoins, Rocket, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const DEFAULTS = {
  creators: 100,
  packagePrice: 25000,
  packageConversion: 12,
  avgFilmValue: 500000,
  platformShare: 30,
  monthlyDeals: 5,
  recurringClients: 20,
  recurringPrice: 5000,
};

export default function RevenuePotential() {
  const [creators, setCreators] = useState(DEFAULTS.creators);
  const [packagePrice, setPackagePrice] = useState(DEFAULTS.packagePrice);
  const [packageConversion, setPackageConversion] = useState(DEFAULTS.packageConversion);
  const [avgFilmValue, setAvgFilmValue] = useState(DEFAULTS.avgFilmValue);
  const [platformShare, setPlatformShare] = useState(DEFAULTS.platformShare);
  const [monthlyDeals, setMonthlyDeals] = useState(DEFAULTS.monthlyDeals);
  const [recurringClients, setRecurringClients] = useState(DEFAULTS.recurringClients);
  const [recurringPrice, setRecurringPrice] = useState(DEFAULTS.recurringPrice);

  const model = useMemo(() => {
    const packages = Math.round(creators * (packageConversion / 100));
    const packageRevenue = packages * packagePrice;
    const dealRevenue = monthlyDeals * avgFilmValue * (platformShare / 100);
    const recurringRevenue = recurringClients * recurringPrice;
    const monthlyRunRate = dealRevenue + recurringRevenue;
    const firstSprintCash = packageRevenue + monthlyRunRate;
    return { packages, packageRevenue, dealRevenue, recurringRevenue, monthlyRunRate, firstSprintCash };
  }, [creators, packagePrice, packageConversion, avgFilmValue, platformShare, monthlyDeals, recurringClients, recurringPrice]);

  return (
    <div className="space-y-7">
      <header className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">Revenue Command Center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Turn the StreamVista stack into cashflow.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Model creator onboarding, rights licensing and recurring studio services before engineering the next revenue feature.</p>
          </div>
          <Link to="/creator" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950">Open Creator Hub <ArrowRight size={16} /></Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RevenueCard icon={<CircleDollarSign size={20} />} label="First-sprint cash" value={INR.format(model.firstSprintCash)} detail="Package revenue + one month of modeled recurring/deal revenue" />
        <RevenueCard icon={<Rocket size={20} />} label="Monthly run-rate" value={INR.format(model.monthlyRunRate)} detail="Licensing commission + recurring service revenue" />
        <RevenueCard icon={<HandCoins size={20} />} label="Package sales" value={INR.format(model.packageRevenue)} detail={`${model.packages} projected OTT-readiness packages`} />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><Calculator className="text-violet-600" size={21} /><div><h2 className="font-black text-slate-950">Revenue model</h2><p className="text-sm text-slate-500">Adjust the assumptions; no database writes are made by this calculator.</p></div></div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Creator prospects" value={creators} onChange={setCreators} min={1} max={10000} />
            <Input label="Package price (₹)" value={packagePrice} onChange={setPackagePrice} min={0} max={10000000} step={1000} />
            <Input label="Package conversion (%)" value={packageConversion} onChange={setPackageConversion} min={0} max={100} />
            <Input label="Average film deal (₹)" value={avgFilmValue} onChange={setAvgFilmValue} min={0} max={100000000} step={10000} />
            <Input label="Platform commission (%)" value={platformShare} onChange={setPlatformShare} min={0} max={100} />
            <Input label="Monthly licensing deals" value={monthlyDeals} onChange={setMonthlyDeals} min={0} max={1000} />
            <Input label="Recurring service clients" value={recurringClients} onChange={setRecurringClients} min={0} max={10000} />
            <Input label="Recurring monthly price (₹)" value={recurringPrice} onChange={setRecurringPrice} min={0} max={1000000} step={500} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><Sparkles className="text-amber-500" size={21} /><div><h2 className="font-black text-slate-950">Monetization lanes</h2><p className="text-sm text-slate-500">Prioritized for fast validation.</p></div></div>
          <div className="mt-5 space-y-3">
            <Lane icon={<Users size={17} />} title="Creator acquisition" amount={INR.format(model.packageRevenue)} text="Sell a fixed OTT-readiness package at onboarding." />
            <Lane icon={<Film size={17} />} title="Rights marketplace" amount={INR.format(model.dealRevenue)} text={`Capture ${platformShare}% platform commission on modeled monthly deals.`} />
            <Lane icon={<ShieldCheck size={17} />} title="Studio services" amount={INR.format(model.recurringRevenue)} text="Recurring QC, metadata, delivery and workspace services." />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Execution order</p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {["Capture lead", "Close ₹25K package", "Verify rights + QC", "Match buyer + license"].map((step, index) => <div key={step} className="rounded-xl border border-violet-100 bg-white p-4"><p className="text-xs font-black text-violet-600">0{index + 1}</p><p className="mt-1 font-bold text-slate-950">{step}</p></div>)}
        </div>
      </section>
    </div>
  );
}

function RevenueCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">{icon}</span><p className="mt-4 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p></div>;
}

function Input({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; step?: number }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span><input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || 0)))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-950 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>;
}

function Lane({ icon, title, amount, text }: { icon: React.ReactNode; title: string; amount: string; text: string }) {
  return <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="text-violet-600">{icon}</span><p className="font-bold text-slate-950">{title}</p></div><span className="text-sm font-black text-slate-950">{amount}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></div>;
}
