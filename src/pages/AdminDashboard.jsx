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
  Settings,
  TrendingUp,
  Activity,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hazards, setHazards] = useState([]);
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("dummyUsers");
    return stored ? JSON.parse(stored) : [];
  });

  // Load hazards from localStorage
  useEffect(() => {
    const storedHazards = localStorage.getItem("hazards");
    if (storedHazards) {
      setHazards(JSON.parse(storedHazards));
    }
  }, []);

  // Listen for users updates
  useEffect(() => {
    const handleUsersUpdated = () => {
      const storedUsers = localStorage.getItem("dummyUsers");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    };

    window.addEventListener("usersUpdated", handleUsersUpdated);

    // Initial load
    handleUsersUpdated();

    return () => {
      window.removeEventListener("usersUpdated", handleUsersUpdated);
    };
  }, []);

  const activeHazards = hazards.filter((h) => h.status !== "Resolved").length;
  const openHazards = hazards.filter((h) => h.status === "Open").length;
  const pendingHazards = hazards.filter((h) => h.status === "Pending").length;
  const approvedHazards = hazards.filter((h) => h.status === "Approved").length;

  const stats = [
    {
      label: "Total Users",
      value: users.length.toString(),
      icon: Users,
      color: "text-primary",
      action: () => navigate("/users"),
    },
    {
      label: "Active Hazards",
      value: activeHazards.toString(),
      icon: AlertTriangle,
      color: "text-warning",
      action: () => navigate("/hazards"),
    },
    {
      label: "Completed Checklists",
      value: "48", // This could be dynamic if checklists are stored
      icon: CheckCircle,
      color: "text-success",
      action: () => navigate("/checklists"),
    },
    {
      label: "System Alerts",
      value: "3", // This could be dynamic if alerts are stored
      icon: Clock,
      color: "text-destructive",
      action: () => navigate("/notifications"),
    },
  ];

  // Sample data for charts
  const hazardData = [
    { month: "Jan", hazards: 12, resolved: 10 },
    { month: "Feb", hazards: 19, resolved: 15 },
    { month: "Mar", hazards: 8, resolved: 7 },
    { month: "Apr", hazards: 15, resolved: 12 },
    { month: "May", hazards: 22, resolved: 18 },
    { month: "Jun", hazards: 9, resolved: 8 },
  ];

  const trainingData = [
    { name: "Safety", value: 35, color: "#8884d8" },
    { name: "Technical", value: 25, color: "#82ca9d" },
    { name: "Compliance", value: 20, color: "#ffc658" },
    { name: "General", value: 20, color: "#ff7c7c" },
  ];

  const complianceData = [
    { month: "Jan", compliance: 85 },
    { month: "Feb", compliance: 88 },
    { month: "Mar", compliance: 92 },
    { month: "Apr", compliance: 89 },
    { month: "May", compliance: 94 },
    { month: "Jun", compliance: 96 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center md:text-left relative">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back, {user?.name}! Full system overview and management
            controls.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="cursor-pointer hover:shadow-md transition-shadow h-full w-full"
              onClick={stat.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">Click to manage</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="h-full w-full relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <TrendingUp className="h-5 w-5" />
                Hazard Trends
              </CardTitle>
              <CardDescription>
                Monthly hazard reports and resolution rates
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hazardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="hazards" fill="#ef4444" name="Reported" />
                  <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => {
                toast.success("Hazard Trends report download coming soon!");
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>

          <Card className="h-full w-full relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Training Distribution
              </CardTitle>
              <CardDescription>Training programs by category</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={trainingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trainingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => {
                toast.success(
                  "Training Distribution report download coming soon!"
                );
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="h-full relative">
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>Monthly compliance percentage</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis domain={[80, 100]} fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => {
                toast.success("Compliance Trends report download coming soon!");
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>

          <Card className="h-full relative">
            <CardHeader>
              <CardTitle>System Management</CardTitle>
              <CardDescription>
                Quick access to administrative functions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:overflow-x-auto sm:gap-2">
                <Button
                  onClick={() => navigate("/users")}
                  className="w-full justify-start flex-shrink-0 sm:w-auto"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  className="w-full justify-start flex-shrink-0 sm:w-auto"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button
                  onClick={() => navigate("/analytics")}
                  variant="outline"
                  className="w-full justify-start flex-shrink-0 sm:w-auto"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </div>
            </CardContent>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => {
                toast.success("System Management report download coming soon!");
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>

          <Card className="h-full relative">
            <CardHeader>
              <CardTitle>Hazard Management Overview</CardTitle>
              <CardDescription>
                Current hazard status and pending actions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4 h-full">
                {/* Load hazards from localStorage */}
                {(() => {
                  const storedHazards = localStorage.getItem("hazards");
                  const hazards = storedHazards
                    ? JSON.parse(storedHazards)
                    : [];

                  const openHazards = hazards.filter(
                    (h) => h.status === "Open"
                  );
                  const pendingHazards = hazards.filter(
                    (h) => h.status === "Pending"
                  );
                  const approvedHazards = hazards.filter(
                    (h) => h.status === "Approved"
                  );

                  return (
                    <>
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-destructive/10 sm:flex-row sm:items-center sm:gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">Open Hazards</p>
                          <p className="text-xs text-muted-foreground">
                            {openHazards.length} hazards waiting to be sent for
                            approval
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate("/hazards")}
                          className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0"
                        >
                          Review
                        </Button>
                      </div>

                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-warning/10 sm:flex-row sm:items-center sm:gap-3">
                        <Clock className="h-5 w-5 text-warning flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            Pending Approvals
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pendingHazards.length} hazards awaiting
                            manager/supervisor approval
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate("/hazards")}
                          className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0"
                        >
                          Review
                        </Button>
                      </div>

                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-success/10 sm:flex-row sm:items-center sm:gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            Approved Hazards
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {approvedHazards.length} hazards ready for
                            assignment
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate("/hazards")}
                          className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0"
                        >
                          Assign
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => {
                toast.success(
                  "Hazard Management Overview report download coming soon!"
                );
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
