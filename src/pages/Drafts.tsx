import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Plus, Edit3 } from "lucide-react";

export default function Drafts() {
  const [drafts] = useState([]); // Will hook up to databaseService later

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Drafts</h1>
          <p className="text-slate-400">Continue working on unpublished titles.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> New Draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card className="bg-brand-navy-light/30 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-4">
              <Edit3 size={32} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No active drafts</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              You don't have any drafts in progress. Start a new draft to begin entering title metadata and uploading assets.
            </p>
            <Button>Start a New Draft</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Draft cards will go here */}
        </div>
      )}
    </div>
  );
}
