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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  User,
  Calendar,
  MapPin,
  FileText,
  Send,
  Users,
  Shield,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createAlertNotification } from "@/lib/notificationUtils";

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    location: "",
    severity: "",
    status: "Active",
    description: "",
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingAlert, setViewingAlert] = useState(null);

  // Load alerts from localStorage on component mount
  useEffect(() => {
    const storedAlerts = localStorage.getItem("alerts");
    if (storedAlerts) {
      setAlerts(JSON.parse(storedAlerts));
    } else {
      // Initialize with default data if none exists
      const defaultAlerts = [
        {
          id: 1,
          type: "Safety Alert",
          location: "Warehouse A",
          severity: "High",
          date: new Date().toISOString().split("T")[0],
          status: "Active",
          description: "Immediate safety concern in loading dock area",
          createdBy: "Safety Manager",
          role: "safety_manager",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: "Emergency Alert",
          location: "Production Floor",
          severity: "Critical",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          status: "Resolved",
          description: "Chemical spill in production area",
          createdBy: "Supervisor",
          role: "supervisor",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          type: "Maintenance Alert",
          location: "Storage Room",
          severity: "Medium",
          date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
          status: "Active",
          description: "Equipment maintenance required",
          createdBy: "Safety Manager",
          role: "safety_manager",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setAlerts(defaultAlerts);
      localStorage.setItem("alerts", JSON.stringify(defaultAlerts));
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem("alerts", JSON.stringify(alerts));
    }
  }, [alerts]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleCreate = () => {
    if (
      !formData.type ||
      !formData.location ||
      !formData.severity ||
      !formData.description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newAlert = {
      id: Date.now(),
      type: formData.type,
      location: formData.location,
      severity: formData.severity,
      date: new Date().toISOString().split("T")[0],
      status: formData.status,
      description: formData.description,
      createdBy: user?.name || "Unknown",
      role: user?.role || "unknown",
      createdAt: new Date().toISOString(),
    };

    setAlerts([...alerts, newAlert]);
    setFormData({
      type: "",
      location: "",
      severity: "",
      status: "Active",
      description: "",
    });
    setIsCreateDialogOpen(false);

    // Create notification for all users
    createAlertNotification("create", newAlert);

    toast.success("Alert created successfully");
  };

  const handleEdit = () => {
    if (
      !formData.type ||
      !formData.location ||
      !formData.severity ||
      !formData.description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedAlerts = alerts.map((alert) =>
      alert.id === editingAlert.id ? { ...alert, ...formData } : alert
    );
    setAlerts(updatedAlerts);
    setFormData({
      type: "",
      location: "",
      severity: "",
      status: "Active",
      description: "",
    });
    setIsEditDialogOpen(false);

    // Create notification for all users
    const updatedAlert = updatedAlerts.find((a) => a.id === editingAlert.id);
    createAlertNotification("update", updatedAlert);

    toast.success("Alert updated successfully");
  };

  const handleDelete = (id) => {
    const alertToDelete = alerts.find((a) => a.id === id);
    setAlerts(alerts.filter((alert) => alert.id !== id));

    // Create notification for all users
    createAlertNotification("delete", alertToDelete);

    toast.success("Alert deleted successfully");
  };

  const handleView = (alert) => {
    setViewingAlert(alert);
    setIsViewDialogOpen(true);
  };

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-3">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Alerts</h1>
            <p className="text-muted-foreground">
              {user?.role === "employee"
                ? "View safety alerts and notifications"
                : "Manage safety alerts and notifications"}
            </p>
          </div>
          {user?.role !== "employee" && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new safety alert.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Alert Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alert type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Safety Alert">
                          Safety Alert
                        </SelectItem>
                        <SelectItem value="Emergency Alert">
                          Emergency Alert
                        </SelectItem>
                        <SelectItem value="Maintenance Alert">
                          Maintenance Alert
                        </SelectItem>
                        <SelectItem value="General Alert">
                          General Alert
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) =>
                        setFormData({ ...formData, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter alert description"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className="hover:shadow-lg transition-shadow w-full"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(alert.status)}
                    <CardTitle className="text-lg">{alert.type}</CardTitle>
                  </div>
                  <Badge
                    className={`${getSeverityColor(alert.severity)} text-white`}
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <CardDescription className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{alert.location}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {alert.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{alert.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(alert.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(alert)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {user?.role !== "employee" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAlert(alert);
                          setFormData({
                            type: alert.type,
                            location: alert.location,
                            severity: alert.severity,
                            status: alert.status,
                            description: alert.description,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the alert.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(alert.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Alert</DialogTitle>
              <DialogDescription>
                Update the details of the alert.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-type">Alert Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Safety Alert">Safety Alert</SelectItem>
                    <SelectItem value="Emergency Alert">
                      Emergency Alert
                    </SelectItem>
                    <SelectItem value="Maintenance Alert">
                      Maintenance Alert
                    </SelectItem>
                    <SelectItem value="General Alert">General Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="edit-severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter alert description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update Alert</Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Alert Details</DialogTitle>
              <DialogDescription>
                Detailed information about the alert.
              </DialogDescription>
            </DialogHeader>
            {viewingAlert && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm font-medium">{viewingAlert.type}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm font-medium">
                      {viewingAlert.location}
                    </p>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Badge
                      className={`${getSeverityColor(
                        viewingAlert.severity
                      )} text-white`}
                    >
                      {viewingAlert.severity}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(viewingAlert.status)}
                      <span className="text-sm font-medium">
                        {viewingAlert.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm font-medium">
                      {new Date(viewingAlert.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label>Created By</Label>
                    <p className="text-sm font-medium">
                      {viewingAlert.createdBy}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm">{viewingAlert.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
