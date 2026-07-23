import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { financeService } from "../services/finance";
import { Loader2, FileText, Download } from "lucide-react";
import type { Agreement } from "../types/finance";

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const agrs = await financeService.getAgreements(user.uid, user.role);
        // Only show completed/captured agreements
        setAgreements(agrs.filter(a => a.status === 'executed'));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold h-12 w-12" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Purchase History</h1>
        <p className="text-slate-400">View your past acquisitions and download invoices.</p>
      </div>

      <Card className="bg-brand-navy border-white/10">
        <CardHeader>
          <CardTitle>Invoices & Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          {agreements.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>You haven't made any purchases yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agreements.map(agr => (
                <div key={agr.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-black/40 rounded-lg border border-white/5">
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className="p-3 bg-brand-gold/10 rounded-full text-brand-gold">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Acquisition: {agr.titleId}</h4>
                      <p className="text-sm text-slate-400">Invoice Ref: INV-{agr.id.substring(4)}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(agr.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-bold text-white text-lg">₹{agr.agreedPrice.toLocaleString()}</div>
                      <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 mt-1 uppercase text-[10px]">Paid</Badge>
                    </div>
                    <button className="text-brand-gold hover:text-yellow-400 transition-colors flex items-center gap-1 text-sm bg-brand-gold/10 px-3 py-1.5 rounded">
                      <Download size={14} /> Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
