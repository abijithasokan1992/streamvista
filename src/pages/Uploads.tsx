import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { UploadCloud, FileVideo, FileImage, FileText } from "lucide-react";

export default function Uploads() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Upload Centre</h1>
        <p className="text-slate-400">Manage assets, master files, and related media for your titles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-dashed border-2 border-white/20 bg-brand-navy-light/30 transition-colors hover:bg-brand-navy-light/50 hover:border-brand-gold/50 cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Drag & Drop Files Here</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                Upload master videos, trailers, posters, thumbnails, subtitles, and legal documents. Maximum file size 100GB for master files.
              </p>
              <Button>Browse Files</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-400 italic">No recent uploads</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-300"><FileVideo size={16} /></div>
                <div>
                  <p className="font-medium text-slate-200">Video</p>
                  <p className="text-slate-400 text-xs">MP4, MOV, ProRes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-300"><FileImage size={16} /></div>
                <div>
                  <p className="font-medium text-slate-200">Images</p>
                  <p className="text-slate-400 text-xs">JPG, PNG (Min 1920x1080)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-300"><FileText size={16} /></div>
                <div>
                  <p className="font-medium text-slate-200">Documents</p>
                  <p className="text-slate-400 text-xs">PDF, SRT, VTT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
