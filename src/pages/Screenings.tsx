import { Card, CardContent } from "../components/ui/Card";
import { ListVideo } from "lucide-react";

export default function Screenings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Screenings</h1>
        <p className="text-slate-400">Manage buyer screenings, secure links, and access history.</p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
            <ListVideo size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Screening Sessions</h3>
          <p className="text-slate-400 max-w-md">Assign screening links to buyers and track their watch progress.</p>
        </CardContent>
      </Card>
    </div>
  );
}
