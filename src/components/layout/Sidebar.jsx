import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  Bell,
  AlertCircle,
  FileText,
  GraduationCap,
  BarChart3,
  Users,
  User,
  LogOut,
  ChevronDown,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const getNavItems = () => {
    switch (user?.role) {
      case "admin":
        return [
          { to: "/admin-dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { to: "/users", icon: Users, label: "User Management" },
          // { to: "/groups", icon: UserCheck, label: "Groups" },
          { to: "/hazards", icon: AlertTriangle, label: "HIRA" },
          { to: "/training", icon: GraduationCap, label: "Training" },
          { to: "/checklists", icon: CheckSquare, label: "Checklists" },
          // { to: "/notifications", icon: Bell, label: "Notifications" },
          { to: "/analytics", icon: BarChart3, label: "Reports" },
        ];
      case "safety_manager":
        return [
          {
            to: "/manager-dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
          },
          { to: "/groups", icon: UserCheck, label: "My Groups" },
          { to: "/hazards", icon: AlertTriangle, label: "HIRA" },
          { to: "/checklists", icon: CheckSquare, label: "Checklists" },
          // { to: "/notifications", icon: Bell, label: "Notifications" },
          { to: "/analytics", icon: BarChart3, label: "Analytics" },
          { to: "/alerts", icon: ShieldAlert, label: "Alerts" },
        ];
      case "supervisor":
        return [
          {
            to: "/supervisor-dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
          },
          { to: "/groups", icon: UserCheck, label: "My Groups" },
          { to: "/hazards", icon: AlertTriangle, label: "HIRA" },
          { to: "/checklists", icon: CheckSquare, label: "Checklists" },
          // { to: "/notifications", icon: Bell, label: "Notifications" },
          { to: "/analytics", icon: BarChart3, label: "Analytics" },
          { to: "/alerts", icon: ShieldAlert, label: "Alerts" },
        ];
      case "employee":
        const items = [
          { to: "/groups", icon: UserCheck, label: "My Groups" },
          { to: "/hazards", icon: AlertTriangle, label: "Report HIRA" },
          { to: "/alerts", icon: ShieldAlert, label: "Alerts" },
          // { to: "/notifications", icon: Bell, label: "Notifications" },
          {
            to: user?.approved ? "/checklists" : null,
            icon: CheckSquare,
            label: user?.approved ? "My Checklists" : "My Checklists (Pending)",
            disabled: !user?.approved,
          },
          { to: "/training", icon: GraduationCap, label: "Training" },
        ];
        if (user?.approved) {
          items.unshift({
            to: "/employee-dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
          });
        }
        return items;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-16 md:w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-40">
      <div className="p-3 md:p-6 border-b border-sidebar-border">
        <NavLink to="/home" className="flex items-center gap-2 cursor-pointer">
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm md:text-base">
            S
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-sidebar-foreground">
              SafetyMS
            </h1>
            <p className="text-xs text-sidebar-foreground/80 capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-lg transition-all duration-200",
                  "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-foreground font-medium"
                )
              }
              onClick={() => {
                if (item.label === "Dashboard") {
                  setIsDashboardOpen(!isDashboardOpen);
                }
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden md:inline">{item.label}</span>
              {/* {item.label === "Dashboard" && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 ml-auto transition-transform",
                    isDashboardOpen && "rotate-180"
                  )}
                />
              )} */}
            </NavLink>
          </div>
        ))}
      </nav>
    </aside>
  );
};
