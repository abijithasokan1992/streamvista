import { Card, CardContent } from "../components/ui/Card";
import { Megaphone } from "lucide-react";

export default function Campaigns() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Campaigns</h1>
        <p className="text-slate-400">Manage film launch pages, festival promos, and buyer showcases.</p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mb-4">
            <Megaphone size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No Active Campaigns</h3>
          <p className="text-slate-400 max-w-md">Create a cinematic campaign page to start marketing your titles.</p>
        </CardContent>
      </Card>
    </div>
  );
}
