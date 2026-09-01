export function Feature({ label, desc, icon }: any) {
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
