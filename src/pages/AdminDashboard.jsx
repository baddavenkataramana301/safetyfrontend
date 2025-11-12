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
import { toast } from "sonner";
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
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hazards, setHazards] = useState([]);
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("dummyUsers");
    return stored ? JSON.parse(stored) : [];
  });
  const [groups, setGroups] = useState(() => {
    const stored = localStorage.getItem("groups");
    return stored ? JSON.parse(stored) : [];
  });
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState({
    dataType: "all", // all, users, groups, hazards
    fileFormat: "pdf", // pdf, excel, json
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

  // Analytics content merged into Admin Dashboard
  const kpis = [
    { label: "Total Hazards (YTD)", value: "90", change: "-12%" },
    { label: "Checklist Completion", value: "87.5%", change: "+5%" },
    { label: "Training Compliance", value: "94%", change: "+2%" },
    { label: "Open Incidents", value: "4", change: "-50%" },
  ];

  const incidentData = [
    { name: "Slip/Fall", value: 35 },
    { name: "Electrical", value: 20 },
    { name: "Chemical", value: 15 },
    { name: "Machinery", value: 30 },
  ];

  const checklistData = [
    { week: "Week 1", completed: 85 },
    { week: "Week 2", completed: 92 },
    { week: "Week 3", completed: 78 },
    { week: "Week 4", completed: 95 },
  ];

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  const performDownload = (options = downloadOptions) => {
    try {
      const { dataType, fileFormat } = options;

      // collect data
      const storedUsers = users || [];
      const storedGroups = groups || [];
      const storedHazards = hazards || [];

      let data;
      let filename = "report";

      if (dataType === "users") {
        data = storedUsers.map((u) => ({
          Name: u.name,
          Email: u.email,
          Role: u.role,
          Department: u.department,
          Status: u.status,
          Approved: u.approved ? "Yes" : "No",
        }));
        filename = "users";
      } else if (dataType === "groups") {
        data = storedGroups.map((g) => ({
          Name: g.name,
          Members: Array.isArray(g.members) ? g.members.length : 0,
          CreatedAt: g.createdAt || "",
        }));
        filename = "groups";
      } else if (dataType === "hazards") {
        data = storedHazards.map((h) => ({
          Title: h.title || h.name || "-",
          Status: h.status || "",
          CreatedAt: h.createdAt || "",
        }));
        filename = "hazards";
      } else {
        // all
        data = { users: storedUsers, groups: storedGroups, hazards: storedHazards };
        filename = "full-report";
      }

      // export based on format
      if (fileFormat === "json") {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (fileFormat === "excel") {
        // CSV
        if (!Array.isArray(data)) {
          // flatten object sections into rows with section header
          const sections = [];
          Object.entries(data).forEach(([section, arr]) => {
            if (Array.isArray(arr) && arr.length) {
              const headers = Object.keys(arr[0]);
              sections.push(headers.join(","));
              arr.forEach((row) => {
                sections.push(
                  headers
                    .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
                    .join(",")
                );
              });
              sections.push("");
            }
          });
          const csv = sections.join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const headers = Object.keys(data[0] || {});
          const csv = [
            headers.join(","),
            ...data.map((row) =>
              headers
                .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
                .join(",")
            ),
          ].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } else if (fileFormat === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Safety Report", 14, 20);
        let y = 30;
        const writeSection = (title, arr) => {
          doc.setFontSize(14);
          doc.text(title, 14, y);
          y += 8;
          if (!arr || arr.length === 0) {
            doc.setFontSize(11);
            doc.text("No records", 14, y);
            y += 8;
            return;
          }
          const headers = Object.keys(arr[0]);
          doc.setFontSize(11);
          doc.text(headers.join(" | "), 14, y);
          y += 6;
          arr.forEach((row) => {
            const line = headers.map((h) => String(row[h] ?? "")).join(" | ");
            const sliced = doc.splitTextToSize(line, 180);
            doc.text(sliced, 14, y);
            y += sliced.length * 6;
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
          });
          y += 6;
        };

        if (dataType === "all") {
          writeSection("Users", data.users.map((u) => ({ Name: u.name, Email: u.email, Role: u.role, Department: u.department, Approved: u.approved ? 'Yes' : 'No' })));
          if (y > 250) { doc.addPage(); y = 20; }
          writeSection("Groups", data.groups.map((g) => ({ Name: g.name, Members: Array.isArray(g.members) ? g.members.length : 0, CreatedAt: g.createdAt || '' })));
          if (y > 250) { doc.addPage(); y = 20; }
          writeSection("Hazards", data.hazards.map((h) => ({ Title: h.title || h.name || '-', Status: h.status || '', CreatedAt: h.createdAt || '' })));
        } else if (Array.isArray(data)) {
          writeSection(filename.charAt(0).toUpperCase() + filename.slice(1), data);
        }

        doc.save(`${filename}.pdf`);
      }

      setIsDownloadDialogOpen(false);
      toast.success(`Downloaded ${filename} as ${fileFormat.toUpperCase()}`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download. See console for details.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Welcome back, {user?.name}! Full system overview and management
              controls.
            </p>
          </div>
          <div className="flex items-start ml-4">
            <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDownloadDialogOpen(true)} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Download Report</DialogTitle>
                  <DialogDescription>
                    Choose data and file format for the export
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">What to include?</p>
                    <Select value={downloadOptions.dataType} onValueChange={(value) => setDownloadOptions({...downloadOptions, dataType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Data</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="groups">Groups</SelectItem>
                        <SelectItem value="hazards">Hazards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm mb-2">File format</p>
                    <Select value={downloadOptions.fileFormat} onValueChange={(value) => setDownloadOptions({...downloadOptions, fileFormat: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel (CSV)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => performDownload(downloadOptions)}>Download</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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

        {/* KPIs (merged from Analytics) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                  {kpi.change} from last month
                </p>
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
            {/* Download moved to top-right */}
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
                /* Download moved to top-right */
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>
        </div>

        {/* Additional Reports Section (incident distribution & checklist completion) */}
        <div id="reports" className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Incident Distribution</CardTitle>
              <CardDescription>Breakdown by incident type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incidentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Checklist Completion Rate</CardTitle>
              <CardDescription>Weekly completion percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={checklistData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
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
                /* Download moved to top-right */
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
                  onClick={() => { window.location.hash = '#reports'; }}
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
                    /* Download moved to top-right */
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