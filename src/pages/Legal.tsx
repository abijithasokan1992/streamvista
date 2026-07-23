import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CheckCircle, XCircle, FileSignature, AlertCircle } from "lucide-react";
import type { Title } from "../types/title";
import { databaseService } from "../services/database";

export default function Legal() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingLegal() {
      try {
        const data = await databaseService.getTitles();
        setTitles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingLegal();
  }, []);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    alert(`Mock: Title ${id} Legal clearance set to ${action}. Audit log created.`);
    setTitles(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Legal & Clearance</h1>
        <p className="text-slate-400">Review rights, chain of title, and legal agreements before final publication.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading Legal Queue...</div>
      ) : titles.length === 0 ? (
        <Card className="bg-brand-navy-light/40 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle size={40} className="text-emerald-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">All Clear</h3>
            <p className="text-slate-400">No titles pending legal review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {titles.map(title => (
            <Card key={title.id} className="bg-brand-navy-light/40 border-brand-navy-light flex flex-col">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{title.title}</CardTitle>
                  <FileSignature className="text-slate-500" />
                </div>
              </CardHeader>
              
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-slate-400">Licensing Model</span>
                    <span className="text-white capitalize">{title.licensingModel}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-slate-400">Territories</span>
                    <span className="text-white">{title.rightsAvailable?.length || 0} Regions</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-brand-orange bg-brand-orange/10 p-3 rounded-md">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>Requires verification of Chain of Title documentation and music clearance certificates.</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4">
                  <Button variant="secondary" onClick={() => handleAction(title.id, 'reject')} className="text-red-400">
                    <XCircle size={16} className="mr-2" /> Reject
                  </Button>
                  <Button variant="primary" onClick={() => handleAction(title.id, 'approve')}>
                    <CheckCircle size={16} className="mr-2" /> Approve Rights
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
