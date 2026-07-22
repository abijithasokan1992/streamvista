import { useEffect, useState } from "react";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function Titles() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await databaseService.getTitles();
      setTitles(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Titles</h1>
          <p className="text-slate-400">Manage all published titles on StreamVista.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> Add Title
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Search titles..." className="pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-gold h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {titles.map(title => (
            <Card key={title.id} className="flex flex-col group cursor-pointer hover:border-brand-gold/50 transition-colors">
              <div className="aspect-[2/3] bg-brand-navy border-b border-white/5 relative overflow-hidden flex items-center justify-center">
                {title.posterUrl ? (
                  <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-600 font-medium">No Poster</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Button size="sm" variant="primary" className="w-full">View Details</Button>
                </div>
              </div>
              <CardHeader className="flex-1 pb-4">
                <CardTitle className="line-clamp-1">{title.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">{title.synopsis}</CardDescription>
              </CardHeader>
              <div className="px-6 pb-4 flex gap-2 flex-wrap">
                <Badge variant="outline">{title.contentType}</Badge>
                <Badge variant="success">{title.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
