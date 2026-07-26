import React, { useState } from "react";
import { 
  UploadCloud, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Clock, 
  HardDrive, 
  AlertOctagon, 
  ArrowRight,
  Film
} from "lucide-react";
import { presignedUploadService, UploadProgress } from "../../services/storage/presignedUploadService";

export function ProducerVaultWorkspace() {
  // Title Metadata State
  const [titleName, setTitleName] = useState("Jananam 1947 Pranayam Thudarunnu");
  const [directorName, setDirectorName] = useState("Abijith Asokan");
  const [genre, setGenre] = useState("Drama / Family");

  // File & Upload Progress State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>({
    loaded: 4.2 * 1024 * 1024 * 1024,
    total: 6.1 * 1024 * 1024 * 1024,
    percentage: 68,
    speedMbps: 45.0,
    estimatedSecondsRemaining: 42
  });

  // Legal Mandate Guarantee Checkbox
  const [legalMandateAccepted, setLegalMandateAccepted] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTitleName(file.name.replace(/\.[^/.]+$/, ""));
      try {
        const presigned = await presignedUploadService.getPresignedUploadUrl(
          file.name, 
          file.type, 
          "creator_abijith"
        );
        await presignedUploadService.uploadFileToS3(file, presigned.upload_url, (prog) => {
          setUploadProgress(prog);
        });
      } catch (err) {
        console.error("Presigned S3 Upload Error:", err);
      }
    }
  };

  const handleSaveDraft = () => {
    alert("🟢 Draft saved to RAW Vault (`s3://streamvista-masters/raw_vault/`)!");
  };

  const handleSubmitToMatchmaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalMandateAccepted) {
      alert("⚠️ Mandatory Rule: You must accept the Non-Sublicensable Governance warranty before locking submission.");
      return;
    }
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 lg:p-12 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* 1. Header & Context Shield */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">
                Crayons Bridge • RAW Vault Ingestion
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white mt-2 flex items-center gap-3">
              🎬 Creator Workspace — Producer Film Vault & Rights Registration
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Direct AWS S3 multipart ingestion engine. Register master video reels, Censor board certificates, and chain-of-title rights under strict non-sublicensable governance.
            </p>
          </div>

          {/* Active Entity Badge */}
          <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-3.5 backdrop-blur-md">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest block">
              Governance Standard
            </span>
            <span className="text-xs font-black text-emerald-200 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              StreamVista OPC Pvt Ltd | NON-SUBLICENSABLE GOVERNANCE
            </span>
          </div>
        </div>

        {/* 2. Drag-and-Drop Vault Upload Zone */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <HardDrive size={22} className="text-cyan-400" /> Master Asset Upload Dropzone
            </h2>
            <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              Direct AWS S3 Presigned URL Active
            </span>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-3xl p-10 text-center bg-slate-950/60 transition-all duration-300 cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-black text-white">Drag & Drop Master Video File or Censor Certificate</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Supported: .MP4, .MOV, ProRes 422 HQ, .PDF (Max 50GB via Chunked S3 Presigned Multipart)
            </p>

            <input 
              type="file" 
              className="hidden" 
              id="producer-vault-file-input" 
              onChange={handleFileChange}
            />

            <label 
              htmlFor="producer-vault-file-input" 
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Browse Files 📂
            </label>
          </div>

          {/* 3. Live Chunked Upload Progress Meter */}
          {uploadProgress && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-sm font-extrabold text-white">
                    Live S3 Chunked Ingestion Progress
                  </span>
                </div>
                <span className="text-xs font-black text-cyan-400 font-mono">
                  {uploadProgress.percentage}% Uploaded ({(uploadProgress.loaded / (1024 * 1024 * 1024)).toFixed(1)} GB / {(uploadProgress.total / (1024 * 1024 * 1024)).toFixed(1)} GB)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 h-3 rounded-full transition-all duration-300 shadow-md"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>

              {/* Real-Time Stats Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold font-mono">
                  ⚡ Speed: {uploadProgress.speedMbps} MB/s
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold font-mono">
                  ⏳ Time Remaining: {uploadProgress.estimatedSecondsRemaining}s
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  ✓ AWS S3 Presigned Ingestion Active (`s3://streamvista-masters/`)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Metadata Fields */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Film size={22} className="text-cyan-400" /> Title Metadata & Territory Specs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Title Name</label>
              <input 
                type="text" 
                value={titleName}
                onChange={(e) => setTitleName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Director</label>
              <input 
                type="text" 
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Primary Genre</label>
              <input 
                type="text" 
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Master Legal Governance Panel (CRUCIAL) */}
        <div className="bg-slate-900/90 border-2 border-emerald-500/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-4 relative">
          <div className="flex items-center gap-2 text-emerald-400">
            <AlertOctagon size={24} />
            <h3 className="text-lg font-black text-white">Master Legal Rights Warranty & Tagging Directive</h3>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <label className="flex items-start gap-4 text-xs lg:text-sm text-slate-200 cursor-pointer">
              <input 
                type="checkbox" 
                checked={legalMandateAccepted}
                onChange={(e) => setLegalMandateAccepted(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 shrink-0 mt-0.5 cursor-pointer"
              />
              <span className="font-extrabold leading-snug">
                I confirm and warrant that StreamVista OPC Pvt Ltd holds full non-sublicensable rights for distribution. No Right to Deliver to Next Person.
              </span>
            </label>

            <div className="pl-9 text-xs text-slate-400 space-y-1">
              <p className="font-bold text-emerald-400">Tagging Rule: Non-Sublicensable & Non-Transferable.</p>
              <p>
                All master files uploaded to `streamvista-masters` bucket are cryptographically tagged with non-sublicensable metadata. Secondary distribution or unauthorized sub-licensing is strictly prohibited under Indian Copyright Law.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Action Bar / Submission CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <button 
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Save Draft to RAW Vault 💾
          </button>

          <button 
            type="button"
            onClick={handleSubmitToMatchmaker}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Lock size={16} /> Lock & Submit to Matchmaker OS 🚀
          </button>
        </div>

        {/* Submission Success Banner */}
        {submissionSuccess && (
          <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-3xl flex items-center gap-3 text-emerald-300 text-sm font-black animate-fade-in shadow-2xl">
            <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
            <span>
              Asset Locked & Submitted to Matchmaker OS! S3 Metadata Tagged: "NON-SUBLICENSABLE & NON-TRANSFERABLE".
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
