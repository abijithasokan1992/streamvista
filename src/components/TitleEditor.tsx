import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardContent } from "./ui/Card";
import { Loader2, UploadCloud, X, Save } from "lucide-react";
import type { TitleDraft } from "../types/title";
import { databaseService } from "../services/database";
import { storageService } from "../services/storage";
import { useAuth } from "../contexts/AuthContext";
import { useRef } from "react";

interface TitleEditorProps {
  draft: TitleDraft;
  onClose: () => void;
  onSave: (updatedDraft: TitleDraft) => void;
}

export function TitleEditor({ draft, onClose, onSave }: TitleEditorProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [formData, setFormData] = useState<TitleDraft>({ ...draft });
  
  const posterInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'posterUrl' | 'masterVideoUrl', 
    category: 'posters' | 'masters'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Auto-generate a dummy title ID if creating a new draft to ensure deterministic paths
    const currentTitleId = formData.id || `draft-${Date.now()}`;
    if (!formData.id) {
      setFormData(prev => ({ ...prev, id: currentTitleId }));
    }

    const setUploading = field === 'posterUrl' ? setUploadingPoster : setUploadingVideo;
    setUploading(true);
    
    try {
      const url = await storageService.uploadFile(file, user.uid, currentTitleId, category);
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${field}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!formData.title || !formData.posterUrl || !formData.masterVideoUrl) {
      alert("Title, Poster, and Video are required before submitting for review.");
      return;
    }
    if (!formData.licensingModel || !formData.price || !formData.rightsAvailable || formData.rightsAvailable.length === 0) {
      alert("Licensing Model, Price, and Territories are required before submitting for review.");
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
                <input 
                  type="file" 
                  ref={posterInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'posterUrl', 'posters')}
                />
                <div 
                  onClick={() => !uploadingPoster && posterInputRef.current?.click()}
                  className="aspect-[2/3] w-full border-2 border-dashed border-white/10 rounded-lg bg-black/40 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-brand-gold/50 transition-colors relative overflow-hidden"
                >
                  {uploadingPoster ? (
                    <div className="flex flex-col items-center">
                      <Loader2 size={32} className="mb-2 animate-spin text-brand-gold" />
                      <span className="text-sm font-medium">Uploading...</span>
                    </div>
                  ) : formData.posterUrl ? (
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
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'masterVideoUrl', 'masters')}
                />
                <div 
                  onClick={() => !uploadingVideo && videoInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-white/10 rounded-lg bg-black/40 flex items-center justify-center text-slate-400 cursor-pointer hover:border-brand-gold/50 transition-colors"
                >
                  {uploadingVideo ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin text-brand-gold" />
                      <span className="text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={20} className="mr-2" />
                      <span className="text-sm">{formData.masterVideoUrl ? "Video Uploaded" : "Upload Video (ProRes/MP4)"}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              {/* Basic Metadata */}
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

              {/* Rights & Pricing */}
              <div className="border-t border-white/10 pt-5 mt-5">
                <h3 className="text-brand-gold font-bold mb-4">Rights & Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Licensing Model</label>
                    <select 
                      name="licensingModel" 
                      value={formData.licensingModel || ""} 
                      onChange={handleChange}
                      className="w-full bg-brand-navy border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    >
                      <option value="">Select Model...</option>
                      <option value="exclusive">Exclusive</option>
                      <option value="non-exclusive">Non-Exclusive</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Price (₹)</label>
                    <Input 
                      name="price" 
                      type="number" 
                      value={formData.price || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} 
                      placeholder="e.g. 15000" 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Territories (Rights)</label>
                  <Input 
                    name="rightsAvailable" 
                    value={formData.rightsAvailable?.join(", ") || ""} 
                    onChange={(e) => setFormData(prev => ({ ...prev, rightsAvailable: e.target.value.split(",").map(r => r.trim()) }))} 
                    placeholder="e.g. Global, NA, EU" 
                  />
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
          <Button variant="primary" onClick={handleSubmitReview} disabled={saving || uploadingPoster || uploadingVideo} className="bg-brand-gold text-brand-navy border-brand-gold">
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Submit for QC & Legal"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
