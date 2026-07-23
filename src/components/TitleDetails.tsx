import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { X, Play, FileText, CheckCircle2 } from "lucide-react";
import type { Title } from "../types/title";
import { useAuth } from "../contexts/AuthContext";
import { financeService } from "../services/finance";
import { useNavigate } from "react-router-dom";

interface TitleDetailsProps {
  title: Title;
  onClose: () => void;
}

export function TitleDetails({ title, onClose }: TitleDetailsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreementStatus, setAgreementStatus] = useState<string | null>(null);

  const isBuyer = user?.role === "buyer";

  const handleInitiateAgreement = async () => {
    if (!user?.uid || !title.creatorOwnerId) return;
    setLoading(true);
    try {
      // Create agreement with actual title price
      const agreement = await financeService.createAgreement(
        title.id,
        user.uid,
        title.creatorOwnerId,
        title.price || 15000
      );
      setAgreementStatus(agreement.id);
      alert("Agreement initiated! Head to Payments to complete the transaction.");
      navigate("/payments");
    } catch (err) {
      console.error(err);
      alert("Failed to initiate agreement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl bg-brand-navy-light/95 border-brand-navy-light shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5 relative">
          <h2 className="text-2xl font-bold text-white pr-10">
            {title.title}
          </h2>
          <Button variant="secondary" onClick={onClose} className="absolute right-6 top-6 p-2 h-auto rounded-full">
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            {title.trailerUrl ? (
              <video src={title.trailerUrl} controls className="w-full h-full object-cover" />
            ) : title.posterUrl ? (
              <img src={title.posterUrl} alt="Poster" className="w-full h-full object-contain opacity-50 blur-sm" />
            ) : (
               <div className="text-slate-600 font-medium">No Media Available</div>
            )}
            
            {!title.trailerUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button className="rounded-full w-16 h-16 p-0 bg-brand-gold/80 hover:bg-brand-gold text-brand-navy border-none shadow-xl flex items-center justify-center">
                  <Play size={24} className="ml-1" />
                </Button>
              </div>
            )}
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                <p className="text-slate-300 leading-relaxed">{title.synopsis || "No synopsis available."}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Genres</h4>
                  <p className="text-white">{title.genres?.join(", ") || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Director</h4>
                  <p className="text-white">{title.director || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Runtime</h4>
                  <p className="text-white">{title.runtimeMinutes ? `${title.runtimeMinutes} mins` : "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Release Date</h4>
                  <p className="text-white">{title.releaseDate ? new Date(title.releaseDate).getFullYear() : "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-black/30 rounded-lg p-5 border border-white/5">
                 <h3 className="text-brand-gold font-bold mb-4 flex items-center gap-2">
                   <FileText size={18} /> Acquisition
                 </h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm text-slate-300">
                     <span>Licensing</span>
                     <span className="text-white capitalize">{title.licensingModel || "N/A"}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm text-slate-300">
                     <span>Rights</span>
                     <span className="text-white">{title.rightsAvailable?.length || 0} Territories</span>
                   </div>
                   
                   {isBuyer && (
                     <div className="pt-4 border-t border-white/5">
                       {agreementStatus ? (
                         <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-md text-sm font-medium">
                           <CheckCircle2 size={16} /> Agreement Initiated
                         </div>
                       ) : (
                         <Button 
                           variant="primary" 
                           className="w-full"
                           disabled={loading}
                           onClick={handleInitiateAgreement}
                         >
                           {loading ? "Processing..." : "Initiate Agreement"}
                         </Button>
                       )}
                       <p className="text-xs text-slate-500 text-center mt-3">
                         Executing an agreement legally binds you to the StreamVista Master Terms.
                       </p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
