import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Wallet, TrendingUp, DollarSign, Loader2, ArrowUpRight, ShoppingCart } from "lucide-react";
import { financeService } from "../services/finance";
import type { CreatorWallet, CommissionConfig, Agreement } from "../types/finance";
import { useAuth } from "../contexts/AuthContext";
import { logger } from "../utils/logger";
import { getFunctions, httpsCallable } from "firebase/functions";

// Define razorpay window type for typescript
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
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);

  useEffect(() => {
    // Load Razorpay script dynamically
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
        } else if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'platform_owner') {
          promises.push(
            import('../services/adminService').then(m => m.adminService.getLedgers())
          );
        }
        
        const results = await Promise.all(promises);
        setConfig(results[0]);
        setAgreements(results[1]);
        if (user.role === 'creator_partner') {
          setWallet(results[2]);
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
      logger.info(`Settlement processed successfully for ${wallet.creatorId}`);
      alert("Settlement requested successfully. Admin will review and process payout.");
      if (user?.uid) {
        const wData = await financeService.getCreatorWallet(user.uid);
        setWallet(wData);
      }
    } catch (err) {
      logger.error("Failed to request settlement", err as Error, { userId: wallet.creatorId });
      alert("Failed to request settlement.");
    } finally {
      setSettling(false);
    }
  };

  const handleCheckout = async (agreement: Agreement) => {
    setCheckingOut(agreement.id);
    try {
      const functions = getFunctions();
      const createOrder = httpsCallable(functions, 'razorpay-createOrder'); 
      
      const response = await createOrder({
        amount: agreement.agreedPrice,
        currency: agreement.currency,
        titleId: agreement.titleId,
        receiptId: agreement.id
      });

      const { orderId, amount, currency, keyId } = response.data as any;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "StreamVista OS",
        description: `Acquisition: ${agreement.titleId}`,
        order_id: orderId,
        handler: function (response: any) {
          alert(`Payment successful! Order ID: ${response.razorpay_order_id}. Processing on backend...`);
          window.location.reload();
        },
        prefill: {
          email: user?.email || "",
        },
        theme: {
          color: "#D4AF37" // Brand Gold
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Failed to initiate checkout");
    } finally {
      setCheckingOut(null);
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
  const isBuyer = user?.role === "buyer";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Revenue & Finance</h1>
        <p className="text-slate-400">
          {isAdmin ? "Manage platform ledgers, global commissions, and payouts." : 
           isBuyer ? "Manage your acquisitions and complete pending payments." :
           "Track your earnings, agreements, and request payouts."}
        </p>
      </div>

      {isBuyer ? (
        // BUYER VIEW
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Pending Acquisitions</h2>
          {agreements.filter(a => a.status === 'draft').length === 0 ? (
            <div className="text-slate-400">No pending acquisitions.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agreements.filter(a => a.status === 'draft').map(agreement => (
                <Card key={agreement.id} className="bg-brand-navy-light/40 border-brand-navy-light">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Title ID: {agreement.titleId}</h3>
                        <p className="text-sm text-slate-400">Agreement Ref: {agreement.id}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand-gold">
                          ₹{agreement.agreedPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleCheckout(agreement)} 
                      disabled={checkingOut === agreement.id}
                      className="w-full bg-brand-gold text-brand-navy hover:bg-yellow-500"
                    >
                      {checkingOut === agreement.id ? <Loader2 className="animate-spin mr-2" size={16} /> : <ShoppingCart className="mr-2" size={16} />}
                      Checkout Securely
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : !isAdmin ? (
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
            <CardContent>
              {pendingPayouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Wallet className="h-10 w-10 text-slate-600 mb-4" />
                  <p className="text-slate-400">No pending payouts at this time.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {pendingPayouts.map(payout => (
                    <div key={payout.id} className="p-3 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white mb-1">Creator: {payout.creatorId}</div>
                        <div className="text-sm text-brand-gold font-bold">₹{payout.amount.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(payout.timestamp?.toDate ? payout.timestamp.toDate() : payout.timestamp).toLocaleString()}</div>
                      </div>
                      <Button size="sm" onClick={() => {
                        alert("In a real app, this would trigger RazorpayX payout or manual bank transfer. For MVP, we approve locally.");
                        // Real implementation would call a firebase function to process the payout
                      }} className="bg-emerald-600 hover:bg-emerald-500 text-white">Approve Payout</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
