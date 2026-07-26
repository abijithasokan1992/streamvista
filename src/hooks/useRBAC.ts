import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";

export type MockRole = "creator" | "studio_producer" | "global_buyer" | "investor" | "consumer" | "admin_os";

export const MOCK_ROLES: { id: MockRole; name: string; label: string; icon: string }[] = [
  { id: "creator", name: "Creator", label: "🎬 Creator Workspace", icon: "🎬" },
  { id: "studio_producer", name: "Studio Producer", label: "🏢 Studio / Producer Slate", icon: "🏢" },
  { id: "global_buyer", name: "Global Buyer", label: "🌐 Global Buyer Marketplace", icon: "🌐" },
  { id: "investor", name: "Investor", label: "📈 Investor Workspace", icon: "📈" },
  { id: "consumer", name: "Consumer", label: "📺 Consumer (Crayons Loop)", icon: "📺" },
  { id: "admin_os", name: "Super Admin", label: "🛡️ Admin OS (Super Admin)", icon: "🛡️" }
];

export function useRBAC() {
  const { user } = useAuth();
  const [activeRole, setActiveRoleState] = useState<string>(() => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("mock_user_role");
      if (stored) return stored;
    }
    return user?.role || "admin_os";
  });

  useEffect(() => {
    if (user?.role) {
      const stored = typeof localStorage !== "undefined" ? localStorage.getItem("mock_user_role") : null;
      if (!stored) {
        setActiveRoleState(user.role);
      }
    }
  }, [user]);

  const switchRole = (newRole: string) => {
    setActiveRoleState(newRole);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("mock_user_role", newRole);
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (activeRole === "admin_os" || activeRole === "admin" || activeRole === "super_admin" || activeRole === "founder") {
      return true;
    }
    return roles.includes(activeRole);
  };

  const hasPermission = (permission: "can_upload" | "can_approve_qc" | "can_approve_legal" | "can_lock_escrow" | "can_view_analytics"): boolean => {
    if (activeRole === "admin_os" || activeRole === "admin" || activeRole === "super_admin") return true;

    switch (permission) {
      case "can_upload":
        return ["creator", "studio_producer"].includes(activeRole);
      case "can_lock_escrow":
        return ["global_buyer", "investor"].includes(activeRole);
      case "can_approve_qc":
      case "can_approve_legal":
        return activeRole === "admin_os";
      case "can_view_analytics":
        return ["creator", "studio_producer", "investor", "admin_os"].includes(activeRole);
      default:
        return false;
    }
  };

  return {
    activeRole,
    switchRole,
    hasRole,
    hasPermission
  };
}
