import { useEffect, useState } from "react";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Loader2, Search, Filter } from "lucide-react";
import { Input } from "../components/ui/Input";
import { useNavigate } from "react-router-dom";

export default function Discovery() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await databaseService.getTitles();
        // For discovery, only show fully approved titles that are published
        setTitles(data.filter(t => t.approvalStatus === "approved"));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredTitles = titles.filter(t => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.genres?.some(g => g.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Discovery</h1>
          <p className="text-slate-400">Discover premium film and television rights for your platform.</p>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, genre, or keyword..." 
            className="pl-10"
          />
        </div>
        <Button variant="secondary"><Filter size={18} className="mr-2" /> Filters</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-gold h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {filteredTitles.map(title => (
            <Card key={title.id} className="flex flex-col cursor-pointer hover:border-brand-gold/50 transition-colors" onClick={() => navigate(`/buyer/title/${title.id}`)}>
              <div className="aspect-[2/3] relative w-full bg-black/50 overflow-hidden rounded-t-lg">
                {title.posterUrl ? (
                  <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">No Image</div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="primary" className="bg-brand-gold text-brand-navy">{title.contentType}</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{title.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1 text-xs">{title.synopsis}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-brand-gold">₹{title.price?.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 uppercase">{title.licensingModel}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredTitles.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              No titles found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
