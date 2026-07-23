import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { databaseService } from "../services/database";
import { Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function CreatorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    studioName: "",
    website: "",
    taxId: "",
    bankAccount: ""
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const users = await databaseService.getUsers();
        const me = users.find(u => u.uid === user.uid);
        if (me) {
          setProfile({
            studioName: me.studioName || "",
            website: me.website || "",
            taxId: me.taxId || "",
            bankAccount: me.bankAccount || ""
          });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      alert("Profile updated successfully");
      navigate("/creator");
    } catch(err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold h-12 w-12" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Creator Profile</h1>
        <p className="text-slate-400">Complete your studio profile to receive payouts and publish titles.</p>
      </div>

      <Card className="bg-brand-navy border-white/10">
        <CardHeader>
          <CardTitle>Studio Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Studio/Company Name</label>
              <Input 
                value={profile.studioName} 
                onChange={e => setProfile({...profile, studioName: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Website URL</label>
              <Input 
                type="url"
                value={profile.website} 
                onChange={e => setProfile({...profile, website: e.target.value})} 
              />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Financial Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tax ID / PAN / EIN</label>
                  <Input 
                    value={profile.taxId} 
                    onChange={e => setProfile({...profile, taxId: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bank Account (IBAN/Acc No)</label>
                  <Input 
                    value={profile.bankAccount} 
                    onChange={e => setProfile({...profile, bankAccount: e.target.value})} 
                    required 
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full mt-6">
              {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle className="mr-2" size={16} />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
