import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { databaseService } from "../services/database";
import { financeService } from "../services/finance";
import { Title } from "../types/title";
import { CreatorWallet } from "../types/finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Loader2, DollarSign } from "lucide-react";

import { TitleEditor } from "../components/TitleEditor";
import { Plus } from "lucide-react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [wallet, setWallet] = useState<CreatorWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        try {
          const [data, walletData] = await Promise.all([
            databaseService.getTitlesByCreator(user.uid),
            financeService.getCreatorWallet(user.uid)
          ]);
          setTitles(data);
          setWallet(walletData);
        } catch (e) {
          console.error("Dashboard load error", e);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Creator Hub</h1>
          <p className="text-slate-400">Welcome, {user?.displayName}. Manage your portfolio and track performance.</p>
        </div>
        <Button 
          onClick={() => setEditingDraft({ creatorOwnerId: user?.uid })} 
          className="bg-brand-gold text-brand-navy hover:bg-yellow-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Title
        </Button>
      </div>
      
      {editingDraft && (
        <TitleEditor 
          draft={editingDraft} 
          onClose={() => setEditingDraft(null)} 
          onSave={(updated) => {
            setEditingDraft(null);
            window.location.reload();
          }} 
        />
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-gold h-8 w-8" />
        </div>
      ) : (
        <>
          {wallet && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-brand-navy-light/80 to-brand-navy-light/40 border-brand-gold/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                    Available Balance
                    <DollarSign className="h-4 w-4 text-brand-gold" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">₹{wallet.availableBalance?.toLocaleString() || 0}</div>
                  <div className="text-sm text-slate-400 mt-1">Total Earned: ₹{wallet.totalEarned?.toLocaleString() || 0}</div>
                  {wallet.availableBalance > 0 && (
                    <Button 
                      className="mt-4 w-full bg-brand-gold text-brand-navy hover:bg-yellow-500"
                      onClick={async () => {
                        const amount = parseFloat(prompt("Enter amount to settle:") || "0");
                        if (amount > 0 && amount <= wallet.availableBalance) {
                          try {
                            await financeService.requestSettlement(amount);
                            alert("Settlement requested successfully!");
                            window.location.reload();
                          } catch(e) {
                            alert("Failed to request settlement.");
                          }
                        }
                      }}
                    >
                      Request Settlement
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">My Titles</h2>
          {titles.length === 0 ? (
            <Card className="bg-brand-navy-light/30 border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-400 mb-4">You haven't uploaded any titles yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {titles.map(title => (
                <Card key={title.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{title.contentType}</Badge>
                      <Badge variant="success">{title.status}</Badge>
                    </div>
                    <CardTitle className="line-clamp-1 text-xl">{title.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{title.synopsis}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">QC Status</span>
                      <span className="text-white font-medium capitalize">{title.qcStatus}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
