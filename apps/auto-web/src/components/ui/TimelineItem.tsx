function TimelineItem({ year, title, description }: any) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-blue-600 rounded-full" />
        <div className="w-px h-16 bg-zinc-200" />
      </div>
      <div>
        <p className="text-blue-600 font-black text-sm">{year}</p>
        <h4 className="font-bold text-zinc-900">{title}</h4>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
