import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";
import { Card } from "./ui/Card";
import { Users } from "lucide-react";

export function RoleSwitcher() {
  const { user, switchMockRole } = useAuth();
  
  // Only show if we are in mock mode
  if (import.meta.env.VITE_DATA_MODE === "firebase") return null;

  const roles: UserRole[] = [
    "platform_owner",
    "founder",
    "super_admin",
    "admin",
    "creator_partner",
    "buyer",
    "finance",
    "qc_staff",
    "legal_staff",
    "support_staff"
  ];

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 border-brand-orange/30 bg-brand-navy-light/95 shadow-2xl max-w-xs">
      <div className="flex items-center gap-2 mb-3 text-brand-orange font-semibold text-sm">
        <Users size={16} />
        <span>Mock Role Switcher</span>
      </div>
      <select
        className="w-full bg-brand-black border border-white/10 rounded px-2 py-1.5 text-sm text-slate-300 focus:ring-1 focus:ring-brand-gold outline-none"
        value={user?.role || ""}
        onChange={(e) => switchMockRole(e.target.value as UserRole)}
      >
        <option value="" disabled>Select a role...</option>
        {roles.map(role => (
          <option key={role} value={role}>
            {role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </option>
        ))}
      </select>
    </Card>
  );
}
