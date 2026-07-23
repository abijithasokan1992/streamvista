import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Loader2, Users, Database, Wallet, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>({ users: [], ledgers: [], wallets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [users, ledgers, wallets] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getLedgers(),
          adminService.getWallets()
        ]);
        setData({ users, ledgers, wallets });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold h-12 w-12" /></div>;
  }

  const pendingSettlements = data.ledgers.filter((l: any) => l.type === "creator_payable" && l.settlementStatus === "pending");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Mission Control</h1>
          <p className="text-slate-400">Platform overview and escrow oversight.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-brand-navy border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users size={16} className="text-brand-gold" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.users.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-brand-navy border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Database size={16} className="text-brand-gold" />
              Ledger Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.ledgers.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-brand-navy border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Wallet size={16} className="text-brand-gold" />
              Active Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.wallets.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-brand-navy border-brand-orange/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-orange flex items-center gap-2">
              <ShieldCheck size={16} />
              Pending Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pendingSettlements.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Immutable Ledger (Recent)</h2>
          <Card className="bg-brand-navy border-white/10 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
              {data.ledgers.slice(0, 10).map((ledger: any) => (
                <div key={ledger.id} className="p-3 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{ledger.type}</Badge>
                      <span className="text-xs text-slate-500">{new Date(ledger.timestamp?.toDate ? ledger.timestamp.toDate() : ledger.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-slate-300">Order: {ledger.orderId || ledger.id}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${ledger.type === 'platform_commission' ? 'text-emerald-400' : 'text-brand-gold'}`}>
                      {ledger.type === 'platform_commission' ? '+' : ''}₹{ledger.amount?.toLocaleString()}
                    </div>
                    {ledger.settlementStatus && (
                      <div className="text-xs text-brand-orange mt-1 uppercase">{ledger.settlementStatus}</div>
                    )}
                  </div>
                </div>
              ))}
              {data.ledgers.length === 0 && (
                <div className="text-center text-slate-500 py-8">No ledger entries yet.</div>
              )}
            </div>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">User Directory</h2>
          <Card className="bg-brand-navy border-white/10 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
              {data.users.map((u: any) => (
                <div key={u.uid} className="p-3 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{u.displayName || u.email}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </div>
                  <Badge variant="secondary" className="uppercase text-[10px]">{u.role}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
