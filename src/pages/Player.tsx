import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Button } from "../components/ui/Button";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id || !user) return;
      try {
        const data = await databaseService.getTitleById(id);
        setTitle(data);
        
        // Check secure entitlement from backend
        // In a real production app, this would generate a signed URL from Storage.
        // For the emulator demo, we just verify the entitlement document exists in Firestore.
        const entitlementRef = doc(db, "entitlements", `${user.uid}_${id}`);
        const entitlementSnap = await getDoc(entitlementRef);
        
        // Also allow if it's assigned directly (from old screening logic)
        const assigned = await databaseService.getTitlesByBuyer(user.uid);
        const isAssigned = assigned.some(t => t.id === id);

        if (entitlementSnap.exists() || isAssigned) {
          setAuthorized(true);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [id, user]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold h-12 w-12" /></div>;
  }

  if (!title) return <div>Title not found</div>;

  if (!authorized) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <AlertTriangle className="mx-auto h-20 w-20 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Unauthorized Access</h1>
        <p className="text-slate-400 mb-8">
          You do not hold a valid entitlement to stream this content. Please acquire the rights first.
        </p>
        <Button variant="primary" onClick={() => navigate(`/buyer/title/${title.id}`)}>View Title Details</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Button variant="secondary" onClick={() => navigate('/buyer')}>
          <ArrowLeft size={16} className="mr-2" /> Back to My Screenings
        </Button>
        <h1 className="text-2xl font-bold text-white">{title.title}</h1>
      </div>

      <div className="flex-1 bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative flex items-center justify-center">
        {title.masterVideoUrl ? (
          <video 
            src={title.masterVideoUrl} 
            controls 
            controlsList="nodownload"
            autoPlay 
            className="w-full h-full outline-none"
          />
        ) : (
          <div className="text-center text-slate-500">
            <p className="text-xl mb-2">Master Video Unavailable</p>
            <p className="text-sm">The creator has not uploaded a master video file yet.</p>
          </div>
        )}
        
        {/* Anti-piracy watermark overlay */}
        <div className="absolute top-10 left-10 opacity-20 pointer-events-none select-none text-white font-mono text-sm">
          {user?.email} - {new Date().toISOString()} - PROPRIETARY SCREENER
        </div>
      </div>
    </div>
  );
}
