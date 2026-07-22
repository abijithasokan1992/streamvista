import { Card, CardContent } from "../components/ui/Card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and system settings.</p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-400 mb-4">
            <SettingsIcon size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Account Settings</h3>
          <p className="text-slate-400 max-w-md">Configure your profile, notifications, and security settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
