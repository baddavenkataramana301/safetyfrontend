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
  Users,
  BarChart3,
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  User,
  Download,
  Bell,
} from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProfileEditDialog from "@/components/ProfileEditDialog";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hazards, setHazards] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(""); // "approve" or "reject"
  const [currentHazardId, setCurrentHazardId] = useState(null);
  const [approvalData, setApprovalData] = useState({
    priority: "Medium",
    timeline: "",
    assignedTeam: "",
    remarks: "",
  });

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

    // Listen for storage changes to update notifications in real-time
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
        hazard.id === currentHazardId
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

    // Check if both manager and supervisor have approved
    const updatedHazard = hazards.find((h) => h.id === currentHazardId);
    if (updatedHazard) {
      const allApproved =
        updatedHazard.managerApproval === "approved" &&
        updatedHazard.supervisorApproval === "approved";

      if (allApproved) {
        setHazards((prev) =>
          prev.map((h) =>
            h.id === currentHazardId ? { ...h, status: "Approved" } : h
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
          message: `Hazard ${updatedHazard.type} in ${updatedHazard.location} has been approved by Manager and Supervisor.`,
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

    toast.success(
      action === "approve"
        ? "Hazard approved successfully!"
        : "Hazard marked as pending!"
    );
  };

  const teamHazards = hazards.filter((h) => h.status !== "Resolved").length;
  const pendingReviews = hazards.filter(
    (hazard) =>
      hazard.status === "Pending" &&
      ((user?.role === "safety_manager" &&
        hazard.managerApproval === "pending") ||
        (user?.role === "supervisor" &&
          hazard.supervisorApproval === "pending"))
  ).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleDownload = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Manager Analytics Report", 20, 30);

    // KPIs
    doc.setFontSize(16);
    doc.text("Key Performance Indicators:", 20, 50);
    let yPos = 60;
    const kpis = [
      { label: "Team Hazards", value: teamHazards.toString() },
      { label: "Completed Checklists", value: "32" },
      { label: "Pending Reviews", value: pendingReviews.toString() },
      { label: "Team Members", value: "12" },
    ];
    kpis.forEach((kpi) => {
      doc.setFontSize(12);
      doc.text(`${kpi.label}: ${kpi.value}`, 20, yPos);
      yPos += 10;
    });

    // Hazards Data (placeholder)
    yPos += 10;
    doc.setFontSize(16);
    doc.text("Recent Hazards:", 20, yPos);
    yPos += 10;
    hazards.slice(0, 5).forEach((hazard) => {
      doc.setFontSize(12);
      doc.text(`${hazard.type} - ${hazard.location}`, 20, yPos);
      yPos += 10;
    });

    // Save the PDF
    doc.save("manager-analytics-report.pdf");
  };

  const stats = [
    {
      label: "Team Hazards",
      value: teamHazards.toString(),
      icon: AlertTriangle,
      color: "text-warning",
      action: () => navigate("/hazards"),
    },
    {
      label: "Completed Checklists",
      value: "32", // This could be dynamic if checklists are stored
      icon: CheckCircle,
      color: "text-success",
      action: () => navigate("/checklists"),
    },
    {
      label: "Pending Reviews",
      value: pendingReviews.toString(),
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your team's safety operations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={
                stat.action
                  ? "cursor-pointer hover:shadow-md transition-shadow"
                  : ""
              }
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
                {stat.action && (
                  <p className="text-xs text-muted-foreground">Click to view</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Monitor and manage your team activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate("/checklists")}
                className="w-full justify-start"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Review Checklists
              </Button>
              <Button
                onClick={() => navigate("/hazards")}
                variant="outline"
                className="w-full justify-start"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Manage Hazards
              </Button>
              <Button
                onClick={() => navigate("/analytics")}
                variant="outline"
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Hazard Approvals</CardTitle>
              <CardDescription>Hazards awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Load hazards from localStorage */}
                {(() => {
                  const storedHazards = localStorage.getItem("hazards");
                  const hazards = storedHazards
                    ? JSON.parse(storedHazards)
                    : [];
                  const pendingHazards = hazards.filter(
                    (hazard) =>
                      hazard.status === "Pending" &&
                      ((user?.role === "safety_manager" &&
                        hazard.managerApproval === "pending") ||
                        (user?.role === "supervisor" &&
                          hazard.supervisorApproval === "pending"))
                  );

                  if (pendingHazards.length === 0) {
                    return (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                        <p>No pending approvals</p>
                      </div>
                    );
                  }

                  return pendingHazards.slice(0, 3).map((hazard) => (
                    <div
                      key={hazard.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div className="flex-1">
                        <p className="font-medium">{hazard.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {hazard.location} - Reported by {hazard.reportedBy}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-success hover:text-success"
                          onClick={() => {
                            setCurrentHazardId(hazard.id);
                            setApprovalAction("approve");
                            setApprovalData({
                              priority: hazard.priority || "Medium",
                              timeline: hazard.timeline || "",
                              assignedTeam: hazard.assignedTeam || "",
                              remarks: hazard.approvalRemarks || "",
                            });
                            setIsApprovalDialogOpen(true);
                          }}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-warning hover:text-warning"
                          onClick={() => {
                            setCurrentHazardId(hazard.id);
                            setApprovalAction("reject");
                            setApprovalData({
                              priority: hazard.priority || "Medium",
                              timeline: hazard.timeline || "",
                              assignedTeam: hazard.assignedTeam || "",
                              remarks: hazard.approvalRemarks || "",
                            });
                            setIsApprovalDialogOpen(true);
                          }}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Pending
                        </Button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>
                Team compliance and safety metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Checklist Completion</span>
                  <span className="text-sm font-medium">88%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hazard Response Time</span>
                  <span className="text-sm font-medium">2.3 hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Training Compliance</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
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

        {/* Analytics Section */}
        <Card className="relative">
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              Quick insights into safety metrics and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {teamHazards}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active Hazards
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">87.5%</div>
                  <p className="text-sm text-muted-foreground">
                    Checklist Completion
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {pendingReviews}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pending Reviews
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="absolute bottom-4 right-4"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
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
                        <SelectItem value="Safety Team">Safety Team</SelectItem>
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
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
