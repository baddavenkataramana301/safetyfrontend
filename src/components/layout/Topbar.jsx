import {
  Bell,
  Search,
  Home,
  Briefcase,
  Info,
  Mail,
  ShieldAlert,
  ChevronDown,
  LogOut,
  Edit,
  User,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem("notifications");
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        const unread = notifications.filter(
          (notification) => !notification.read
        ).length;
        setUnreadCount(unread);
      }
    };

    loadNotifications();

    // Listen for storage changes to update unread count in real-time
    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        loadNotifications();
      }
    };

    // Listen for custom notificationsUpdated event
    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notificationsUpdated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdated
      );
    };
  }, []);

  return (
    <header className="h-12 md:h-16 border-b bg-card flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-3 md:gap-6">
        <Link to="/" className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <span className="text-lg md:text-xl font-bold hidden md:inline">
            SafetyMS
          </span>
        </Link>
        <Link
          to="/"
          className=" items-center gap-2 text-sm hover:text-primary transition-colors hidden md:flex"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/notifications"
          className="relative p-1 md:p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-destructive text-xs">
              {unreadCount}
            </Badge>
          )}
        </Link>

        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l relative">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 md:gap-3 hover:bg-accent rounded-lg p-1 transition-colors"
          >
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm md:text-base">
              {user?.name.charAt(0)}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isProfileMenuOpen && "rotate-180"
              )}
            />
          </button>
          <div className="text-left md:hidden">
            <p className="text-xs font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
          {isProfileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role?.replace("_", " ")}
                    </p>
                  </div>
                  <ProfileEditDialog>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </ProfileEditDialog>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
