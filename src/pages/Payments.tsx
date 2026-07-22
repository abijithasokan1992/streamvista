import { Card, CardContent } from "../components/ui/Card";
import { CreditCard } from "lucide-react";

export default function Payments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Payments & Revenue</h1>
        <p className="text-slate-400">Track financial transactions, payouts, and title revenue securely.</p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4">
            <CreditCard size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Secure Finance Area</h3>
          <p className="text-slate-400 max-w-md">Payment records and revenue dashboards will be populated here. Sensitive data is protected by strict roles.</p>
        </CardContent>
      </Card>
    </div>
  );
}
