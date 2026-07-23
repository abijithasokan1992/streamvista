import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Wallet, TrendingUp, DollarSign, Loader2, ArrowUpRight } from "lucide-react";
import { financeService } from "../services/finance";
import type { CreatorWallet, CommissionConfig } from "../types/finance";
import { useAuth } from "../contexts/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<CreatorWallet | null>(null);
  const [config, setConfig] = useState<CommissionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    async function fetchFinanceData() {
      if (!user?.uid) return;
      try {
        const [wData, cData] = await Promise.all([
          financeService.getCreatorWallet(user.uid),
          financeService.getCommissionConfig()
        ]);
        setWallet(wData);
        setConfig(cData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFinanceData();
  }, [user?.uid]);

  const handleWithdraw = async () => {
    if (!wallet || wallet.availableBalance <= 0) return;
    setSettling(true);
    try {
      await financeService.requestSettlement(wallet.creatorId, wallet.availableBalance);
      alert("Settlement requested successfully. Admin will review and process payout.");
      // Refresh wallet
      if (user?.uid) {
        const wData = await financeService.getCreatorWallet(user.uid);
        setWallet(wData);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to request settlement.");
    } finally {
      setSettling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-gold h-10 w-10" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Revenue & Finance</h1>
        <p className="text-slate-400">
          {isAdmin ? "Manage platform ledgers, global commissions, and payouts." : "Track your earnings, agreements, and request payouts."}
        </p>
      </div>

      {!isAdmin ? (
        // CREATOR VIEW
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-brand-navy-light/80 to-brand-navy-light/40 border-brand-gold/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                Available Balance
                <Wallet className="h-4 w-4 text-brand-gold" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-4">₹{wallet?.availableBalance.toLocaleString()}</div>
              <Button 
                onClick={handleWithdraw} 
                disabled={settling || (wallet?.availableBalance || 0) <= 0} 
                className="w-full flex items-center justify-center gap-2"
              >
                {settling ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                Request Payout
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-brand-navy-light/40 border-brand-navy-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                Pending Escrow
                <TrendingUp className="h-4 w-4 text-brand-orange" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">₹{wallet?.pendingBalance.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-2">Funds awaiting buyer delivery confirmation.</p>
            </CardContent>
          </Card>

          <Card className="bg-brand-navy-light/40 border-brand-navy-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                Total Lifetime Earnings
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">₹{wallet?.totalEarned.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-2">Before platform commission of {config?.freeCreatorCommissionPercent}%.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        // ADMIN VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-brand-navy-light/40 border-brand-navy-light">
            <CardHeader>
              <CardTitle>Global Commission Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-300">Free Creator Commission</span>
                <span className="text-brand-gold font-bold">{config?.freeCreatorCommissionPercent}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-300">Storage Billing (per GB)</span>
                <span className="text-brand-gold font-bold">${config?.storageBillingRatePerGb}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-300">QC Service Fee</span>
                <span className="text-brand-gold font-bold">${config?.qcServiceFee}</span>
              </div>
              <Button variant="secondary" className="w-full mt-4">Edit Global Rates</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-brand-navy-light/40 border-brand-navy-light">
            <CardHeader>
              <CardTitle>Pending Payout Requests</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Wallet className="h-10 w-10 text-slate-600 mb-4" />
              <p className="text-slate-400">No pending payouts at this time.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
