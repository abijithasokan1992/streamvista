import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Settings as SettingsIcon, User, Building2, CreditCard, Bell, Key, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { databaseService } from "../services/database";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'payout' | 'notifications' | 'security'>('profile');
  
  // Form State
  const [displayName, setDisplayName] = useState(user?.displayName || "Abijith Asokan");
  const [email] = useState(user?.email || "abijithasokan@crayonspictures.com");
  const [studioName, setStudioName] = useState(user?.studioName || "Crayons Pictures");
  const [taxId, setTaxId] = useState(user?.taxId || "32AAAC1234F1Z5");
  const [bankAccount, setBankAccount] = useState(user?.bankAccount || "918020045612389");
  const [ifscCode, setIfscCode] = useState("UTIB0000123");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification Preferences
  const [emailQC, setEmailQC] = useState(true);
  const [emailLegal, setEmailLegal] = useState(true);
  const [emailPayout, setEmailPayout] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (databaseService.isSupabase()) {
        await databaseService.supabase.logAuditAction(
          user?.uid || 'user',
          'SETTINGS_UPDATED',
          'user_profile',
          user?.uid,
          { studioName, taxId, updatedAt: new Date().toISOString() }
        );
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <SettingsIcon className="text-brand-gold h-8 w-8" /> Organization & Account Settings
          </h1>
          <p className="text-slate-400 text-sm">Manage studio details, payout banking info, security keys, and notification preferences.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>Organization profile and payout preferences updated successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <Card className="bg-brand-navy-light/40 border border-white/10 p-2 lg:col-span-1 h-fit">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-brand-gold text-brand-navy font-bold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <User size={18} /> Studio & Profile
            </button>
            <button
              onClick={() => setActiveTab('payout')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payout' ? 'bg-brand-gold text-brand-navy font-bold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <CreditCard size={18} /> Payout & Bank Account
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-brand-gold text-brand-navy font-bold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Bell size={18} /> Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-brand-gold text-brand-navy font-bold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Key size={18} /> Security & API Keys
            </button>
          </div>
        </Card>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card className="bg-brand-navy-light/40 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Building2 className="text-brand-gold" /> Studio & Profile Credentials
                </CardTitle>
                <CardDescription className="text-slate-400">Configure your studio entity and primary account details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Account Display Name:</label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-black/50 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Primary Email Address:</label>
                      <Input value={email} disabled className="bg-black/80 border-white/10 text-slate-400 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Studio / Production Entity Name:</label>
                      <Input value={studioName} onChange={e => setStudioName(e.target.value)} className="bg-black/50 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Assigned System Role:</label>
                      <Input value={user?.role || 'creator_partner'} disabled className="bg-black/80 border-white/10 text-brand-gold uppercase font-semibold text-xs cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-brand-gold text-brand-navy font-semibold hover:bg-yellow-500 text-xs px-6">
                      {saving ? "Saving..." : "Save Profile Details"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'payout' && (
            <Card className="bg-brand-navy-light/40 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <CreditCard className="text-brand-gold" /> Bank Account & Payout Setup
                </CardTitle>
                <CardDescription className="text-slate-400">Direct settlement bank account and GST/Tax ID verification.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">GSTIN / Tax Identification Number:</label>
                    <Input value={taxId} onChange={e => setTaxId(e.target.value)} className="bg-black/50 border-white/10 text-white" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Bank Account Number:</label>
                      <Input value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="bg-black/50 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Bank IFSC / SWIFT Code:</label>
                      <Input value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="bg-black/50 border-white/10 text-white" />
                    </div>
                  </div>

                  <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold text-xs flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>Bank account details are verified before processing automated RazorpayX payout settlements.</span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-brand-gold text-brand-navy font-semibold hover:bg-yellow-500 text-xs px-6">
                      {saving ? "Saving..." : "Save Payout Credentials"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-brand-navy-light/40 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Bell className="text-brand-gold" /> Notification Preferences
                </CardTitle>
                <CardDescription className="text-slate-400">Control automated alerts for content inspection, legal status, and payouts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-semibold text-white">Technical QC Review Alerts</div>
                    <div className="text-xs text-slate-400">Receive email notification when title passes or fails QC inspection.</div>
                  </div>
                  <input type="checkbox" checked={emailQC} onChange={e => setEmailQC(e.target.checked)} className="h-5 w-5 accent-brand-gold cursor-pointer" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-semibold text-white">Legal & Clearance Updates</div>
                    <div className="text-xs text-slate-400">Receive notification when rights documentation is approved by Legal desk.</div>
                  </div>
                  <input type="checkbox" checked={emailLegal} onChange={e => setEmailLegal(e.target.checked)} className="h-5 w-5 accent-brand-gold cursor-pointer" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-semibold text-white">Payout & Statement Confirmations</div>
                    <div className="text-xs text-slate-400">Receive notification when monthly revenue statements are imported or payouts processed.</div>
                  </div>
                  <input type="checkbox" checked={emailPayout} onChange={e => setEmailPayout(e.target.checked)} className="h-5 w-5 accent-brand-gold cursor-pointer" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-brand-navy-light/40 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Key className="text-brand-gold" /> Security & Platform Access
                </CardTitle>
                <CardDescription className="text-slate-400">Manage multi-factor authentication, active sessions, and API tokens.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-black/40 rounded-lg border border-white/10 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-semibold text-white">Active Session Token</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">sv_live_tok_991823719283xxxx</div>
                  </div>
                  <Button variant="secondary" className="text-xs">Revoke Token</Button>
                </div>

                <div className="p-4 bg-black/40 rounded-lg border border-white/10 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-semibold text-white">Two-Factor Authentication (2FA)</div>
                    <div className="text-xs text-slate-400">Hardware key or TOTP authenticator app integration.</div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full uppercase">Enabled</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
