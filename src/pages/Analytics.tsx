import { Card, CardContent } from "../components/ui/Card";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics</h1>
        <p className="text-slate-400">View performance metrics and audience engagement data. <span className="text-brand-orange text-xs uppercase ml-2 px-2 py-0.5 border border-brand-orange/30 rounded">Demo Data</span></p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Analytics Dashboard</h3>
          <p className="text-slate-400 max-w-md">Interactive charts for views, screenings, and engagement will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
