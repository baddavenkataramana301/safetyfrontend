import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Trophy,
  Award,
  TrendingUp,
  Users,
  Building2,
  Shield,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  getUserPoints,
  addPoints,
  getDailyPoints,
  getMonthlyHistory,
  addLoginPoints,
  initializeAllDummyPoints,
  getPointSystem,
  savePointRules,
} from "@/lib/pointUtils";
import { toast } from "sonner";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const TYPE_COLORS = {
  earning: "#22c55e",
  deduction: "#ef4444",
};


// Point system loaded dynamically now
const POINT_SYSTEM = getPointSystem();

// Generate dummy point history data
const generatePointHistory = (role, userId, userName) => {
  const activities = POINT_SYSTEM[role]?.earnings || [];
  const deductions = POINT_SYSTEM[role]?.deductions || [];
  const allActivities = [...activities, ...deductions];

  // If no activities defined for this role (e.g., admin), return empty history
  if (allActivities.length === 0) {
    const history = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Generate last 3 months of empty data
    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const month = currentMonth - monthOffset;
      const year = month < 0 ? currentYear - 1 : currentYear;

      history.push({
        month: month + 1,
        year,
        monthName: new Date(year, month, 1).toLocaleString("default", {
          month: "long",
        }),
        total: 0,
        activities: [],
      });
    }

    return history;
  }

  const history = [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Generate last 3 months of data
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const month = currentMonth - monthOffset;
    const year = month < 0 ? currentYear - 1 : currentYear;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let monthlyTotal = 0;
    const monthActivities = [];

    // Generate random activities for the month
    const numActivities = Math.floor(Math.random() * 15) + 10;
    for (let i = 0; i < numActivities; i++) {
      // Ensure we have activities to choose from
      if (allActivities.length === 0) break;

      const randomIndex = Math.floor(Math.random() * allActivities.length);
      const activity = allActivities[randomIndex];

      // Safety check: ensure activity exists
      if (!activity) break;

      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const date = new Date(year, month, day);

      monthActivities.push({
        id: `${userId}-${year}-${month}-${i}`,
        date: date.toISOString().split("T")[0],
        activity: activity.activity || activity.rule || "Unknown activity",
        points: activity.points || 0,
        type: activity.points > 0 ? "earning" : "deduction",
      });

      monthlyTotal += activity.points || 0;
    }

    // Sort by date
    monthActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    history.push({
      month: month + 1,
      year,
      monthName: new Date(year, month, 1).toLocaleString("default", {
        month: "long",
      }),
      total: monthlyTotal,
      activities: monthActivities,
    });
  }

  return history;
};

// Generate rankings data
const generateRankings = (role) => {
  const users = JSON.parse(localStorage.getItem("dummyUsers") || "[]");
  const roleUsers = users.filter((u) => {
    const normalizedRole = u.role.toLowerCase().replace(/\s+/g, "_");
    // Map role names
    let mappedRole = normalizedRole;
    if (normalizedRole === "safety_manager" || normalizedRole === "manager") {
      mappedRole = "safety_manager";
    }
    return mappedRole === role;
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const rankings = roleUsers.map((user) => {
    // Get real point data from localStorage
    const userPoints = getUserPoints(user.id);
    const currentMonthActivities = userPoints.history.filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getMonth() + 1 === currentMonth &&
        activityDate.getFullYear() === currentYear
      );
    });
    const currentMonthPoints = currentMonthActivities.reduce(
      (sum, a) => sum + a.points,
      0
    );

    return {
      id: user.id,
      name: user.name,
      department: user.department,
      totalPoints: userPoints.total,
      currentMonthPoints,
      rank: 0, // Will be set after sorting
    };
  });

  // Sort by current month points and assign ranks
  rankings.sort((a, b) => b.currentMonthPoints - a.currentMonthPoints);
  rankings.forEach((user, index) => {
    user.rank = index + 1;
  });

  return rankings;
};

// Helper function to normalize role
const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = role.toLowerCase().replace(/\s+/g, "_");
  // Map common role variations
  if (normalized === "safety_manager" || normalized === "manager") {
    return "safety_manager";
  }
  return normalized;
};

// Month History Card Component with Graphs
const MonthHistoryCard = ({
  month,
  year,
  monthName,
  activities,
  total,
  userId,
  userRole,
  isAdmin,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    activity: "",
    points: 0,
    type: "earning",
  });

  // Get daily points data for the month
  const dailyPoints = getDailyPoints(userId, month, year);

  // Prepare daily pie chart data - group by activity type
  const dailyChartData = activities.reduce((acc, activity) => {
    const key = activity.activity;
    if (!acc[key]) {
      acc[key] = { name: key, value: 0, type: activity.type };
    }
    acc[key].value += Math.abs(activity.points);
    return acc;
  }, {});

  const dailyPieData = Object.values(dailyChartData).map((item) => ({
    name:
      item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
    value: item.value,
    type: item.type,
  }));

  // Monthly pie chart data - earnings vs deductions
  const earningsTotal = activities
    .filter((a) => a.type === "earning")
    .reduce((sum, a) => sum + a.points, 0);
  const deductionsTotal = Math.abs(
    activities
      .filter((a) => a.type === "deduction")
      .reduce((sum, a) => sum + a.points, 0)
  );

  const monthlyPieData = [
    { name: "Earnings", value: earningsTotal, type: "earning" },
    { name: "Deductions", value: deductionsTotal, type: "deduction" },
  ].filter((item) => item.value > 0);

  // Colors for pie charts
  const COLORS = {
    earning: "#22c55e", // green
    deduction: "#ef4444", // red
  };

  const getColorByType = (type) => TYPE_COLORS[type] || "#8884d8";

  const handleDeleteActivity = (activityId) => {
    if (!isAdmin) return;

    const userPoints = getUserPoints(userId);
    userPoints.history = userPoints.history.filter((h) => h.id !== activityId);
    userPoints.total = userPoints.history.reduce((sum, h) => sum + h.points, 0);
    localStorage.setItem(`userPoints_${userId}`, JSON.stringify(userPoints));
    toast.success("Activity deleted");
    onUpdate?.();
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setFormData({
      activity: activity.activity,
      points: activity.points,
      type: activity.type,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveActivity = () => {
    if (!formData.activity || !formData.points) {
      toast.error("Please fill in all fields");
      return;
    }

    const userPoints = getUserPoints(userId);

    if (editingActivity) {
      // Update existing
      const index = userPoints.history.findIndex(
        (h) => h.id === editingActivity.id
      );
      if (index !== -1) {
        const oldPoints = userPoints.history[index].points;
        userPoints.history[index] = {
          ...userPoints.history[index],
          activity: formData.activity,
          points: formData.points,
          type: formData.type,
        };
        userPoints.total = userPoints.total - oldPoints + formData.points;
      }
    } else {
      // Add new
      const newActivity = {
        id: `${userId}-${Date.now()}-${Math.random()}`,
        date: new Date(year, month - 1, 1).toISOString().split("T")[0],
        activity: formData.activity,
        points: formData.points,
        type: formData.type,
        role: userRole,
        timestamp: new Date().toISOString(),
      };
      userPoints.history.push(newActivity);
      userPoints.total += formData.points;
    }

    localStorage.setItem(`userPoints_${userId}`, JSON.stringify(userPoints));
    toast.success(editingActivity ? "Activity updated" : "Activity added");
    setIsEditDialogOpen(false);
    setEditingActivity(null);
    setFormData({ activity: "", points: 0, type: "earning" });
    onUpdate?.();
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = month === currentMonth && year === currentYear;

  return (
    <div className="border rounded-lg p-4 space-y-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            {monthName} {year}
          </h3>
          <p className="text-sm text-muted-foreground">
            {activities.length} activities • Total: {total > 0 ? "+" : ""}
            {total} points
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingActivity(null);
                    setFormData({ activity: "", points: 0, type: "earning" });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Points
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingActivity ? "Edit Activity" : "Add Points"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingActivity
                      ? "Update point activity details"
                      : "Add a new point activity"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Activity</Label>
                    <Input
                      value={formData.activity}
                      onChange={(e) =>
                        setFormData({ ...formData, activity: e.target.value })
                      }
                      placeholder="Enter activity name"
                    />
                  </div>
                  <div>
                    <Label>Points</Label>
                    <Input
                      type="number"
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter points"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="earning">Earning</SelectItem>
                        <SelectItem value="deduction">Deduction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveActivity}>
                      {editingActivity ? "Update" : "Add"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Show current month or expanded month */}
      {(isCurrentMonth || isExpanded) && (
        <div className="space-y-4">
          {/* Daily Points Pie Chart - Activity Distribution */}
          {dailyPieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Activity Distribution</CardTitle>
                <CardDescription>
                  Points breakdown by activity type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dailyPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dailyPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getColorByType(entry.type)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} points`,
                        props.payload.name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Monthly Summary Pie Chart - Earnings vs Deductions */}
          {monthlyPieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Summary</CardTitle>
                <CardDescription>
                  Earnings vs Deductions breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={monthlyPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) =>
                        `${name}: ${value} pts (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {monthlyPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getColorByType(entry.type)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} points`,
                        props.payload.name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Activities List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between text-sm py-2 px-3 border rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1">
                  {activity.type === "earning" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="flex-1">{activity.activity}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={activity.points > 0 ? "default" : "destructive"}
                  >
                    {activity.points > 0 ? "+" : ""}
                    {activity.points}
                  </Badge>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditActivity(activity)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Monthly Rewards Section Component
const MonthlyRewardsSection = ({ pointHistory, user, userRole, isAdmin }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    activity: "",
    points: 0,
    type: "earning",
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Force re-render when refreshKey changes
  useEffect(() => {
    // This will trigger re-render
  }, [refreshKey]);

  // Group activities by month
  const monthlyData = pointHistory.map((month) => {
    const currentUserPoints = getUserPoints(user?.id);
    const monthActivities = currentUserPoints.history.filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getMonth() + 1 === month.month &&
        activityDate.getFullYear() === month.year
      );
    });

    return {
      ...month,
      activities: monthActivities,
      total: monthActivities.reduce((sum, a) => sum + a.points, 0),
    };
  });

  // Get current month data
  const currentMonthData = monthlyData.find(
    (m) => m.month === currentMonth && m.year === currentYear
  );

  // Get all months data (for yearly chart when expanded)
  const allMonthsData = monthlyData.filter(
    (m) => !(m.month === currentMonth && m.year === currentYear)
  );

  // Prepare yearly pie chart data (when expanded)
  const yearlyPieData = monthlyData.map((month) => ({
    name: month.monthName.substring(0, 3), // Short month name
    value: month.total,
    fullName: `${month.monthName} ${month.year}`,
  }));

  // Prepare current month pie chart data
  const currentMonthPieData = currentMonthData
    ? currentMonthData.activities.reduce((acc, activity) => {
        const key = activity.activity;
        if (!acc[key]) {
          acc[key] = { name: key, value: 0, type: activity.type };
        }
        acc[key].value += Math.abs(activity.points);
        return acc;
      }, {})
    : {};

  const currentMonthChartData = Object.values(currentMonthPieData).map(
    (item) => ({
      name:
        item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
      value: item.value,
      type: item.type,
    })
  );

  const COLORS = {
    earning: "#22c55e",
    deduction: "#ef4444",
  };

  const getColorByType = (type) => TYPE_COLORS[type] || "#8884d8";

  const handleUpdate = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleSaveActivity = () => {
    if (!formData.activity || !formData.points) {
      toast.error("Please fill in all fields");
      return;
    }

    const userPoints = getUserPoints(user?.id);
    const newActivity = {
      id: `${user?.id}-${Date.now()}-${Math.random()}`,
      date: new Date().toISOString().split("T")[0],
      activity: formData.activity,
      points: formData.points,
      type: formData.type,
      role: userRole,
      timestamp: new Date().toISOString(),
    };
    userPoints.history.push(newActivity);
    userPoints.total += formData.points;
    localStorage.setItem(`userPoints_${user?.id}`, JSON.stringify(userPoints));
    toast.success("Activity added");
    setIsEditDialogOpen(false);
    setFormData({ activity: "", points: 0, type: "earning" });
    handleUpdate();
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Rewards</CardTitle>
            <CardDescription>
              View your monthly point records and breakdown
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingActivity(null);
                      setFormData({ activity: "", points: 0, type: "earning" });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Points
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Points</DialogTitle>
                    <DialogDescription>
                      Add a new point activity
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Activity</Label>
                      <Input
                        value={formData.activity}
                        onChange={(e) =>
                          setFormData({ ...formData, activity: e.target.value })
                        }
                        placeholder="Enter activity name"
                      />
                    </div>
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={formData.points}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            points: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Enter points"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="earning">Earning</SelectItem>
                          <SelectItem value="deduction">Deduction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveActivity}>Add</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        {/* Dropdown arrow in bottom-right corner */}
        {monthlyData.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-2 right-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
        {/* Current Month Records */}
        {currentMonthData && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {currentMonthData.monthName} {currentYear} - Monthly Records
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {currentMonthData.activities.length > 0 ? (
                  currentMonthData.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between text-sm py-2 px-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {activity.type === "earning" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="flex-1">{activity.activity}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            activity.points > 0 ? "default" : "destructive"
                          }
                        >
                          {activity.points > 0 ? "+" : ""}
                          {activity.points}
                        </Badge>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const userPoints = getUserPoints(user?.id);
                                userPoints.history = userPoints.history.filter(
                                  (h) => h.id !== activity.id
                                );
                                userPoints.total = userPoints.history.reduce(
                                  (sum, h) => sum + h.points,
                                  0
                                );
                                localStorage.setItem(
                                  `userPoints_${user?.id}`,
                                  JSON.stringify(userPoints)
                                );
                                toast.success("Activity deleted");
                                handleUpdate();
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activities this month
                  </p>
                )}
              </div>
            </div>

            {/* Current Month Pie Chart */}
            {currentMonthChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {currentMonthData.monthName} {currentYear} - Activity
                    Distribution
                  </CardTitle>
                  <CardDescription>
                    Points breakdown by activity type for this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={currentMonthChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {currentMonthChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getColorByType(entry.type)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} points`,
                          props.payload.name,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Expanded: Other Months + Yearly Chart */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Previous Months</h3>
            <div className="space-y-4">
              {allMonthsData.map((month) => (
                <div
                  key={`${month.year}-${month.month}`}
                  className="border rounded-lg p-4"
                >
                  <h4 className="font-semibold mb-2">
                    {month.monthName} {month.year}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {month.activities.length} activities • Total:{" "}
                    {month.total > 0 ? "+" : ""}
                    {month.total} points
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {month.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {activity.type === "earning" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>{activity.activity}</span>
                        </div>
                        <Badge
                          variant={
                            activity.points > 0 ? "default" : "destructive"
                          }
                        >
                          {activity.points > 0 ? "+" : ""}
                          {activity.points}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Yearly Pie Chart */}
            {yearlyPieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Yearly Overview</CardTitle>
                  <CardDescription>
                    Points distribution across all months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={yearlyPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) =>
                          `${name}: ${value} pts (${(percent * 100).toFixed(
                            0
                          )}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {yearlyPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.value >= 0
                                ? COLORS.earning
                                : COLORS.deduction
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} points`,
                          props.payload.fullName,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Daily Rewards Section Component
const DailyRewardsSection = ({ pointHistory, user, userRole, isAdmin }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Trigger re-render
  }, [refreshKey]);

  // Get daily points for current month
  const dailyPoints = getDailyPoints(user?.id, currentMonth, currentYear);

  // Prepare daily pie chart data
  const dailyPieData = dailyPoints.map((day) => ({
    name: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: day.points,
    date: day.date,
  }));

  const COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  const handleUpdate = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Rewards</CardTitle>
        <CardDescription>
          View your daily point records and breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Records */}
        <div>
          <h3 className="font-semibold text-lg mb-2">
            {new Date(currentYear, currentMonth - 1, 1).toLocaleString(
              "default",
              { month: "long" }
            )}{" "}
            {currentYear} - Daily Records
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
            {dailyPoints.length > 0 ? (
              dailyPoints.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between text-sm py-2 px-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({day.activities.length} activities)
                    </span>
                  </div>
                  <Badge variant={day.points >= 0 ? "default" : "destructive"}>
                    {day.points > 0 ? "+" : ""}
                    {day.points} points
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No daily records for this month
              </p>
            )}
          </div>
        </div>

        {/* Daily Pie Chart */}
        {dailyPieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Daily Points Distribution
              </CardTitle>
              <CardDescription>
                Points breakdown by day for current month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dailyPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) =>
                      `${name}: ${value} pts (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dailyPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} points`,
                      props.payload.date,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

// Point History Section Component
const PointHistorySection = ({ pointHistory, user, userRole, isAdmin }) => {
  return (
    <Tabs defaultValue="monthly" className="space-y-4">
      <TabsList>
        <TabsTrigger value="monthly">Monthly Rewards</TabsTrigger>
        <TabsTrigger value="daily">Daily Rewards</TabsTrigger>
      </TabsList>

      <TabsContent value="monthly" className="space-y-4">
        <MonthlyRewardsSection
          pointHistory={pointHistory}
          user={user}
          userRole={userRole}
          isAdmin={isAdmin}
        />
      </TabsContent>

      <TabsContent value="daily" className="space-y-4">
        <DailyRewardsSection
          pointHistory={pointHistory}
          user={user}
          userRole={userRole}
          isAdmin={isAdmin}
        />
      </TabsContent>
    </Tabs>
  );
};

const Rewards = () => {
  const { user } = useAuth();
  const [pointHistory, setPointHistory] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rules, setRules] = useState(getPointSystem());
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editedRules, setEditedRules] = useState(rules);

  useEffect(() => {
     // Listen for rule updates from other tabs/windows
     const handleRulesUpdate = () => {
        setRules(getPointSystem());
        setEditedRules(getPointSystem());
     };
     window.addEventListener("pointRulesUpdated", handleRulesUpdate);
     return () => window.removeEventListener("pointRulesUpdated", handleRulesUpdate);
  }, []);

  const handleSaveRules = () => {
    savePointRules(editedRules);
    setIsEditingRules(false);
    toast.success("Point rules updated successfully");
  };

  const handleRuleChange = (role, type, index, field, value) => {
    const newRules = { ...editedRules };
    newRules[role][type][index][field] = field === 'points' ? parseInt(value) || 0 : value;
    setEditedRules(newRules);
  };

  const handleAddRule = (role, type) => {
    const newRules = { ...editedRules };
    const newRule = type === "earnings" 
      ? { activity: "", points: 0 } 
      : { rule: "", points: 0 };
    newRules[role][type].push(newRule);
    setEditedRules(newRules);
  };

  const handleRemoveRule = (role, type, index) => {
    const newRules = { ...editedRules };
    newRules[role][type].splice(index, 1);
    setEditedRules(newRules);
  };


  useEffect(() => {
    if (!user) return;

    // Initialize dummy points for all users (only once)
    initializeAllDummyPoints();

    const userRole = normalizeRole(user.role);

    // Add login points automatically (only once per day)
    // Only employees get login points
    if (userRole === "employee") {
      addLoginPoints(user.id, userRole);
    }

    // Generate point history for current user (only if role exists in POINT_SYSTEM)
    if (userRole && POINT_SYSTEM[userRole]) {
      const history = generatePointHistory(userRole, user.id, user.name);
      setPointHistory(history);

      // Generate rankings for the role
      const roleRankings = generateRankings(userRole);
      setRankings(roleRankings);
    } else {
      // For admin or unknown roles, set empty data
      setPointHistory([]);
      setRankings([]);
    }
  }, [user]);

  const getCurrentMonthData = () => {
    return (
      pointHistory.find(
        (h) => h.month === selectedMonth && h.year === selectedYear
      ) || { activities: [], total: 0, monthName: "" }
    );
  };

  const getTotalPoints = () => {
    // Get real total from localStorage
    const userPoints = getUserPoints(user?.id);
    return userPoints.total || 0;
  };

  const getCurrentMonthPoints = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    // Get real data from localStorage
    const userPoints = getUserPoints(user?.id);
    const currentMonthActivities = userPoints.history.filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getMonth() + 1 === currentMonth &&
        activityDate.getFullYear() === currentYear
      );
    });
    return currentMonthActivities.reduce((sum, a) => sum + a.points, 0);
  };

  const getUserRank = () => {
    const userRanking = rankings.find((r) => r.id === user?.id);
    return userRanking?.rank || 0;
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      employee: "Employee",
      supervisor: "Supervisor",
      safety_manager: "Manager",
      admin: "Admin",
    };
    return roleMap[role] || role;
  };

  // Employee View: Own points
  const normalizedUserRole = normalizeRole(user?.role);
  if (normalizedUserRole === "employee") {
    const currentMonthData = getCurrentMonthData();
    const totalPoints = getTotalPoints();
    const currentMonthPoints = getCurrentMonthPoints();
    const userRank = getUserRank();

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Rewards</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track your safety points and achievements
            </p>
          </div>

          {/* Points Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Points
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <p className="text-xs text-muted-foreground">
                  All time accumulated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMonthPoints}</div>
                <p className="text-xs text-muted-foreground">
                  Points earned this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Rank</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  #{userRank || rankings.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Among {rankings.length} employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Activities
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMonthData.activities?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="history" className="space-y-4">
            <TabsList>
              <TabsTrigger value="history">Point History</TabsTrigger>
              <TabsTrigger value="activities">How to Earn Points</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <PointHistorySection
                pointHistory={pointHistory}
                user={user}
                userRole={normalizedUserRole}
                isAdmin={normalizedUserRole === "admin"}
              />
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                  <CardDescription>
                    Activities that earn you points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {POINT_SYSTEM.employee.earnings.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.activity}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default">+{item.points}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Point Deductions</CardTitle>
                  <CardDescription>
                    Actions that result in point loss
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {POINT_SYSTEM.employee.deductions.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.rule}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="destructive">{item.points}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rankings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Rankings</CardTitle>
                  <CardDescription>
                    Current month rankings among employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((ranking) => (
                        <TableRow
                          key={ranking.id}
                          className={ranking.id === user?.id ? "bg-muted" : ""}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {ranking.rank === 1 && (
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              )}
                              {ranking.rank === 2 && (
                                <Award className="h-4 w-4 text-gray-400" />
                              )}
                              {ranking.rank === 3 && (
                                <Award className="h-4 w-4 text-orange-400" />
                              )}
                              <span className="font-semibold">
                                #{ranking.rank}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {ranking.name}
                            {ranking.id === user?.id && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{ranking.department}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {ranking.currentMonthPoints}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // Supervisor View: Team points + own
  if (normalizedUserRole === "supervisor") {
    const currentMonthData = getCurrentMonthData();
    const totalPoints = getTotalPoints();
    const currentMonthPoints = getCurrentMonthPoints();
    const userRank = getUserRank();

    // Get team members (simulated - in real app, fetch from API)
    const allUsers = JSON.parse(localStorage.getItem("dummyUsers") || "[]");
    const teamMembers = allUsers.filter(
      (u) => u.role === "Employee" && u.department === user?.department
    );

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const teamRankings = teamMembers.map((member) => {
      const memberPoints = getUserPoints(member.id);
      const currentMonthActivities = memberPoints.history.filter((activity) => {
        const activityDate = new Date(activity.date);
        return (
          activityDate.getMonth() + 1 === currentMonth &&
          activityDate.getFullYear() === currentYear
        );
      });
      const currentMonthPoints = currentMonthActivities.reduce(
        (sum, a) => sum + a.points,
        0
      );
      return {
        id: member.id,
        name: member.name,
        department: member.department,
        currentMonthPoints,
      };
    });

    teamRankings.sort((a, b) => b.currentMonthPoints - a.currentMonthPoints);

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Supervisor Rewards
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track your points and your team's performance
            </p>
          </div>

          {/* Points Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Total Points
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMonthPoints}</div>
                <p className="text-xs text-muted-foreground">My points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">Members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team Total
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamRankings.reduce(
                    (sum, m) => sum + m.currentMonthPoints,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="team" className="space-y-4">
            <TabsList>
              <TabsTrigger value="team">Team Performance</TabsTrigger>
              <TabsTrigger value="my-points">My Points</TabsTrigger>
              <TabsTrigger value="activities">How to Earn Points</TabsTrigger>
              <TabsTrigger value="rankings">Supervisor Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Member Points</CardTitle>
                  <CardDescription>
                    Current month points for your team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamRankings.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {member.currentMonthPoints}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-points" className="space-y-4">
              <PointHistorySection
                pointHistory={pointHistory}
                user={user}
                userRole={normalizedUserRole}
                isAdmin={normalizedUserRole === "admin"}
              />
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                  <CardDescription>
                    Activities that earn you points as a supervisor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {POINT_SYSTEM.supervisor.earnings.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.activity}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default">+{item.points}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Point Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {POINT_SYSTEM.supervisor.deductions.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.rule}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="destructive">{item.points}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rankings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Supervisor Rankings</CardTitle>
                  <CardDescription>
                    Current month rankings among supervisors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((ranking) => (
                        <TableRow
                          key={ranking.id}
                          className={ranking.id === user?.id ? "bg-muted" : ""}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {ranking.rank === 1 && (
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="font-semibold">
                                #{ranking.rank}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {ranking.name}
                            {ranking.id === user?.id && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{ranking.department}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {ranking.currentMonthPoints}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // Manager View: Department points
  if (normalizedUserRole === "safety_manager") {
    const currentMonthData = getCurrentMonthData();
    const totalPoints = getTotalPoints();
    const currentMonthPoints = getCurrentMonthPoints();
    const userRank = getUserRank();

    // Get department members
    const allUsers = JSON.parse(localStorage.getItem("dummyUsers") || "[]");
    const departmentMembers = allUsers.filter(
      (u) => u.department === user?.department
    );

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const departmentRankings = departmentMembers.map((member) => {
      const memberPoints = getUserPoints(member.id);
      const currentMonthActivities = memberPoints.history.filter((activity) => {
        const activityDate = new Date(activity.date);
        return (
          activityDate.getMonth() + 1 === currentMonth &&
          activityDate.getFullYear() === currentYear
        );
      });
      const currentMonthPoints = currentMonthActivities.reduce(
        (sum, a) => sum + a.points,
        0
      );
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        currentMonthPoints,
      };
    });

    departmentRankings.sort(
      (a, b) => b.currentMonthPoints - a.currentMonthPoints
    );

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manager Rewards</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track your points and department performance
            </p>
          </div>

          {/* Points Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Total Points
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMonthPoints}</div>
                <p className="text-xs text-muted-foreground">My points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Department Size
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {departmentMembers.length}
                </div>
                <p className="text-xs text-muted-foreground">Members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dept. Total
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {departmentRankings.reduce(
                    (sum, m) => sum + m.currentMonthPoints,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="department" className="space-y-4">
            <TabsList>
              <TabsTrigger value="department">
                Department Performance
              </TabsTrigger>
              <TabsTrigger value="my-points">My Points</TabsTrigger>
              <TabsTrigger value="activities">How to Earn Points</TabsTrigger>
              <TabsTrigger value="rankings">Manager Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="department" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Member Points</CardTitle>
                  <CardDescription>
                    Current month points for your department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentRankings.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.role}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {member.currentMonthPoints}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-points" className="space-y-4">
              <PointHistorySection
                pointHistory={pointHistory}
                user={user}
                userRole={normalizedUserRole}
                isAdmin={normalizedUserRole === "admin"}
              />
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                  <CardDescription>
                    Activities that earn you points as a manager
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {POINT_SYSTEM.safety_manager.earnings.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.activity}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default">+{item.points}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Point Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {POINT_SYSTEM.safety_manager.deductions.map(
                        (item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.rule}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="destructive">{item.points}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rankings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manager Rankings</CardTitle>
                  <CardDescription>
                    Current month rankings among managers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((ranking) => (
                        <TableRow
                          key={ranking.id}
                          className={ranking.id === user?.id ? "bg-muted" : ""}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {ranking.rank === 1 && (
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="font-semibold">
                                #{ranking.rank}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {ranking.name}
                            {ranking.id === user?.id && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{ranking.department}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {ranking.currentMonthPoints}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // Admin View: System overview (no points, but can see everything)
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Rewards System Overview
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Monitor the entire rewards system. Admins do not participate in
            point competitions.
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generateRankings("employee").length}
              </div>
              <p className="text-xs text-muted-foreground">In system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Supervisors
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generateRankings("supervisor").length}
              </div>
              <p className="text-xs text-muted-foreground">In system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Managers
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generateRankings("safety_manager").length}
              </div>
              <p className="text-xs text-muted-foreground">In system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Status
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employee Rankings</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisor Rankings</TabsTrigger>
            <TabsTrigger value="managers">Manager Rankings</TabsTrigger>
            <TabsTrigger value="point-system">
              Point System Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Rankings</CardTitle>
                <CardDescription>
                  Current month rankings for all employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generateRankings("employee").map((ranking) => (
                      <TableRow key={ranking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ranking.rank === 1 && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                            {ranking.rank === 2 && (
                              <Award className="h-4 w-4 text-gray-400" />
                            )}
                            {ranking.rank === 3 && (
                              <Award className="h-4 w-4 text-orange-400" />
                            )}
                            <span className="font-semibold">
                              #{ranking.rank}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {ranking.name}
                        </TableCell>
                        <TableCell>{ranking.department}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {ranking.currentMonthPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supervisors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Rankings</CardTitle>
                <CardDescription>
                  Current month rankings for all supervisors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generateRankings("supervisor").map((ranking) => (
                      <TableRow key={ranking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ranking.rank === 1 && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="font-semibold">
                              #{ranking.rank}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {ranking.name}
                        </TableCell>
                        <TableCell>{ranking.department}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {ranking.currentMonthPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manager Rankings</CardTitle>
                <CardDescription>
                  Current month rankings for all managers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generateRankings("safety_manager").map((ranking) => (
                      <TableRow key={ranking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ranking.rank === 1 && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="font-semibold">
                              #{ranking.rank}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {ranking.name}
                        </TableCell>
                        <TableCell>{ranking.department}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {ranking.currentMonthPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="point-system" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                 <h3 className="text-lg font-medium">Point System Configuration</h3>
                 <p className="text-sm text-muted-foreground">Customize how points are awarded and deducted per role.</p>
              </div>
              <div className="space-x-2">
                {isEditingRules ? (
                  <>
                    <Button variant="outline" onClick={() => { setIsEditingRules(false); setEditedRules(rules); }}>Cancel</Button>
                    <Button onClick={handleSaveRules}>Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditingRules(true)}>Edit Rules</Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {['employee', 'supervisor', 'safety_manager'].map((role) => (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="capitalize">{role.replace('_', ' ')} Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                       <div>
                          <h4 className="text-sm font-semibold mb-2">Earnings</h4>
                          <div className="space-y-2">
                            {(isEditingRules ? editedRules : rules)[role].earnings.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-center text-sm">
                                {isEditingRules ? (
                                  <>
                                    <Input 
                                      value={item.activity} 
                                      onChange={(e) => handleRuleChange(role, 'earnings', idx, 'activity', e.target.value)}
                                      className="h-8 text-xs"
                                      placeholder="Activity Name"
                                    />
                                    <Input 
                                      type="number"
                                      value={item.points} 
                                      onChange={(e) => handleRuleChange(role, 'earnings', idx, 'points', e.target.value)}
                                      className="w-16 h-8 text-xs text-right"
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleRemoveRule(role, 'earnings', idx)}
                                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="truncate flex-1">{item.activity}</span>
                                    <Badge variant="default">+{item.points}</Badge>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          {isEditingRules && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAddRule(role, 'earnings')}
                              className="mt-2 w-full text-xs border-dashed"
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add Earning Rule
                            </Button>
                          )}
                       </div>
                       
                       <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold mb-2">Deductions</h4>
                          <div className="space-y-2">
                            {(isEditingRules ? editedRules : rules)[role].deductions.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-center text-sm">
                                {isEditingRules ? (
                                  <>
                                    <Input 
                                      value={item.rule} 
                                      onChange={(e) => handleRuleChange(role, 'deductions', idx, 'rule', e.target.value)}
                                      className="h-8 text-xs"
                                      placeholder="Violation Name"
                                    />
                                    <Input 
                                      type="number"
                                      value={item.points} 
                                      onChange={(e) => handleRuleChange(role, 'deductions', idx, 'points', e.target.value)}
                                      className="w-16 h-8 text-xs text-right"
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleRemoveRule(role, 'deductions', idx)}
                                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="truncate flex-1">{item.rule}</span>
                                    <Badge variant="destructive">{item.points}</Badge>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          {isEditingRules && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAddRule(role, 'deductions')}
                              className="mt-2 w-full text-xs border-dashed"
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add Deduction Rule
                            </Button>
                          )}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
