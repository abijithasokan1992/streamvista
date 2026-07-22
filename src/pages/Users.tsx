import { Card, CardContent } from "../components/ui/Card";
import { Users as UsersIcon } from "lucide-react";

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User Management</h1>
        <p className="text-slate-400">Manage platform users, roles, and buyer mappings.</p>
      </div>

      <Card className="bg-brand-navy-light/30 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <UsersIcon size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">User Directory</h3>
          <p className="text-slate-400 max-w-md">View and manage all active users. User role assignments will be done securely here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
