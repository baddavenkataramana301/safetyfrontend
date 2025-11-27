import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { dummyRewards } from "@/data";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Award,
  Trophy,
  Star,
  Gift,
} from "lucide-react";

const Rewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: "",
    rewardTitle: "",
    rewardType: "",
    reason: "",
    issuedBy: user?.name || "",
    issueDate: new Date().toISOString().split("T")[0],
    pointsEarned: 0,
    status: "Active",
  });

  useEffect(() => {
    // Load rewards from localStorage or use dummy data
    const storedRewards = localStorage.getItem("rewards");
    const initialRewards = storedRewards
      ? JSON.parse(storedRewards)
      : dummyRewards;

    // Filter rewards based on user role
    const userRole = user?.role;
    const roleFilteredRewards = initialRewards.filter((reward) => {
      // If reward has targetRoles, check if user role is included
      if (reward.targetRoles) {
        return reward.targetRoles.includes(userRole);
      }
      // If no targetRoles specified, show to all roles (for backward compatibility)
      return true;
    });

    setRewards(roleFilteredRewards);
  }, [user?.role]);

  useEffect(() => {
    let filtered = rewards;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (reward) =>
          reward.employeeName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reward.rewardTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reward.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((reward) => reward.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((reward) => reward.rewardType === typeFilter);
    }

    setFilteredRewards(filtered);
  }, [rewards, searchTerm, statusFilter, typeFilter]);

  const handleSaveReward = () => {
    if (
      !formData.employeeName ||
      !formData.rewardTitle ||
      !formData.rewardType ||
      !formData.reason
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    let updatedRewards;
    if (editingReward) {
      updatedRewards = rewards.map((reward) =>
        reward.id === editingReward.id
          ? { ...formData, id: editingReward.id }
          : reward
      );
      toast.success("Reward updated successfully");
    } else {
      const newReward = {
        ...formData,
        id: Math.max(...rewards.map((r) => r.id), 0) + 1,
      };
      updatedRewards = [...rewards, newReward];
      toast.success("Reward added successfully");
    }

    setRewards(updatedRewards);
    localStorage.setItem("rewards", JSON.stringify(updatedRewards));
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteReward = (id) => {
    const updatedRewards = rewards.filter((reward) => reward.id !== id);
    setRewards(updatedRewards);
    localStorage.setItem("rewards", JSON.stringify(updatedRewards));
    toast.success("Reward deleted successfully");
  };

  const resetForm = () => {
    setFormData({
      employeeName: "",
      rewardTitle: "",
      rewardType: "",
      reason: "",
      issuedBy: user?.name || "",
      issueDate: new Date().toISOString().split("T")[0],
      pointsEarned: 0,
      status: "Active",
    });
    setEditingReward(null);
  };

  const openEditModal = (reward) => {
    setEditingReward(reward);
    setFormData(reward);
    setIsModalOpen(true);
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case "Badge":
        return <Award className="h-5 w-5 text-[#f59e0b]" />;
      case "Points":
        return <Star className="h-5 w-5 text-[#3b82f6]" />;
      case "Certificate":
        return <Trophy className="h-5 w-5 text-[#16a34a]" />;
      case "Bonus":
        return <Gift className="h-5 w-5 text-[#f59e0b]" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "bg-[#16a34a]" : "bg-gray-500";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Badge":
        return "bg-[#f59e0b]";
      case "Points":
        return "bg-[#3b82f6]";
      case "Certificate":
        return "bg-[#16a34a]";
      case "Bonus":
        return "bg-[#f59e0b]";
      default:
        return "bg-gray-500";
    }
  };

  // Employee view: only show rewards earned by the current user
  if (user?.role === "employee") {
    const userRewards = rewards.filter(
      (reward) => reward.employeeName === user.name
    );

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Rewards</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              View your earned rewards and achievements
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userRewards.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Rewards Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Keep up the great work! Rewards will appear here when
                    earned.
                  </p>
                </CardContent>
              </Card>
            ) : (
              userRewards.map((reward) => (
                <Card
                  key={reward.id}
                  className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      {getRewardIcon(reward.rewardType)}
                      <Badge
                        className={`${getStatusColor(
                          reward.status
                        )} text-white`}
                      >
                        {reward.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {reward.rewardTitle}
                    </CardTitle>
                    <CardDescription>{reward.reason}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge
                          variant="outline"
                          className={`${getTypeColor(
                            reward.rewardType
                          )} text-white border-0`}
                        >
                          {reward.rewardType}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Points:</span>
                        <span className="font-semibold">
                          {reward.pointsEarned}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Issued:</span>
                        <span>
                          {new Date(reward.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">By:</span>
                        <span>{reward.issuedBy}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Admin/Manager view
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Rewards Management
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage employee rewards and recognition
            </p>
          </div>
          {(user?.role === "admin" || user?.role === "safety_manager") && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingReward ? "Edit Reward" : "Add New Reward"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingReward
                      ? "Update reward details"
                      : "Create a new reward for an employee"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employeeName">Employee Name *</Label>
                    <Input
                      id="employeeName"
                      value={formData.employeeName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employeeName: e.target.value,
                        })
                      }
                      placeholder="Enter employee name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rewardTitle">Reward Title *</Label>
                    <Input
                      id="rewardTitle"
                      value={formData.rewardTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rewardTitle: e.target.value,
                        })
                      }
                      placeholder="Enter reward title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rewardType">Reward Type *</Label>
                    <Select
                      value={formData.rewardType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, rewardType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Badge">Badge</SelectItem>
                        <SelectItem value="Points">Points</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="Bonus">Bonus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      placeholder="Enter reason for reward"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointsEarned">Points Earned</Label>
                    <Input
                      id="pointsEarned"
                      type="number"
                      value={formData.pointsEarned}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pointsEarned: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter points"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetRoles">Target Roles (Optional)</Label>
                    <Select
                      value={formData.targetRoles?.join(",") || ""}
                      onValueChange={(value) => {
                        const roles = value
                          ? value.split(",").map((r) => r.trim())
                          : [];
                        setFormData({ ...formData, targetRoles: roles });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roles (leave empty for all)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin Only</SelectItem>
                        <SelectItem value="safety_manager">
                          Manager Only
                        </SelectItem>
                        <SelectItem value="employee">Employee Only</SelectItem>
                        <SelectItem value="admin,safety_manager">
                          Admin & Manager
                        </SelectItem>
                        <SelectItem value="admin,employee">
                          Admin & Employee
                        </SelectItem>
                        <SelectItem value="safety_manager,employee">
                          Manager & Employee
                        </SelectItem>
                        <SelectItem value="admin,safety_manager,employee">
                          All Roles
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to show reward to all roles
                    </p>
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
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveReward}>
                      {editingReward ? "Update" : "Add"} Reward
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Badge">Badge</SelectItem>
              <SelectItem value="Points">Points</SelectItem>
              <SelectItem value="Certificate">Certificate</SelectItem>
              <SelectItem value="Bonus">Bonus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rewards Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Reward Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  {(user?.role === "admin" ||
                    user?.role === "safety_manager") && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell className="font-medium">
                      {reward.employeeName}
                    </TableCell>
                    <TableCell>{reward.rewardTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRewardIcon(reward.rewardType)}
                        <span>{reward.rewardType}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={reward.reason}
                    >
                      {reward.reason}
                    </TableCell>
                    <TableCell>{reward.pointsEarned}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          reward.status
                        )} text-white`}
                      >
                        {reward.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(reward.issueDate).toLocaleDateString()}
                    </TableCell>
                    {(user?.role === "admin" ||
                      user?.role === "safety_manager") && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(reward)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user?.role === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReward(reward.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRewards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No rewards found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
