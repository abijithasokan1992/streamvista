import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../utils/cn";
import {
  LayoutDashboard,
  Film,
  FileEdit,
  UploadCloud,
  Users,
  ShieldCheck,
  Scale,
  CreditCard,
  BarChart3,
  Megaphone,
  Settings,
  ListVideo,
  Activity,
  Share2,
  Bot,
  Workflow,
} from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navItems = [
    { name: "Mission Control", path: "/", icon: LayoutDashboard, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Chief AI Operator", path: "/chief-ai-operator", icon: Bot, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Operations Suite", path: "/operations", icon: Workflow, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Instagram Integration", path: "/integrations/instagram", icon: Share2, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner", "buyer", "finance", "qc_staff", "legal_staff", "support_staff"] },
    { name: "Creator Dashboard", path: "/creator", icon: LayoutDashboard, roles: ["creator_partner"] },
    { name: "My Profile", path: "/creator/profile", icon: Users, roles: ["creator_partner"] },
    { name: "My Screenings", path: "/buyer", icon: LayoutDashboard, roles: ["buyer"] },
    { name: "Discover", path: "/buyer/discover", icon: Film, roles: ["buyer"] },
    { name: "Purchase History", path: "/buyer/history", icon: CreditCard, roles: ["buyer"] },
    { name: "Titles", path: "/titles", icon: Film, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Drafts", path: "/drafts", icon: FileEdit, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Uploads", path: "/uploads", icon: UploadCloud, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Screenings", path: "/screenings", icon: ListVideo, roles: ["platform_owner", "founder", "super_admin", "admin", "buyer"] },
    { name: "QC Review", path: "/qc", icon: ShieldCheck, roles: ["platform_owner", "founder", "super_admin", "qc_staff"] },
    { name: "Legal", path: "/legal", icon: Scale, roles: ["platform_owner", "founder", "super_admin", "legal_staff"] },
    { name: "Payments & Revenue", path: "/finance", icon: CreditCard, roles: ["platform_owner", "founder", "super_admin", "finance"] },
    { name: "Analytics", path: "/analytics", icon: BarChart3, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Audit Log", path: "/admin/audit", icon: Activity, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Campaigns", path: "/campaigns", icon: Megaphone, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Users", path: "/users", icon: Users, roles: ["platform_owner", "founder", "super_admin"] },
    { name: "Settings", path: "/settings", icon: Settings, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner", "buyer", "finance", "qc_staff", "legal_staff", "support_staff"] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-brand-navy border-r border-white/5 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-brand-gold"></span>
          StreamVista
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-gold/10 text-brand-gold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
