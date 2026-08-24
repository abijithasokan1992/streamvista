import { NavLink, useLocation } from "react-router-dom";
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
  Handshake,
  Clapperboard,
  ShoppingBag,
} from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const role = user.role;
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: [
        "platform_owner",
        "founder",
        "super_admin",
        "admin",
        "creator_partner",
        "buyer",
        "finance",
        "qc_staff",
        "legal_staff",
        "support_staff",
      ],
    },
    { name: "Creator hub", path: "/creator", icon: Clapperboard, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Buyer hub", path: "/buyer", icon: ShoppingBag, roles: ["platform_owner", "founder", "super_admin", "admin", "buyer"] },
    { name: "Founder Command", path: "/command", icon: ShieldCheck, roles: ["platform_owner", "founder", "super_admin"] },
    { name: "Sales Agent", path: "/sales", icon: Handshake, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    { name: "Titles", path: "/titles", icon: Film, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Drafts", path: "/drafts", icon: FileEdit, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    { name: "Uploads", path: "/uploads", icon: UploadCloud, roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner"] },
    {
      name: "Screenings",
      path: "/screenings",
      icon: ListVideo,
      roles: ["platform_owner", "founder", "super_admin", "admin", "buyer", "creator_partner"],
    },
    { name: "QC Review", path: "/qc", icon: ShieldCheck, roles: ["platform_owner", "founder", "super_admin", "admin", "qc_staff"] },
    { name: "Legal", path: "/legal", icon: Scale, roles: ["platform_owner", "founder", "super_admin", "admin", "legal_staff"] },
    { name: "Payments & Revenue", path: "/finance", icon: CreditCard, roles: ["platform_owner", "founder", "super_admin", "admin", "finance"] },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      roles: ["platform_owner", "founder", "super_admin", "admin", "creator_partner", "buyer"],
    },
    { name: "Campaigns", path: "/campaigns", icon: Megaphone, roles: ["platform_owner", "founder", "super_admin", "admin", "buyer"] },
    { name: "Users", path: "/users", icon: Users, roles: ["platform_owner", "founder", "super_admin", "admin"] },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      roles: [
        "platform_owner",
        "founder",
        "super_admin",
        "admin",
        "creator_partner",
        "buyer",
        "finance",
        "qc_staff",
        "legal_staff",
        "support_staff",
      ],
    },
  ];

  const workspaceMenu = location.pathname.startsWith("/workspace/creator")
    ? new Set(["Titles", "Drafts", "Uploads", "Screenings", "Creator hub", "Dashboard"])
    : location.pathname.startsWith("/workspace/buyer")
      ? new Set(["Screenings", "Analytics", "Campaigns", "Buyer hub", "Dashboard"])
      : location.pathname.startsWith("/workspace/studio")
        ? new Set(["Titles", "QC Review", "Legal", "Payments & Revenue", "Users", "Dashboard"])
        : null;

  const visibleNavItems = navItems.filter((item) => {
    if (workspaceMenu) return workspaceMenu.has(item.name);
    return item.roles.includes(role);
  });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <span className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-950">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E4FC7] text-[10px] font-black text-white">
            S
          </span>
          StreamVista
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
              )
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-400">
        {user.displayName || user.email}
        <br />
        <span className="capitalize">{role}</span>
      </div>
    </aside>
  );
}
