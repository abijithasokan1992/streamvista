import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { UploadCloud, FileVideo, FileImage, FileText, CheckCircle2, Loader2, HardDrive, Trash2, ShieldCheck, Film } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { databaseService } from "../services/database";

export interface UploadedAsset {
  id: string;
  name: string;
  type: 'master_video' | 'trailer' | 'poster' | 'subtitle' | 'contract';
  size: string;
  mimeType: string;
  status: 'processing' | 'ready' | 'verified';
  uploadedAt: string;
}

export default function Uploads() {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const [assets, setAssets] = useState<UploadedAsset[]>([
    {
      id: "ast_1",
      name: "Kalki_2898_AD_Master_4K_ProRes.mov",
      type: "master_video",
      size: "42.8 GB",
      mimeType: "video/quicktime",
      status: "ready",
      uploadedAt: "2026-07-25"
    },
    {
      id: "ast_2",
      name: "Maharaja_Official_Trailer_1080p.mp4",
      type: "trailer",
      size: "450 MB",
      mimeType: "video/mp4",
      status: "verified",
      uploadedAt: "2026-07-26"
    },
    {
      id: "ast_3",
      name: "Kalki_2898_AD_Main_Poster_KeyArt.jpg",
      type: "poster",
      size: "12.4 MB",
      mimeType: "image/jpeg",
      status: "verified",
      uploadedAt: "2026-07-26"
    }
  ]);

  const handleSimulatedUpload = (file: File) => {
    setUploading(true);
    setCurrentFile(file.name);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setCurrentFile(null);

          const assetType = file.name.endsWith('.mp4') || file.name.endsWith('.mov') ? 'master_video' : 
                            file.name.endsWith('.jpg') || file.name.endsWith('.png') ? 'poster' : 'contract';

          const newAsset: UploadedAsset = {
            id: `ast_${Date.now()}`,
            name: file.name,
            type: assetType,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            mimeType: file.type || 'application/octet-stream',
            status: 'ready',
            uploadedAt: new Date().toISOString().split('T')[0]
          };

          setAssets(prevAssets => [newAsset, ...prevAssets]);

          if (databaseService.isSupabase()) {
            databaseService.supabase.logAuditAction(
              user?.uid || 'user',
              'STORAGE_ASSET_UPLOADED',
              'media_asset',
              newAsset.id,
              { fileName: file.name, size: file.size }
            );
          }

          return 0;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulatedUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSimulatedUpload(e.target.files[0]);
    }
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <UploadCloud className="text-brand-gold h-8 w-8" /> Asset & Media Storage Centre
          </h1>
          <p className="text-slate-400 text-sm">Upload master videos, ProRes files, trailers, key art posters, subtitles, and DIT screenshots.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Drag and drop card */}
          <Card 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed transition-all p-8 cursor-pointer ${isDragging ? 'border-brand-gold bg-brand-gold/10' : 'border-white/20 bg-brand-navy-light/30 hover:border-brand-gold/50'}`}
          >
            <CardContent className="flex flex-col items-center justify-center py-12 text-center relative">
              <input 
                type="file" 
                onChange={handleFileSelect} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4 border border-brand-gold/30">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Drag & Drop Media Files Here</h3>
              <p className="text-slate-400 mb-6 max-w-md text-xs">
                Supports 4K ProRes 422/4444, H.264/H.265 master MP4s, HDR10/Dolby Vision trailers, High-Res Posters, and SRT/VTT subtitles. Up to 100GB.
              </p>
              <Button className="bg-brand-gold text-brand-navy font-semibold hover:bg-yellow-500 text-xs px-6">
                Browse Local Storage
              </Button>
            </CardContent>
          </Card>

          {/* Uploading progress bar if active */}
          {uploading && (
            <Card className="bg-brand-navy border border-brand-gold/40 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white">
                  <span className="font-semibold flex items-center gap-2">
                    <Loader2 className="animate-spin text-brand-gold h-4 w-4" /> Uploading: {currentFile}
                  </span>
                  <span className="text-brand-gold font-mono font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                  <div className="bg-brand-gold h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </Card>
          )}

          {/* Asset List Table */}
          <Card className="bg-brand-navy-light/40 border border-white/10">
            <CardHeader className="border-b border-white/10 pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <HardDrive className="text-brand-gold h-5 w-5" /> Uploaded Master Assets Library
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {assets.map((asset) => (
                  <div key={asset.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-brand-black/60 border border-white/10 flex items-center justify-center text-slate-300">
                        {asset.type === 'master_video' || asset.type === 'trailer' ? <FileVideo size={18} className="text-brand-gold" /> :
                         asset.type === 'poster' ? <FileImage size={18} className="text-emerald-400" /> : <FileText size={18} className="text-cyan-400" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{asset.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>{asset.size}</span>
                          <span>•</span>
                          <span className="uppercase">{asset.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Uploaded: {asset.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {asset.status}
                      </span>
                      <Button variant="secondary" onClick={() => handleDeleteAsset(asset.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formats and Storage Specifications */}
        <div className="space-y-6">
          <Card className="bg-brand-navy-light/40 border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Storage Entitlement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Used Vault Space:</span>
                  <span className="text-white font-bold">43.2 GB / 500 GB</span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                  <div className="bg-emerald-500 h-2" style={{ width: '8.6%' }} />
                </div>
              </div>

              <div className="p-3 bg-brand-black/40 rounded-lg border border-white/5 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <ShieldCheck size={14} /> Encrypted High-Speed S3 Vault
                </div>
                <p>All master uploads are split into HLS adaptive bitrate chunks with DRM key encryption.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-brand-navy-light/40 border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Supported Master Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded bg-brand-gold/10 flex items-center justify-center text-brand-gold"><Film size={16} /></div>
                <div>
                  <p className="font-medium text-slate-200 text-xs">Video Masters</p>
                  <p className="text-slate-400 text-[11px]">ProRes 422 HQ, H.264 / H.265 (4K 24fps)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400"><FileImage size={16} /></div>
                <div>
                  <p className="font-medium text-slate-200 text-xs">Posters & Key Art</p>
                  <p className="text-slate-400 text-[11px]">JPG, PNG, TIFF (300 DPI, 2700x4000)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400"><FileText size={16} /></div>
                <div>
                  <p className="font-medium text-slate-200 text-xs">Subtitles & Legal</p>
                  <p className="text-slate-400 text-[11px]">SRT, VTT, PDF (Chain of Title, Sync Docs)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
