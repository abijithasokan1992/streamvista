import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { notificationService, AppNotification } from "../services/notifications";
import { Button } from "./ui/Button";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    const fetchNotifs = async () => {
      try {
        const data = await notificationService.getUserNotifications(user.uid);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifs();
    
    // In a real app with Firestore realtime listeners, we would use onSnapshot here.
    // For now, we poll every 10 seconds to simulate realtime behavior without complex setup.
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative p-2 text-slate-300 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-white/10 bg-brand-navy shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 p-4 bg-black/20">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-brand-gold hover:underline">
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                You have no notifications.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 flex gap-3 transition-colors ${!n.read ? 'bg-white/5' : ''}`}
                    onClick={() => !n.read && handleMarkRead(n.id)}
                  >
                    <div className="flex-1 space-y-1 cursor-pointer">
                      <p className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="flex h-5 items-center">
                        <div className="h-2 w-2 rounded-full bg-brand-gold"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
