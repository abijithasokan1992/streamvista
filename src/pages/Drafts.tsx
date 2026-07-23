import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Plus, Edit3, Loader2 } from "lucide-react";
import { databaseService } from "../services/database";
import type { TitleDraft } from "../types/title";
import { useAuth } from "../contexts/AuthContext";

import { TitleEditor } from "../components/TitleEditor";

export default function Drafts() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<TitleDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState<TitleDraft | null>(null);

  useEffect(() => {
    async function fetchDrafts() {
      if (!user?.uid) return;
      try {
        const data = await databaseService.getDraftsByCreator(user.uid);
        setDrafts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDrafts();
  }, [user?.uid]);

  const handleCreateNew = () => {
    if (!user?.uid) return;
    const newDraft: TitleDraft = {
      id: `draft_${Date.now()}`,
      creatorOwnerId: user.uid,
      title: "",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingDraft(newDraft);
  };

  const handleSaveDraft = (savedDraft: TitleDraft) => {
    setDrafts(prev => {
      const exists = prev.find(d => d.id === savedDraft.id);
      if (exists) return prev.map(d => d.id === savedDraft.id ? savedDraft : d);
      return [savedDraft, ...prev];
    });
    setEditingDraft(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Drafts</h1>
          <p className="text-slate-400">Continue working on unpublished titles.</p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus size={16} /> New Draft
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-gold h-8 w-8" />
        </div>
      ) : drafts.length === 0 ? (
        <Card className="bg-brand-navy-light/30 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-4">
              <Edit3 size={32} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No active drafts</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              You don't have any drafts in progress. Start a new draft to begin entering title metadata and uploading assets.
            </p>
            <Button onClick={handleCreateNew}>Start a New Draft</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
             <Card 
                key={draft.id} 
                onClick={() => setEditingDraft(draft)}
                className="flex flex-col group cursor-pointer hover:border-brand-gold/50 transition-colors bg-brand-navy-light/40"
             >
               <CardHeader className="flex-1">
                 <CardTitle className="line-clamp-1">{draft.title || "Untitled Draft"}</CardTitle>
                 <CardDescription className="line-clamp-2 mt-1">
                   Last edited: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : "Unknown"}
                 </CardDescription>
               </CardHeader>
               <div className="px-6 pb-4 flex justify-between items-center">
                 <Badge variant="outline">{draft.contentType || "Unknown"}</Badge>
                 <Button variant="secondary" className="px-3 py-1 h-8 text-xs flex items-center gap-1">
                   <Edit3 size={14} /> Edit
                 </Button>
               </div>
             </Card>
          ))}
        </div>
      )}

      {editingDraft && (
        <TitleEditor 
          draft={editingDraft} 
          onClose={() => setEditingDraft(null)} 
          onSave={handleSaveDraft} 
        />
      )}
    </div>
  );
}
