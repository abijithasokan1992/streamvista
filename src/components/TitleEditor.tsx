import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardContent } from "./ui/Card";
import { Loader2, UploadCloud, X, Save } from "lucide-react";
import type { TitleDraft } from "../types/title";
import { databaseService } from "../services/database";

interface TitleEditorProps {
  draft: TitleDraft;
  onClose: () => void;
  onSave: (updatedDraft: TitleDraft) => void;
}

export function TitleEditor({ draft, onClose, onSave }: TitleEditorProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TitleDraft>({ ...draft });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await databaseService.saveDraft(formData);
      onSave(saved);
    } catch (err) {
      console.error(err);
      alert("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleMockUpload = async (field: 'posterUrl' | 'masterVideoUrl') => {
    // In production, this binds to Firebase Storage upload tasks.
    const fileUrl = prompt("MOCK UPLOAD: Enter a URL for the file to simulate upload completion:", "https://example.com/asset.jpg");
    if (fileUrl) {
      setFormData(prev => ({ ...prev, [field]: fileUrl }));
    }
  };

  const handleSubmitReview = async () => {
    if (!formData.title || !formData.posterUrl || !formData.masterVideoUrl) {
      alert("Title, Poster, and Video are required before submitting for review.");
      return;
    }
    setSaving(true);
    try {
      // Must save first, then submit
      const saved = await databaseService.saveDraft(formData);
      await databaseService.submitDraftForReview(saved.id);
      alert("Title submitted for QC and Legal Review!");
      onSave(saved); // closes modal
    } catch (err) {
      console.error(err);
      alert("Failed to submit draft.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl bg-brand-navy-light/95 border-brand-navy-light shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white">
            {formData.title || "Untitled Project"}
          </h2>
          <Button variant="secondary" onClick={onClose} className="p-2 h-auto rounded-full">
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Media Uploads */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Poster Artwork</label>
                <div 
                  onClick={() => handleMockUpload('posterUrl')}
                  className="aspect-[2/3] w-full border-2 border-dashed border-white/10 rounded-lg bg-black/40 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-brand-gold/50 transition-colors relative overflow-hidden"
                >
                  {formData.posterUrl ? (
                    <img src={formData.posterUrl} alt="Poster" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud size={32} className="mb-2" />
                      <span className="text-sm font-medium">Upload Poster</span>
                      <span className="text-xs text-slate-500 mt-1">1080x1620 (JPG/PNG)</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Master Video File</label>
                <div 
                  onClick={() => handleMockUpload('masterVideoUrl')}
                  className="w-full p-4 border-2 border-dashed border-white/10 rounded-lg bg-black/40 flex items-center justify-center text-slate-400 cursor-pointer hover:border-brand-gold/50 transition-colors"
                >
                  <UploadCloud size={20} className="mr-2" />
                  <span className="text-sm">{formData.masterVideoUrl ? "Video Uploaded" : "Upload Video (ProRes/MP4)"}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Metadata */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Title *</label>
                <Input name="title" value={formData.title || ""} onChange={handleChange} placeholder="Enter title..." className="text-lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Content Type</label>
                  <select 
                    name="contentType" 
                    value={formData.contentType || ""} 
                    onChange={handleChange}
                    className="w-full bg-brand-navy border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value="">Select Type...</option>
                    <option value="movie">Feature Film</option>
                    <option value="short">Short Film</option>
                    <option value="documentary">Documentary</option>
                    <option value="series">Series</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Genre</label>
                  <Input 
                    name="genres" 
                    value={formData.genres?.join(", ") || ""} 
                    onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value.split(",").map(g => g.trim()) }))} 
                    placeholder="e.g. Sci-Fi, Drama" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Synopsis</label>
                <textarea 
                  name="synopsis" 
                  value={formData.synopsis || ""} 
                  onChange={handleChange as any}
                  rows={4}
                  placeholder="Enter brief synopsis..."
                  className="w-full bg-brand-navy border border-white/10 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Release Date</label>
                  <Input name="releaseDate" type="date" value={formData.releaseDate || ""} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Runtime (mins)</label>
                  <Input name="runtimeMinutes" type="number" value={formData.runtimeMinutes || ""} onChange={handleChange} placeholder="e.g. 120" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="secondary" onClick={handleSave} disabled={saving} className="bg-brand-navy border-brand-gold/30 hover:bg-brand-navy-light text-white">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </Button>
          <Button variant="primary" onClick={handleSubmitReview} disabled={saving} className="bg-brand-gold text-brand-navy border-brand-gold">
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Submit for QC & Legal"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
