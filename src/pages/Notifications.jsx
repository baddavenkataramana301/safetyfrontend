import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    message: "",
  });
  const [groups] = useState(() => {
    const stored = localStorage.getItem("groups");
    return stored ? JSON.parse(stored) : [];
  });

  // Load notifications from localStorage on component mount
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem("notifications");
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        // Initialize with default data if none exists
        const defaultNotifications = [
          {
            id: 1,
            type: "alert",
            title: "Safety Alert: Chemical Spill",
            message:
              "Chemical spill reported in Storage Area B. Immediate action required.",
            time: new Date().toISOString(),
            read: false,
          },
          {
            id: 2,
            type: "success",
            title: "Checklist Completed",
            message:
              "Daily safety inspection for Production Floor has been completed.",
            time: new Date(Date.now() - 3600000).toISOString(),
            read: false,
          },
          {
            id: 3,
            type: "info",
            title: "Training Reminder",
            message: "Fire safety training scheduled for tomorrow at 10:00 AM.",
            time: new Date(Date.now() - 7200000).toISOString(),
            read: true,
          },
          {
            id: 4,
            type: "warning",
            title: "Hazard Update",
            message:
              "Slippery floor hazard in Warehouse A has been marked as in progress.",
            time: new Date(Date.now() - 18000000).toISOString(),
            read: true,
          },
        ];
        setNotifications(defaultNotifications);
        localStorage.setItem(
          "notifications",
          JSON.stringify(defaultNotifications)
        );
      }
    };

    loadNotifications();

    // Listen for storage changes to update notifications in real-time across tabs
    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        loadNotifications();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Save notifications to localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  const handleCreate = () => {
    if (!formData.type || !formData.title || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newNotification = {
      id: Date.now(),
      type: formData.type,
      title: formData.title,
      message: formData.message,
      time: new Date().toISOString(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    window.dispatchEvent(new Event("notificationsUpdated"));
    setFormData({ type: "", title: "", message: "" });
    setIsCreateDialogOpen(false);
    toast.success("Notification created successfully");
  };

  const handleEdit = () => {
    if (!formData.type || !formData.title || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedNotifications = notifications.map((notification) =>
      notification.id === editingNotification.id
        ? { ...notification, ...formData }
        : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    window.dispatchEvent(new Event("notificationsUpdated"));
    setFormData({ type: "", title: "", message: "" });
    setIsEditDialogOpen(false);
    setEditingNotification(null);
    toast.success("Notification updated successfully");
  };

  const handleDelete = (id) => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== id
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    window.dispatchEvent(new Event("notificationsUpdated"));
    toast.success("Notification deleted successfully");
  };

  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    window.dispatchEvent(new Event("notificationsUpdated"));
    toast.success("Notification marked as read");
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    window.dispatchEvent(new Event("notificationsUpdated"));
    toast.success("All notifications marked as read");
  };

  const openEditDialog = (notification) => {
    setEditingNotification(notification);
    setFormData({
      type: notification.type,
      title: notification.title,
      message: notification.message,
    });
    setIsEditDialogOpen(true);
  };

  const getFilteredNotifications = () => {
    let filtered = notifications.filter(
      (notification) =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // For non-admin users, filter to show only their group notifications and general notifications
    if (user?.role !== "admin") {
      const userGroupIds = groups
        .filter((group) => group.members.includes(user?.id))
        .map((group) => group.id);

      filtered = filtered.filter(
        (notification) =>
          !notification.groupId || userGroupIds.includes(notification.groupId)
      );
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Stay updated with safety alerts and updates
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            {user?.role !== "employee" && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Notification</DialogTitle>
                    <DialogDescription>
                      Add a new notification to alert users about safety
                      updates.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter notification title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Enter notification message"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreate}>
                        Create Notification
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="w-full sm:w-auto"
            >
              Mark All as Read
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search notifications by title or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${
                    !notification.read ? "border-primary bg-primary/5" : ""
                  } hover:shadow-md transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              {notification.title}
                            </CardTitle>
                            {!notification.read && (
                              <Badge variant="default" className="h-5">
                                New
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-1">
                            {notification.message}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user?.role !== "employee" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(notification)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Notification
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    notification? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(notification.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.time)}
                      </p>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="w-full sm:w-auto"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>
              Update the notification details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter notification title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-message">Message</Label>
              <Textarea
                id="edit-message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Enter notification message"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update Notification</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Notifications;
