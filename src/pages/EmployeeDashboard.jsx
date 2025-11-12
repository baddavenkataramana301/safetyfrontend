import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Plus,
  FileText,
  Eye,
  TrendingUp,
  Users,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import { getUserPermissions } from "@/lib/permissionUtils";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hazards, setHazards] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [groups, setGroups] = useState([]);

  // Load hazards and notifications from localStorage
  useEffect(() => {
    const storedHazards = localStorage.getItem("hazards");
    if (storedHazards) {
      setHazards(JSON.parse(storedHazards));
    }

    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem("notifications");
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    };

    loadNotifications();

    // Load groups
    const storedGroups = localStorage.getItem("groups");
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    }

    // Listen for storage changes to update notifications in real-time
    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        loadNotifications();
      }
      if (e.key === "groups") {
        const stored = localStorage.getItem("groups");
        setGroups(stored ? JSON.parse(stored) : []);
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

  // Check for newly approved user
  useEffect(() => {
    if (user?.approved) {
      const storedUsers = localStorage.getItem("dummyUsers");
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const currentUser = users.find((u) => u.id === user.id);
        if (currentUser && currentUser.approved && !currentUser.newlyApproved) {
          setShowApprovalPopup(true);
          // Mark as not newly approved to prevent repeated popups
          const updatedUsers = users.map((u) =>
            u.id === user.id ? { ...u, newlyApproved: true } : u
          );
          localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
        }
      }
    }
  }, [user]);

  const activeHazards = hazards.filter((h) => h.status !== "Resolved").length;
  const pendingTasks = hazards.filter((h) => h.status === "Pending").length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const stats = [
    {
      label: "My Checklists",
      value: "5", // This could be dynamic if checklists are stored
      icon: CheckCircle,
      color: "text-success",
      action: () => navigate("/checklists"),
    },
    {
      label: "Active Hazards",
      value: activeHazards.toString(),
      icon: AlertTriangle,
      color: "text-warning",
      action: () => navigate("/hazards"),
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.toString(),
      icon: Clock,
      color: "text-primary",
      action: () => navigate("/notifications"),
    },
    {
      label: "Notifications",
      value: unreadNotifications.toString(),
      icon: Bell,
      color: "text-primary",
      action: () => navigate("/notifications"),
    },
  ];

  // Determine which sections the current user is allowed to see based on group permissions
  const userPermissions = user ? getUserPermissions(user.id) : {};

  // Get user's groups
  const userGroups = user
    ? groups.filter((g) => g.members && g.members.includes(user.id))
    : [];

  // Filter stats according to permissions (if a section is not allowed, hide it)
  const filteredStats = stats.filter((stat) => {
    if (stat.label === "My Checklists" && !userPermissions.checklists)
      return false;
    if (stat.label === "Active Hazards" && !userPermissions.hazards)
      return false;
    if (stat.label === "Pending Tasks" && !userPermissions.reports)
      return false;
    if (stat.label === "Notifications" && !userPermissions.notifications)
      return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Your safety tasks and updates.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredStats.map((stat) => (
            <Card
              key={stat.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">Click to view</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Report issues and complete tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate("/hazards")}
                className="w-full justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                Report Hazard
              </Button>
              {userPermissions.hazards && (
                <Button
                  onClick={() => navigate("/hazards")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  View Hazards
                </Button>
              )}
              {userPermissions.checklists && (
                <Button
                  onClick={() => navigate("/checklists")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Checklist
                </Button>
              )}
              {userPermissions.notifications && (
                <Button
                  onClick={() => navigate("/notifications")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  View Notifications
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tasks</CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Safety Checklist {i}</p>
                      <p className="text-sm text-muted-foreground">
                        Due in {i * 4} hours
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <Bell className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notification.time).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="destructive" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="h-10 w-10 text-primary" />
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.role}</p>
                </div>
              </div>
              <ProfileEditDialog>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </ProfileEditDialog>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Groups</CardTitle>
            <CardDescription>Groups you are assigned to</CardDescription>
          </CardHeader>
          <CardContent>
            {userGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You are not assigned to any groups yet.
              </p>
            ) : (
              <div className="space-y-4">
                {userGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 border rounded-lg bg-muted/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.members.length} members
                        </p>
                      </div>
                    </div>
                    {group.permissions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(group.permissions).map(
                          ([section, perms]) => {
                            // Handle both legacy boolean and CRUD shapes
                            const hasPermission =
                              typeof perms === "boolean"
                                ? perms
                                : perms &&
                                  (perms.read ||
                                    perms.create ||
                                    perms.update ||
                                    perms.delete);

                            return hasPermission ? (
                              <Badge
                                key={section}
                                variant="outline"
                                className="text-xs bg-primary/10"
                              >
                                {section.replace("_", " ")}
                              </Badge>
                            ) : null;
                          }
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Guidelines</CardTitle>
            <CardDescription>
              Important safety information and procedures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-medium">Emergency Procedures</h4>
                <p className="text-sm text-muted-foreground">
                  Know what to do in case of emergency
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <AlertTriangle className="h-8 w-8 text-warning mb-2" />
                <h4 className="font-medium">Hazard Reporting</h4>
                <p className="text-sm text-muted-foreground">
                  How to report safety hazards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Congratulatory Popup */}
        <Dialog open={showApprovalPopup} onOpenChange={setShowApprovalPopup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Congratulations!</DialogTitle>
              <DialogDescription>
                Your account has been approved. Welcome to the team!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setShowApprovalPopup(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
