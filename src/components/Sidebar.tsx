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
  ListVideo
} from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navItems = [
    { name: "Workspace", path: "/dashboard", icon: LayoutDashboard, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Founder Command", path: "/command", icon: ShieldCheck, roles: ["platform_owner", "founder", "super_admin"] },
    { name: "Creator Dashboard", path: "/creator", icon: LayoutDashboard, roles: ["creator_partner"] },
    { name: "Buyer Dashboard", path: "/buyer", icon: LayoutDashboard, roles: ["buyer"] },
    { name: "Titles", path: "/titles", icon: Film, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Drafts", path: "/drafts", icon: FileEdit, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Uploads", path: "/uploads", icon: UploadCloud, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Screenings", path: "/screenings", icon: ListVideo, roles: ["platform_owner", "founder", "super_admin", "admin", "buyer"] },
    { name: "QC Review", path: "/qc", icon: ShieldCheck, roles: ["platform_owner", "founder", "super_admin", "qc_staff"] },
    { name: "Legal", path: "/legal", icon: Scale, roles: ["platform_owner", "founder", "super_admin", "legal_staff"] },
    { name: "Payments & Revenue", path: "/finance", icon: CreditCard, roles: ["platform_owner", "founder", "super_admin", "finance"] },
    { name: "Analytics", path: "/analytics", icon: BarChart3, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Campaigns", path: "/campaigns", icon: Megaphone, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Users", path: "/users", icon: Users, roles: ["platform_owner", "founder", "super_admin"] },
    { name: "Settings", path: "/settings", icon: Settings, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner", "buyer", "finance", "qc_staff", "legal_staff", "support_staff"] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-violet-600"></span>
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
                  ? "bg-violet-50 text-violet-700" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
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
