import { useAuth } from "../contexts/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "./ui/Button";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex-1"></div>
      
      {user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
              <UserIcon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 leading-none">{user.displayName}</span>
              <span className="text-xs text-violet-600 mt-1 capitalize leading-none">{user.role.replace("_", " ")}</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-slate-950">
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
