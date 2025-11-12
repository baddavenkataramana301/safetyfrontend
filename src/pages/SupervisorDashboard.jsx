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
  Bell,
} from "lucide-react";
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

const SupervisorDashboard = () => {
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

  const createTestHazard = () => {
    const newHazard = {
      id: Date.now(),
      type: "Test Hazard - Slippery Floor",
      location: "Warehouse Aisle 3",
      description: "Wet floor due to recent cleaning",
      severity: "Medium",
      status: "Pending",
      reportedBy: "Test Employee",
      reportedDate: new Date().toISOString(),
      adminApproval: "pending",
      managerApproval: "pending",
      supervisorApproval: "pending",
      assignedTo: "",
      priority: "Medium",
      category: "Slip Hazard",
      images: [],
      comments: [],
    };

    const updatedHazards = [...hazards, newHazard];
    setHazards(updatedHazards);
    localStorage.setItem("hazards", JSON.stringify(updatedHazards));
    toast.success("Test hazard created successfully!");
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

    const updatedHazards = hazards.map((hazard) => {
      if (hazard.id === currentHazardId) {
        const updatedHazard = {
          ...hazard,
          supervisorApproval: action === "approve" ? "approved" : "pending",
        };

        if (action === "approve") {
          updatedHazard.priority = approvalData.priority;
          updatedHazard.timeline = approvalData.timeline;
          updatedHazard.assignedTeam = approvalData.assignedTeam;
          updatedHazard.approvalRemarks = approvalData.remarks;
        }

        // Check if both manager and supervisor have approved
        if (
          updatedHazard.managerApproval === "approved" &&
          updatedHazard.supervisorApproval === "approved"
        ) {
          updatedHazard.status = "Approved";
        }

        return updatedHazard;
      }
      return hazard;
    });

    setHazards(updatedHazards);
    localStorage.setItem("hazards", JSON.stringify(updatedHazards));

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

  const pendingHazards = hazards.filter(
    (hazard) =>
      hazard.status === "Pending" && hazard.supervisorApproval === "pending"
  );
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const stats = [
    {
      label: "Team Hazards",
      value: hazards.filter((h) => h.status !== "Resolved").length.toString(),
      icon: AlertTriangle,
      color: "text-warning",
      action: () => navigate("/hazards"),
    },
    {
      label: "Completed Inspections",
      value: "28",
      icon: CheckCircle,
      color: "text-success",
      action: () => navigate("/checklists"),
    },
    {
      label: "Pending Reviews",
      value: pendingHazards.length.toString(),
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
          <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Oversee safety operations and approvals.
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
              <CardTitle>Supervision Tasks</CardTitle>
              <CardDescription>
                Monitor and manage team safety activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate("/checklists")}
                className="w-full justify-start"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Review Inspections
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
              <Button
                onClick={createTestHazard}
                variant="outline"
                className="w-full justify-start"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Create Test Hazard
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
                      hazard.supervisorApproval === "pending"
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
              <CardTitle>Safety Compliance</CardTitle>
              <CardDescription>
                Team compliance and safety metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inspection Completion</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hazard Response Time</span>
                  <span className="text-sm font-medium">1.8 hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Safety Training</span>
                  <span className="text-sm font-medium">92%</span>
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

export default SupervisorDashboard;
