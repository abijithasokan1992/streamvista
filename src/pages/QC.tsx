import { Card, CardContent } from "../components/ui/Card";
import { ShieldCheck } from "lucide-react";

export default function QC() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Quality Control</h1>
        <p className="text-slate-400">Review and approve video, audio, and subtitle assets.</p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No pending QC reviews</h3>
          <p className="text-slate-400 max-w-md">All titles and assets have been reviewed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
