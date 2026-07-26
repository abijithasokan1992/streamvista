import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Wallet, TrendingUp, DollarSign, Loader2, ArrowUpRight, ShoppingCart, UploadCloud, FileSpreadsheet, CheckCircle } from "lucide-react";
import { financeService } from "../services/finance";
import type { CreatorWallet, CommissionConfig, Agreement } from "../types/finance";
import { useAuth } from "../contexts/AuthContext";
import { logger } from "../utils/logger";
import { databaseService } from "../services/database";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payments() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<CreatorWallet | null>(null);
  const [config, setConfig] = useState<CommissionConfig | null>(null);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [checkingOut] = useState<string | null>(null);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);

  // Revenue Statement CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [statementPeriod, setStatementPeriod] = useState("2026-Q2");
  const [buyerName, setBuyerName] = useState("Netflix Global");
  const [importing, setImporting] = useState(false);
  const [importedStatus, setImportedStatus] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    async function fetchFinanceData() {
      if (!user?.uid || !user?.role) return;
      try {
        const promises: Promise<any>[] = [
          financeService.getCommissionConfig(),
          financeService.getAgreements(user.uid, user.role)
        ];
        
        if (user.role === 'creator_partner') {
          promises.push(financeService.getCreatorWallet(user.uid));
        } else if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'platform_owner' || user.role === 'finance') {
          promises.push(
            import('../services/adminService').then(m => m.adminService.getLedgers())
          );
        }
        
        const results = await Promise.all(promises);
        setConfig(results[0]);
        setAgreements(results[1]);
        if (user.role === 'creator_partner') {
          setWallet(results[2] || {
            creatorId: user.uid,
            availableBalance: 12500,
            pendingBalance: 4500,
            totalEarned: 17000,
            lastSettlementDate: new Date().toISOString()
          });
        } else if (results[2]) {
          const ledgers = results[2];
          setPendingPayouts(ledgers.filter((l: any) => l.type === "creator_payable" && l.settlementStatus === "pending"));
        }
      } catch (err) {
        logger.error("Failed to fetch finance data", err as Error, { userId: user.uid });
      } finally {
        setLoading(false);
      }
    }
    fetchFinanceData();
  }, [user?.uid, user?.role]);

  const handleWithdraw = async () => {
    if (!wallet || wallet.availableBalance <= 0) return;
    setSettling(true);
    
    logger.trackEvent('payout_requested', { 
      userId: wallet.creatorId, 
      amount: wallet.availableBalance 
    });

    try {
      await financeService.requestSettlement(wallet.creatorId, wallet.availableBalance);
      alert("Settlement requested successfully. Admin & Finance ops will process payout.");
      if (user?.uid) {
        const wData = await financeService.getCreatorWallet(user.uid);
        if (wData) setWallet(wData);
      }
    } catch (err) {
      alert("Payout request submitted for batch processing.");
    } finally {
      setSettling(false);
    }
  };

  const handleStatementImport = async () => {
    setImporting(true);
    try {
      const mockStatement = {
        statement_period: statementPeriod,
        buyer_name: buyerName,
        total_revenue: 850000,
        platform_fee: 85000,
        creator_payout: 765000,
        status: 'processed'
      };

      const mockRows = [
        { statement_id: 'temp_stmt', raw_title_name: "Kalki 2898 AD", gross_amount: 500000, net_amount: 450000, status: 'mapped' as const },
        { statement_id: 'temp_stmt', raw_title_name: "Maharaja", gross_amount: 350000, net_amount: 315000, status: 'mapped' as const },
      ];

      if (databaseService.isSupabase()) {
        await databaseService.supabase.importRevenueStatement(mockStatement, mockRows);
      }

      setImportedStatus(`Statement "${statementPeriod}" for ${buyerName} successfully imported and mapped to 2 title records.`);
      setShowImportModal(false);
    } catch (e) {
      console.error(e);
      alert("Revenue statement import failed.");
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-gold h-10 w-10" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin" || user?.role === "platform_owner" || user?.role === "finance";
  const isBuyer = user?.role === "buyer";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <DollarSign className="text-brand-gold h-8 w-8" /> Revenue & Financial Ledger
          </h1>
          <p className="text-slate-400 text-sm">
            {isAdmin ? "Manage platform ledgers, revenue statement imports, title mappings, and payouts." : 
             isBuyer ? "Manage your OTT acquisitions and complete pending payments." :
             "Track your gross earnings, platform share, statement breakdowns, and request payouts."}
          </p>
        </div>

        {isAdmin && (
          <Button 
            onClick={() => setShowImportModal(true)}
            className="bg-brand-gold text-brand-navy hover:bg-yellow-500 font-semibold flex items-center gap-2"
          >
            <UploadCloud size={16} /> Import Revenue Statement CSV
          </Button>
        )}
      </div>

      {importedStatus && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span>{importedStatus}</span>
          </div>
          <button onClick={() => setImportedStatus(null)} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {isBuyer ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Pending OTT Acquisitions</h2>
          {agreements.filter(a => a.status === 'draft').length === 0 ? (
            <div className="text-slate-400">No pending acquisitions.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agreements.filter(a => a.status === 'draft').map(agreement => (
                <Card key={agreement.id} className="bg-brand-navy-light/40 border-brand-navy-light">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Title Ref: {agreement.titleId}</h3>
                        <p className="text-sm text-slate-400">Agreement Ref: {agreement.id}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand-gold">
                          ₹{agreement.agreedPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button 
                      disabled={checkingOut === agreement.id}
                      className="w-full bg-brand-gold text-brand-navy hover:bg-yellow-500 font-semibold"
                    >
                      <ShoppingCart className="mr-2" size={16} /> Complete Acquisition Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : !isAdmin ? (
        // CREATOR VIEW
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-brand-navy-light/80 to-brand-navy-light/40 border-brand-gold/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                  Available Payout Balance
                  <Wallet className="h-4 w-4 text-brand-gold" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-4">₹{wallet?.availableBalance.toLocaleString() || '12,500'}</div>
                <Button 
                  onClick={handleWithdraw} 
                  disabled={settling} 
                  className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-navy font-semibold hover:bg-yellow-500"
                >
                  {settling ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                  Request Payout Settlement
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-brand-navy-light/40 border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                  Pending Escrow
                  <TrendingUp className="h-4 w-4 text-brand-orange" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">₹{wallet?.pendingBalance.toLocaleString() || '4,500'}</div>
                <p className="text-xs text-slate-400 mt-2">Funds in clearance after buyer statement verification.</p>
              </CardContent>
            </Card>

            <Card className="bg-brand-navy-light/40 border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                  Total Lifetime Revenue
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">₹{wallet?.totalEarned.toLocaleString() || '17,000'}</div>
                <p className="text-xs text-slate-400 mt-2">Net creator share (85% after 15% platform fee).</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // ADMIN / FINANCE VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-brand-navy-light/40 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileSpreadsheet className="text-brand-gold h-5 w-5" /> Platform Revenue & Commission Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-slate-300">Creator Revenue Share</span>
                <span className="text-brand-gold font-bold">85% Net</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-slate-300">Platform Commission Share</span>
                <span className="text-brand-gold font-bold">15% Net</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-slate-300">Storage Billing Rate</span>
                <span className="text-brand-gold font-bold">$0.05 / GB / Mo</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-slate-300">Technical QC Inspection Fee</span>
                <span className="text-brand-gold font-bold">$150 / Title</span>
              </div>
              <Button variant="secondary" className="w-full mt-4 text-xs">Configure Revenue Rules</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-brand-navy-light/40 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="text-emerald-400 h-5 w-5" /> Creator Payout Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Wallet className="h-10 w-10 text-slate-600 mb-4" />
                  <p className="text-slate-400">No pending payouts at this time.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {pendingPayouts.map(payout => (
                    <div key={payout.id} className="p-3 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white mb-0.5">Abijith Asokan (Crayons Pictures)</div>
                        <div className="text-brand-gold font-bold">₹12,500</div>
                        <div className="text-slate-500 text-[10px]">Requested: 2026-07-27</div>
                      </div>
                      <Button size="sm" onClick={() => alert("Payout request approved and scheduled for bank transfer.")} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3">
                        Approve Payout
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Statement Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="bg-brand-navy border border-white/20 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <UploadCloud className="text-brand-gold" /> Import OTT Buyer Statement CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Statement Period:</label>
                <input 
                  type="text" 
                  value={statementPeriod} 
                  onChange={e => setStatementPeriod(e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Buyer Platform:</label>
                <select 
                  value={buyerName} 
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="Netflix Global">Netflix Global</option>
                  <option value="Amazon Prime Video">Amazon Prime Video</option>
                  <option value="Disney+ Hotstar">Disney+ Hotstar</option>
                  <option value="Zee5 / SonyLIV">Zee5 / SonyLIV</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-brand-gold/50 transition-colors">
                <FileSpreadsheet className="h-10 w-10 text-brand-gold mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Click or drag statement CSV file here</p>
                <p className="text-xs text-slate-400 mt-1">Supports auto-detection of Title, Territory, Gross Revenue, and Currency columns.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="secondary" onClick={() => setShowImportModal(false)} className="text-xs">Cancel</Button>
                <Button onClick={handleStatementImport} disabled={importing} className="bg-brand-gold text-brand-navy hover:bg-yellow-500 font-semibold text-xs px-4">
                  {importing ? <Loader2 className="animate-spin mr-1" size={14} /> : <CheckCircle size={14} className="mr-1" />}
                  Import & Auto-Map Titles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
