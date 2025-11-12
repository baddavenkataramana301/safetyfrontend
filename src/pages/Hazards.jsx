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
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { dummyUsers } from "@/data";
import { createHazardNotification } from "@/lib/notificationUtils";

const Hazards = () => {
  const { user } = useAuth();
  const [hazards, setHazards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHazard, setEditingHazard] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    location: "",
    severity: "",
    status: "Open",
    description: "",
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingHazard, setViewingHazard] = useState(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isSendToApprovalDialogOpen, setIsSendToApprovalDialogOpen] =
    useState(false);
  const [approvalData, setApprovalData] = useState({
    priority: "Medium",
    timeline: "",
    assignedTeam: "",
    remarks: "",
  });
  const [approvalAction, setApprovalAction] = useState(""); // "approve" or "reject"
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assigningHazard, setAssigningHazard] = useState(null);

  // Load hazards from localStorage on component mount
  useEffect(() => {
    const storedHazards = localStorage.getItem("hazards");
    if (storedHazards) {
      setHazards(JSON.parse(storedHazards));
    } else {
      // Initialize with default data if none exists
      const defaultHazards = [
        {
          id: 1,
          type: "Slip/Trip",
          location: "Warehouse A",
          severity: "High",
          date: new Date().toISOString().split("T")[0],
          status: "Open",
          description: "Water spill near loading dock",
          reportedBy: "John Doe",
          role: "employee",
          priority: null,
          timeline: null,
          assignedTeam: null,
          approvalRemarks: null,
          adminApproval: null, // null, "approved", "pending"
          managerApproval: null, // null, "approved", "pending"
          supervisorApproval: null, // null, "approved", "pending"
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: "Electrical",
          location: "Production Floor",
          severity: "Critical",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          status: "Pending",
          description: "Exposed wiring in machine panel",
          reportedBy: "Jane Smith",
          role: "employee",
          priority: "High",
          timeline: "2024-01-20",
          assignedTeam: "Electrical Team",
          approvalRemarks: "Immediate attention required",
          adminApproval: "approved",
          managerApproval: "approved",
          supervisorApproval: "approved",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          type: "Chemical",
          location: "Storage Room",
          severity: "Medium",
          date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
          status: "Resolved",
          description: "Improper chemical storage",
          reportedBy: "Bob Johnson",
          role: "employee",
          priority: "Medium",
          timeline: "2024-01-18",
          assignedTeam: "Safety Team",
          approvalRemarks: "Resolved with proper storage procedures",
          adminApproval: "approved",
          managerApproval: "approved",
          supervisorApproval: "approved",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setHazards(defaultHazards);
      localStorage.setItem("hazards", JSON.stringify(defaultHazards));
    }
  }, []);

  // Save hazards to localStorage whenever hazards change
  useEffect(() => {
    if (hazards.length > 0) {
      localStorage.setItem("hazards", JSON.stringify(hazards));
    }
  }, [hazards]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-destructive text-destructive-foreground";
      case "High":
        return "bg-warning text-warning-foreground";
      case "Medium":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-destructive/20 text-destructive";
      case "Pending":
        return "bg-warning/20 text-warning";
      case "Approved":
        return "bg-success/20 text-success";
      case "In Progress":
        return "bg-blue-500/20 text-blue-500";
      case "Resolved":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
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

    const newHazard = {
      id: Date.now(),
      type: formData.type,
      location: formData.location,
      severity: formData.severity,
      status: "Open",
      description: formData.description,
      date: new Date().toISOString().split("T")[0],
      reportedBy: user?.name || "Unknown",
      role: user?.role || "employee",
      priority: null,
      timeline: null,
      assignedTeam: null,
      approvalRemarks: null,
      adminApproval: null,
      managerApproval: null,
      supervisorApproval: null,
      createdAt: new Date().toISOString(),
    };

    setHazards([newHazard, ...hazards]);
    setFormData({
      type: "",
      location: "",
      severity: "",
      status: "Open",
      description: "",
    });
    setIsCreateDialogOpen(false);

    // Create notification for all users
    createHazardNotification("create", newHazard);

    toast.success(
      "Hazard reported successfully! It will be reviewed by management."
    );
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

    const updatedHazards = hazards.map((hazard) =>
      hazard.id === editingHazard.id ? { ...hazard, ...formData } : hazard
    );
    setHazards(updatedHazards);
    setFormData({
      type: "",
      location: "",
      severity: "",
      status: "Open",
      description: "",
    });
    setIsEditDialogOpen(false);
    setEditingHazard(null);

    // Create notification for all users
    const updatedHazard = updatedHazards.find((h) => h.id === editingHazard.id);
    createHazardNotification("update", updatedHazard);

    toast.success("Hazard updated successfully!");
  };

  const handleDelete = (id) => {
    const hazardToDelete = hazards.find((h) => h.id === id);
    setHazards(hazards.filter((hazard) => hazard.id !== id));

    // Create notification for all users
    createHazardNotification("delete", hazardToDelete);

    toast.success("Hazard deleted successfully!");
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedHazards = hazards.map((hazard) =>
      hazard.id === id ? { ...hazard, status: newStatus } : hazard
    );
    setHazards(updatedHazards);

    // Create notification for status changes
    const updatedHazard = updatedHazards.find((h) => h.id === id);
    if (newStatus === "Resolved") {
      createHazardNotification("resolve", updatedHazard);
    } else if (newStatus === "Approved") {
      createHazardNotification("approve", updatedHazard);
    }

    toast.success(`Hazard status updated to ${newStatus}`);
  };

  const handleSendToApproval = () => {
    // Create notifications for manager and supervisor
    const storedNotifications = localStorage.getItem("notifications");
    const notifications = storedNotifications
      ? JSON.parse(storedNotifications)
      : [];
    const newNotifications = [
      {
        id: Date.now(),
        title: "Hazard Approval Required",
        message: `Hazard ${viewingHazard.type} in ${viewingHazard.location} reported by ${viewingHazard.reportedBy} requires your approval.`,
        type: "warning",
        date: new Date().toISOString(),
        read: false,
      },
      {
        id: Date.now() + 1,
        title: "Hazard Approval Required",
        message: `Hazard ${viewingHazard.type} in ${viewingHazard.location} reported by ${viewingHazard.reportedBy} requires your approval.`,
        type: "warning",
        date: new Date().toISOString(),
        read: false,
      },
    ];
    localStorage.setItem(
      "notifications",
      JSON.stringify([...notifications, ...newNotifications])
    );

    setHazards(
      hazards.map((hazard) =>
        hazard.id === viewingHazard.id
          ? {
              ...hazard,
              status: "Pending",
              adminApproval: "approved",
              managerApproval: "pending",
              supervisorApproval: "pending",
            }
          : hazard
      )
    );
    setIsSendToApprovalDialogOpen(false);
    setViewingHazard(null);
    toast.success("Hazard sent to management for approval!");
  };

  const handleApproval = (action) => {
    if (action === "approve") {
      if (
        !approvalData.priority ||
        !approvalData.timeline ||
        !approvalData.assignedTeam
      ) {
        toast.error("Please fill in all required fields for approval");
        return;
      }
    }

    const approvalField =
      user?.role === "admin"
        ? "adminApproval"
        : user?.role === "manager"
        ? "managerApproval"
        : user?.role === "supervisor"
        ? "supervisorApproval"
        : null;

    if (!approvalField) return;

    const newStatus = action === "approve" ? "approved" : "pending";

    setHazards(
      hazards.map((hazard) =>
        hazard.id === viewingHazard.id
          ? {
              ...hazard,
              [approvalField]: newStatus,
              ...(action === "approve" && {
                priority: approvalData.priority,
                timeline: approvalData.timeline,
                assignedTeam: approvalData.assignedTeam,
                approvalRemarks: approvalData.remarks,
              }),
            }
          : hazard
      )
    );

    // Check if all approvals are done
    const updatedHazard = hazards.find((h) => h.id === viewingHazard.id);
    if (updatedHazard) {
      const allApproved =
        updatedHazard.adminApproval === "approved" &&
        updatedHazard.managerApproval === "approved" &&
        updatedHazard.supervisorApproval === "approved";

      if (allApproved) {
        setHazards((prev) =>
          prev.map((h) =>
            h.id === viewingHazard.id ? { ...h, status: "Approved" } : h
          )
        );
        // Create notification for admin about approval completion
        const storedNotifications = localStorage.getItem("notifications");
        const notifications = storedNotifications
          ? JSON.parse(storedNotifications)
          : [];
        const completionNotification = {
          id: Date.now(),
          title: "Hazard Approved",
          message: `Hazard ${updatedHazard.type} in ${updatedHazard.location} has been approved by all parties.`,
          type: "success",
          date: new Date().toISOString(),
          read: false,
        };
        localStorage.setItem(
          "notifications",
          JSON.stringify([...notifications, completionNotification])
        );
      }
    }

    setApprovalData({
      priority: "Medium",
      timeline: "",
      assignedTeam: "",
      remarks: "",
    });
    setIsApprovalDialogOpen(false);
    setViewingHazard(null);
    toast.success(
      action === "approve"
        ? "Hazard approved successfully!"
        : "Hazard marked as pending!"
    );
  };

  const openViewDialog = (hazard) => {
    setViewingHazard(hazard);
    setIsViewDialogOpen(true);
  };

  const openApprovalDialog = (hazard, action) => {
    setViewingHazard(hazard);
    setApprovalAction(action);
    setApprovalData({
      priority: hazard.priority || "Medium",
      timeline: hazard.timeline || "",
      assignedTeam: hazard.assignedTeam || "",
      remarks: hazard.approvalRemarks || "",
    });
    setIsApprovalDialogOpen(true);
  };

  const openSendToApprovalDialog = (hazard) => {
    setViewingHazard(hazard);
    setIsSendToApprovalDialogOpen(true);
  };

  const openAssignDialog = (hazard) => {
    setAssigningHazard(hazard);
    setSelectedEmployees(hazard.assignedEmployees || []);
    setIsAssignDialogOpen(true);
  };

  const handleAssignEmployees = () => {
    if (!assigningHazard) return;

    setHazards(
      hazards.map((hazard) =>
        hazard.id === assigningHazard.id
          ? { ...hazard, assignedEmployees: selectedEmployees }
          : hazard
      )
    );
    setIsAssignDialogOpen(false);
    setAssigningHazard(null);
    setSelectedEmployees([]);
    toast.success("Employees assigned successfully!");
  };

  const openEditDialog = (hazard) => {
    setEditingHazard(hazard);
    setFormData({
      type: hazard.type,
      location: hazard.location,
      severity: hazard.severity,
      status: hazard.status,
      description: hazard.description,
    });
    setIsEditDialogOpen(true);
  };

  const filteredHazards = hazards.filter((hazard) => {
    const matchesSearch =
      hazard.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.severity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.assignedTeam?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {user?.role === "employee"
                ? "Hazard Reports"
                : "Hazard Management"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {user?.role === "employee"
                ? "View all hazard reports and manage your own"
                : "Review and approve workplace hazard reports"}
            </p>
          </div>
          {user?.role === "employee" && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Hazard
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report New Hazard</DialogTitle>
                  <DialogDescription>
                    Fill in the details of the hazard you've identified
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Hazard Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Slip/Trip">
                            Slip/Trip/Fall
                          </SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Chemical">Chemical</SelectItem>
                          <SelectItem value="Fire">Fire</SelectItem>
                          <SelectItem value="Machinery">Machinery</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="e.g., Warehouse A"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity Level</Label>
                    <div className="flex gap-2">
                      {["Low", "Medium", "High", "Critical"].map((level) => (
                        <Button
                          key={level}
                          type="button"
                          variant={
                            formData.severity === level ? "default" : "outline"
                          }
                          className="flex-1"
                          onClick={() =>
                            setFormData({ ...formData, severity: level })
                          }
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
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
                      placeholder="Describe the hazard in detail..."
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
                    <Button onClick={handleCreate}>Submit Hazard Report</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search hazards by type, location, severity, reporter, or assigned team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHazards.map((hazard) => (
                <Card
                  key={hazard.id}
                  className={`hover:shadow-md transition-shadow w-full ${
                    hazard.status === "Pending"
                      ? "border-l-4 border-l-warning"
                      : hazard.status === "Open"
                      ? "border-l-4 border-l-destructive"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                          <AlertTriangle className="h-6 w-6 text-warning" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                            <CardTitle className="text-lg">
                              {hazard.type}
                            </CardTitle>
                            <div className="flex gap-1">
                              {hazard.status === "Open" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs w-fit"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Open
                                </Badge>
                              )}
                              {hazard.status === "Pending" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs w-fit"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending Approval
                                </Badge>
                              )}
                              {hazard.status === "Approved" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-success/10 text-success w-fit"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardDescription className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hazard.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {hazard.reportedBy}
                            </span>
                            {hazard.assignedTeam && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {hazard.assignedTeam}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2 min-w-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(hazard)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user?.role === "employee" &&
                          hazard.reportedBy === user.name && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(hazard)}
                                className="w-full sm:w-auto"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Hazard Report
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete your
                                      hazard report? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(hazard.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        {user?.role === "employee" &&
                          hazard.reportedBy !== user.name && (
                            <Badge variant="outline" className="text-xs w-fit">
                              View Only
                            </Badge>
                          )}
                        {user?.role !== "employee" && (
                          <>
                            {hazard.status === "Open" &&
                              user?.role === "admin" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    openSendToApprovalDialog(hazard)
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Send to Approval
                                </Button>
                              )}
                            {hazard.status === "Pending" && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    openApprovalDialog(hazard, "approve")
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openApprovalDialog(hazard, "reject")
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Pending
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(hazard)}
                              className="w-full sm:w-auto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Hazard
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this hazard
                                    report? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(hazard.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        <Badge
                          className={`${getSeverityColor(
                            hazard.severity
                          )} w-fit`}
                        >
                          {hazard.severity}
                        </Badge>
                        {hazard.priority && (
                          <Badge variant="outline" className="w-fit">
                            Priority: {hazard.priority}
                          </Badge>
                        )}
                        {user?.role !== "employee" &&
                          hazard.status === "Approved" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAssignDialog(hazard)}
                                className="w-full sm:w-auto"
                              >
                                <Users className="h-4 w-4 mr-1" />
                                Assign Employees
                              </Button>
                              <Select
                                value={hazard.status}
                                onValueChange={(value) =>
                                  handleStatusChange(hazard.id, value)
                                }
                              >
                                <SelectTrigger className="w-full sm:w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Approved">
                                    Approved
                                  </SelectItem>
                                  <SelectItem value="In Progress">
                                    In Progress
                                  </SelectItem>
                                  <SelectItem value="Resolved">
                                    Resolved
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {hazard.description}
                    </p>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Reported on {hazard.date}
                      </span>
                      {hazard.timeline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {hazard.timeline}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Hazard Report Details
              </DialogTitle>
              <DialogDescription>
                Complete details of the hazard report
              </DialogDescription>
            </DialogHeader>
            {viewingHazard && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hazard Type</Label>
                    <div className="p-2 bg-muted rounded">
                      {viewingHazard.type}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="p-2 bg-muted rounded flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {viewingHazard.location}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Badge className={getSeverityColor(viewingHazard.severity)}>
                      {viewingHazard.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge variant="outline">{viewingHazard.status}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="p-3 bg-muted rounded min-h-[80px]">
                    {viewingHazard.description}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reported By</Label>
                    <div className="p-2 bg-muted rounded flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {viewingHazard.reportedBy}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Report Date</Label>
                    <div className="p-2 bg-muted rounded flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {viewingHazard.date}
                    </div>
                  </div>
                </div>
                {viewingHazard.priority && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority Level</Label>
                      <Badge variant="outline">
                        Priority: {viewingHazard.priority}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label>Timeline</Label>
                      <div className="p-2 bg-muted rounded flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {viewingHazard.timeline}
                      </div>
                    </div>
                  </div>
                )}
                {viewingHazard.assignedTeam && (
                  <div className="space-y-2">
                    <Label>Assigned Team</Label>
                    <div className="p-2 bg-muted rounded flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {viewingHazard.assignedTeam}
                    </div>
                  </div>
                )}
                {viewingHazard.approvalRemarks && (
                  <div className="space-y-2">
                    <Label>Approval Remarks</Label>
                    <div className="p-3 bg-muted rounded">
                      {viewingHazard.approvalRemarks}
                    </div>
                  </div>
                )}
                {/* Approval Status */}
                <div className="space-y-2">
                  <Label>Approval Status</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-muted rounded text-center">
                      <div className="text-xs font-medium">Admin</div>
                      <Badge
                        variant={
                          viewingHazard.adminApproval === "approved"
                            ? "default"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {viewingHazard.adminApproval || "N/A"}
                      </Badge>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <div className="text-xs font-medium">Manager</div>
                      <Badge
                        variant={
                          viewingHazard.managerApproval === "approved"
                            ? "default"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {viewingHazard.managerApproval || "N/A"}
                      </Badge>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <div className="text-xs font-medium">Supervisor</div>
                      <Badge
                        variant={
                          viewingHazard.supervisorApproval === "approved"
                            ? "default"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {viewingHazard.supervisorApproval || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Send to Approval Dialog */}
        {user?.role === "admin" && (
          <Dialog
            open={isSendToApprovalDialogOpen}
            onOpenChange={setIsSendToApprovalDialogOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send to Management Approval
                </DialogTitle>
                <DialogDescription>
                  Send this hazard report to Manager and Supervisor for
                  approval.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will send the hazard report to Manager and Supervisor for
                  their review and approval. Once both approve, you can assign
                  the hazard to a team.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSendToApprovalDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendToApproval}>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Approval
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Approval Dialog */}
        {user?.role !== "employee" && (
          <Dialog
            open={isApprovalDialogOpen}
            onOpenChange={setIsApprovalDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {approvalAction === "approve" ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Approve Hazard Report
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5" />
                      Mark as Pending
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {approvalAction === "approve"
                    ? "Review and approve the hazard report with priority and assignment details"
                    : "Mark this hazard as pending for further review"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {approvalAction === "approve" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select
                          value={approvalData.priority}
                          onValueChange={(value) =>
                            setApprovalData({
                              ...approvalData,
                              priority: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <Input
                          id="timeline"
                          type="date"
                          value={approvalData.timeline}
                          onChange={(e) =>
                            setApprovalData({
                              ...approvalData,
                              timeline: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedTeam">Assign to Team</Label>
                      <Select
                        value={approvalData.assignedTeam}
                        onValueChange={(value) =>
                          setApprovalData({
                            ...approvalData,
                            assignedTeam: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Safety Team">
                            Safety Team
                          </SelectItem>
                          <SelectItem value="Electrical Team">
                            Electrical Team
                          </SelectItem>
                          <SelectItem value="Maintenance Team">
                            Maintenance Team
                          </SelectItem>
                          <SelectItem value="Operations Team">
                            Operations Team
                          </SelectItem>
                          <SelectItem value="Emergency Response">
                            Emergency Response
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="remarks">
                    {approvalAction === "approve"
                      ? "Approval Remarks"
                      : "Pending Remarks"}
                  </Label>
                  <Textarea
                    id="remarks"
                    value={approvalData.remarks}
                    onChange={(e) =>
                      setApprovalData({
                        ...approvalData,
                        remarks: e.target.value,
                      })
                    }
                    placeholder={
                      approvalAction === "approve"
                        ? "Add any remarks or instructions for the assigned team..."
                        : "Add remarks explaining why this is pending..."
                    }
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsApprovalDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => handleApproval(approvalAction)}>
                    {approvalAction === "approve" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Assign
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Mark as Pending
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Hazard Report</DialogTitle>
              <DialogDescription>Update the hazard details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Hazard Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Slip/Trip">Slip/Trip/Fall</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Chemical">Chemical</SelectItem>
                      <SelectItem value="Fire">Fire</SelectItem>
                      <SelectItem value="Machinery">Machinery</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Warehouse A"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Severity Level</Label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High", "Critical"].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={
                        formData.severity === level ? "default" : "outline"
                      }
                      className="flex-1"
                      onClick={() =>
                        setFormData({ ...formData, severity: level })
                      }
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the hazard in detail..."
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
                <Button onClick={handleEdit}>Update Hazard</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Employees Dialog */}
        {user?.role === "admin" && (
          <Dialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assign Employees to Hazard
                </DialogTitle>
                <DialogDescription>
                  Select employees to assign to this approved hazard.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Employees</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {dummyUsers.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`employee-${employee.id}`}
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees([
                                ...selectedEmployees,
                                employee.id,
                              ]);
                            } else {
                              setSelectedEmployees(
                                selectedEmployees.filter(
                                  (id) => id !== employee.id
                                )
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`employee-${employee.id}`}
                          className="text-sm"
                        >
                          {employee.name} - {employee.role}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAssignEmployees}>
                    <Users className="h-4 w-4 mr-2" />
                    Assign Employees
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Hazards;
