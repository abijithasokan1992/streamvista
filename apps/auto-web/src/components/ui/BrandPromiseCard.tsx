function BrandPromiseCard({ title, description, icon }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm hover:shadow-lg transition-all">
      <div className="text-blue-600 mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
