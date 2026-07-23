import { useAuth } from "../contexts/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "./ui/Button";
import { NotificationBell } from "./NotificationBell";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-brand-navy/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex-1"></div>
      
      {user && (
        <div className="flex items-center gap-6">
          <NotificationBell />
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
              <UserIcon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200 leading-none">{user.displayName}</span>
              <span className="text-xs text-brand-gold mt-1 capitalize leading-none">{user.role.replace("_", " ")}</span>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-white">
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
