import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Loader2, ArrowLeft, ShieldCheck, Globe, Film, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function TitleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [entitlement, setEntitlement] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!id || !user) return;
      try {
        const data = await databaseService.getTitleById(id);
        setTitle(data);
        
        // Check if user already owns it
        // We need a db method for this, but for now we can simulate or fetch from buyer titles
        const assigned = await databaseService.getTitlesByBuyer(user.uid);
        if (assigned.some(t => t.id === id)) {
          setEntitlement(true);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-gold h-12 w-12" />
      </div>
    );
  }

  if (!title) {
    return (
      <div className="text-center py-20 text-slate-400">
        Title not found or unavailable.
        <br />
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/buyer/discover')}>Back to Discovery</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Button variant="secondary" className="mb-6" onClick={() => navigate('/buyer/discover')}>
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
            {title.posterUrl ? (
              <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="primary" className="bg-brand-gold text-brand-navy">{title.contentType}</Badge>
              <Badge variant="outline">{title.licensingModel}</Badge>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{title.title}</h1>
            <p className="text-xl text-slate-300 mb-6">{title.genres?.join(", ")} • {title.releaseDate} • {title.runtimeMinutes} min</p>
            
            <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
            <p className="text-slate-400 leading-relaxed mb-8">{title.synopsis}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-navy-light/30 p-6 rounded-xl border border-white/5">
            <div>
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <Globe size={16} className="text-brand-gold" />
                <span className="font-medium">Territories</span>
              </div>
              <p className="text-white">{title.rightsAvailable?.join(", ")}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <ShieldCheck size={16} className="text-brand-gold" />
                <span className="font-medium">Clearance</span>
              </div>
              <p className="text-white capitalize">Legal {title.legalStatus}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Acquisition Price</p>
                <p className="text-3xl font-bold text-brand-gold">₹{title.price?.toLocaleString()}</p>
              </div>
              
              {entitlement ? (
                <Button variant="primary" className="bg-green-600 text-white hover:bg-green-500 px-8 py-6 text-lg" onClick={() => navigate(`/buyer/play/${title.id}`)}>
                  <CheckCircle2 className="mr-2" />
                  Stream Now
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  className="bg-brand-gold text-brand-navy hover:bg-yellow-500 px-8 py-6 text-lg font-semibold"
                  onClick={() => navigate(`/buyer/checkout/${title.id}`)}
                >
                  <Film className="mr-2" />
                  Acquire Rights
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
