import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Download,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { dummyUsers } from "@/data";
import jsPDF from "jspdf";
import {
  createUserNotification,
  createGroupNotification,
} from "@/lib/notificationUtils";

const UserManagement = () => {
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();
  
  // Users state
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("dummyUsers");
    return stored ? JSON.parse(stored) : dummyUsers;
  });
  
  // Groups state
  const [groups, setGroups] = useState(() => {
    const stored = localStorage.getItem("groups");
    const raw = stored ? JSON.parse(stored) : [];
    const migratePermissions = (perms) => {
      if (!perms)
        return {
          users: { create: false, read: false, update: false, delete: false },
          reports: { create: false, read: false, update: false, delete: false },
          hazards: { create: false, read: false, update: false, delete: false },
          checklists: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
          training: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        };
      const first = Object.values(perms)[0];
      if (first && typeof first === "object") return perms;
      return {
        users: {
          create: !!perms.manage_users,
          read: !!perms.view_reports || !!perms.manage_users,
          update: !!perms.manage_users,
          delete: !!perms.manage_users,
        },
        reports: {
          create: false,
          read: !!perms.view_reports,
          update: false,
          delete: false,
        },
        hazards: {
          create: !!perms.create_hazards,
          read: !!perms.create_hazards,
          update: !!perms.create_hazards,
          delete: false,
        },
        checklists: {
          create: !!perms.manage_checklists,
          read: !!perms.manage_checklists,
          update: !!perms.manage_checklists,
          delete: !!perms.manage_checklists,
        },
        training: {
          create: false,
          read: !!perms.view_training,
          update: false,
          delete: false,
        },
      };
    };
    return raw.map((g) => ({
      ...g,
      permissions: migratePermissions(g.permissions),
    }));
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState({
    dataType: "users", // users, groups, approvals
    fileFormat: "pdf", // pdf, excel, json
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isMemberSelectionDialogOpen, setIsMemberSelectionDialogOpen] =
    useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
    department: "",
    password: "",
    selectedGroupId: null,
    permissions: {
      users: { create: false, read: false, update: false, delete: false },
      reports: { create: false, read: false, update: false, delete: false },
      hazards: { create: false, read: false, update: false, delete: false },
      checklists: { create: false, read: false, update: false, delete: false },
      training: { create: false, read: false, update: false, delete: false },
    },
  });

  const [groupFormData, setGroupFormData] = useState({
    name: "",
    members: [],
    permissions: {
      users: { create: false, read: false, update: false, delete: false },
      reports: { create: false, read: false, update: false, delete: false },
      hazards: { create: false, read: false, update: false, delete: false },
      checklists: { create: false, read: false, update: false, delete: false },
      training: { create: false, read: false, update: false, delete: false },
    },
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  // Load and listen for updates
  useEffect(() => {
    const handleUsersUpdate = () => {
      const stored = localStorage.getItem("dummyUsers");
      setUsers(stored ? JSON.parse(stored) : dummyUsers);
    };
    window.addEventListener("usersUpdated", handleUsersUpdate);
    return () => window.removeEventListener("usersUpdated", handleUsersUpdate);
  }, []);

  useEffect(() => {
    const handleGroupsUpdate = () => {
      const stored = localStorage.getItem("groups");
      setGroups(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener("groupsUpdated", handleGroupsUpdate);
    return () => window.removeEventListener("groupsUpdated", handleGroupsUpdate);
  }, []);

  // ============ USERS FUNCTIONS ============

  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return <Badge className="bg-destructive">Admin</Badge>;
      case "Safety Manager":
        return <Badge className="bg-primary">Safety Manager</Badge>;
      case "Supervisor":
        return <Badge className="bg-warning">Supervisor</Badge>;
      default:
        return <Badge variant="secondary">Employee</Badge>;
    }
  };

  const handleCreateUser = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.department ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (users.some((user) => user.email === formData.email)) {
      toast.error("Email already exists");
      return;
    }

    // Get selected group if any
    const selectedGroup = formData.selectedGroupId 
      ? groups.find(g => g.id === formData.selectedGroupId)
      : null;

    // Use group permissions if group is selected, otherwise use manual permissions
    const userPermissions = selectedGroup 
      ? selectedGroup.permissions 
      : formData.permissions;

    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: "Employee", // All new users created via this form are Employees
      status: formData.status,
      department: formData.department,
      approved: true, // New users are auto-approved
      groupId: formData.selectedGroupId || null,
      permissions: userPermissions,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event("usersUpdated"));
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "Active",
      department: "",
      password: "",
      selectedGroupId: null,
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        reports: { create: false, read: false, update: false, delete: false },
        hazards: { create: false, read: false, update: false, delete: false },
        checklists: { create: false, read: false, update: false, delete: false },
        training: { create: false, read: false, update: false, delete: false },
      },
    });
    setIsCreateDialogOpen(false);
    createUserNotification("create", newUser);
    toast.success("User created successfully");
  };

  const handleEditUser = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.department
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      users.some(
        (user) => user.email === formData.email && user.id !== editingUser.id
      )
    ) {
      toast.error("Email already exists");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id
        ? {
            ...user,
            ...formData,
            password: formData.password || user.password,
          }
        : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "Active",
      department: "",
      password: "",
    });
    setIsEditDialogOpen(false);
    setEditingUser(null);
    const updatedUser = updatedUsers.find((u) => u.id === editingUser.id);
    createUserNotification("update", updatedUser);
    toast.success("User updated successfully");
  };

  const handleDeleteUser = (id) => {
    const userToDelete = users.find((u) => u.id === id);
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
    createUserNotification("delete", userToDelete);
    toast.success("User deleted successfully");
  };

  const handleApproveUser = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, approved: true } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
    if (loggedInUser && loggedInUser.id === id) {
      const updatedCurrentUser = { ...loggedInUser, approved: true };
      localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
    }
    const approvedUser = updatedUsers.find((u) => u.id === id);
    createUserNotification("approve", approvedUser);
    toast.success("Employee approved successfully");
  };

  const openEditUserDialog = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("User Management Report", 20, 20);

      let yPosition = 40;
      doc.setFontSize(12);
      doc.text("Name", 20, yPosition);
      doc.text("Email", 80, yPosition);
      doc.text("Role", 140, yPosition);
      doc.text("Department", 20, yPosition + 10);
      doc.text("Status", 80, yPosition + 10);
      doc.text("Approved", 140, yPosition + 10);

      yPosition += 20;

      filteredUsers.forEach((user) => {
        doc.text(user.name, 20, yPosition);
        doc.text(user.email, 80, yPosition);
        doc.text(user.role, 140, yPosition);
        doc.text(user.department, 20, yPosition + 10);
        doc.text(user.status, 80, yPosition + 10);
        doc.text(user.approved ? "Yes" : "No", 140, yPosition + 10);
        yPosition += 20;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });

      doc.save("user-management-report.pdf");
      toast.success("User management report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download report. Please try again.");
    }
  };

  // ============ DOWNLOAD FUNCTIONS ============

  const handleDownload = () => {
    const { dataType, fileFormat } = downloadOptions;
    let data, filename;

    try {
      // Prepare data based on selected type
      if (dataType === "users") {
        data = filteredUsers.map((user) => ({
          Name: user.name,
          Email: user.email,
          Role: user.role,
          Department: user.department,
          Status: user.status,
          Approved: user.approved ? "Yes" : "No",
        }));
        filename = "users";
      } else if (dataType === "groups") {
        data = filteredGroups.map((group) => ({
          "Group Name": group.name,
          Members: getMemberNames(group.members),
          "Member Count": group.members.length,
          Permissions: Object.keys(group.permissions)
            .filter(
              (key) =>
                group.permissions[key] &&
                (typeof group.permissions[key] === "boolean" ||
                  group.permissions[key].read ||
                  group.permissions[key].create)
            )
            .join(", "),
          "Created Date": new Date(group.createdAt).toLocaleDateString(),
        }));
        filename = "groups";
      } else if (dataType === "approvals") {
        data = users
          .filter((user) => !user.approved)
          .map((user) => ({
            Name: user.name,
            Email: user.email,
            Role: user.role,
            Department: user.department,
            Status: user.status,
            "Applied Date": user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A",
          }));
        filename = "pending-approvals";
      }

      // Download based on file format
      if (fileFormat === "json") {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename} as JSON`);
      } else if (fileFormat === "excel") {
        // Simple CSV export (Excel compatible)
        const headers = Object.keys(data[0] || {});
        const csv = [
          headers.join(","),
          ...data.map((row) =>
            headers
              .map((header) => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                return `"${String(value).replace(/"/g, '""')}"`;
              })
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
        toast.success(`Downloaded ${filename} as Excel/CSV`);
      } else if (fileFormat === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(
          `${dataType === "users" ? "Users" : dataType === "groups" ? "Groups" : "Pending Approvals"} Report`,
          20,
          20
        );

        let yPosition = 40;
        doc.setFontSize(10);
        const headers = Object.keys(data[0] || {});
        const colWidth = 170 / headers.length;

        // Draw headers
        headers.forEach((header, index) => {
          doc.text(header, 20 + index * colWidth, yPosition);
        });

        yPosition += 10;

        // Draw data rows
        data.forEach((row) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
            headers.forEach((header, index) => {
              doc.text(header, 20 + index * colWidth, yPosition);
            });
            yPosition += 10;
          }

          headers.forEach((header, index) => {
            const cellText = String(row[header]).substring(0, 20);
            doc.text(cellText, 20 + index * colWidth, yPosition);
          });
          yPosition += 8;
        });

        doc.save(`${filename}.pdf`);
        toast.success(`Downloaded ${filename} as PDF`);
      }

      setIsDownloadDialogOpen(false);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  // ============ GROUPS FUNCTIONS ============

  const handleCreateGroup = () => {
    if (!groupFormData.name || groupFormData.members.length === 0) {
      toast.error("Please provide a group name and select at least one member");
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: groupFormData.name,
      members: groupFormData.members,
      permissions: groupFormData.permissions,
      createdAt: new Date().toISOString(),
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
    createGroupNotification("create", newGroup, newGroup.members);

    setGroupFormData({
      name: "",
      members: [],
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        reports: { create: false, read: false, update: false, delete: false },
        hazards: { create: false, read: false, update: false, delete: false },
        checklists: {
          create: false,
          read: false,
          update: false,
          delete: false,
        },
        training: { create: false, read: false, update: false, delete: false },
      },
    });
    setIsCreateGroupDialogOpen(false);
    toast.success("Group created successfully");
  };

  const handleEditGroup = () => {
    if (!groupFormData.name || groupFormData.members.length === 0) {
      toast.error("Please provide a group name and select at least one member");
      return;
    }

    const updatedGroups = groups.map((group) =>
      group.id === editingGroup.id ? { ...group, ...groupFormData } : group
    );
    setGroups(updatedGroups);
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
    createGroupNotification("update", groupFormData, groupFormData.members);

    setGroupFormData({
      name: "",
      members: [],
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        reports: { create: false, read: false, update: false, delete: false },
        hazards: { create: false, read: false, update: false, delete: false },
        checklists: {
          create: false,
          read: false,
          update: false,
          delete: false,
        },
        training: { create: false, read: false, update: false, delete: false },
      },
    });
    setIsEditGroupDialogOpen(false);
    setEditingGroup(null);
    toast.success("Group updated successfully");
  };

  const handleDeleteGroup = (id) => {
    const updatedGroups = groups.filter((group) => group.id !== id);
    setGroups(updatedGroups);
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
    toast.success("Group deleted successfully");
  };

  const openEditGroupDialog = (group) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      members: group.members,
      permissions: group.permissions,
    });
    setIsEditGroupDialogOpen(true);
  };

  const getMemberNames = (memberIds) => {
    return memberIds
      .map((id) => {
        const user = users.find((u) => u.id === id);
        return user ? user.name : "Unknown User";
      })
      .join(", ");
  };

  // ============ FILTERING ============

  const filteredUsers = users.filter(
    (user) =>
      user.approved && (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Management Center</h1>
            <p className="text-muted-foreground">
              Manage users and groups with tabbed interface
            </p>
          </div>
          {loggedInUser?.role === "admin" && (
            <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Download Management Data</DialogTitle>
                  <DialogDescription>
                    Choose what data to download and in which format
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>What to Download?</Label>
                    <Select
                      value={downloadOptions.dataType}
                      onValueChange={(value) =>
                        setDownloadOptions({ ...downloadOptions, dataType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="groups">Groups</SelectItem>
                        <SelectItem value="approvals">Pending Approvals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>File Format</Label>
                    <Select
                      value={downloadOptions.fileFormat}
                      onValueChange={(value) =>
                        setDownloadOptions({ ...downloadOptions, fileFormat: value })
                      }
                    >
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
                    <Button
                      variant="outline"
                      onClick={() => setIsDownloadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          {/* ============ USERS TAB ============ */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">User Management</h2>
                <p className="text-muted-foreground text-sm">
                  Manage system users and permissions
                </p>
              </div>
              {loggedInUser?.role === "admin" && (
                <div className="flex gap-2">
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-name">Name</Label>
                            <Input
                              id="create-name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-email">Email</Label>
                            <Input
                              id="create-email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              placeholder="Enter email address"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-password">Password</Label>
                            <Input
                              id="create-password"
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              placeholder="Enter password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-group">Add to Group</Label>
                            <Select
                              value={formData.selectedGroupId?.toString() || "none"}
                              onValueChange={(value) => {
                                const groupId = value === "none" ? null : parseInt(value);
                                const selectedGroup = groupId 
                                  ? groups.find(g => g.id === groupId)
                                  : null;
                                
                                setFormData({
                                  ...formData,
                                  selectedGroupId: groupId,
                                  permissions: selectedGroup 
                                    ? selectedGroup.permissions 
                                    : formData.permissions,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a group (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Group</SelectItem>
                                {groups.map((group) => (
                                  <SelectItem key={group.id} value={group.id.toString()}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formData.selectedGroupId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                User will inherit this group's permissions
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-department">
                              Department
                            </Label>
                            <Input
                              id="create-department"
                              value={formData.department}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  department: e.target.value,
                                })
                              }
                              placeholder="Enter department"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-status">Status</Label>
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
                                <SelectItem value="Inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {!formData.selectedGroupId && (
                          <div className="space-y-2">
                            <Label>Permissions (if no group selected)</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.keys(formData.permissions).map(
                                (section) => {
                                  const perms = formData.permissions[section];
                                  return (
                                    <div
                                      key={section}
                                      className="p-2 border rounded-md bg-muted/5"
                                    >
                                      <div className="text-xs sm:text-sm font-medium capitalize mb-2">
                                        {section.replace("_", " ")}
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {["create", "read", "update", "delete"].map(
                                          (op) => (
                                            <label
                                              key={op}
                                              className="inline-flex items-center gap-1 text-xs sm:text-sm"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={!!perms[op]}
                                                onChange={(e) =>
                                                  setFormData({
                                                    ...formData,
                                                    permissions: {
                                                      ...formData.permissions,
                                                      [section]: {
                                                        ...formData.permissions[section],
                                                        [op]: e.target.checked,
                                                      },
                                                    },
                                                  })
                                                }
                                              />
                                              <span className="capitalize">
                                                {op}
                                              </span>
                                            </label>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsCreateDialogOpen(false);
                              setFormData({
                                name: "",
                                email: "",
                                role: "",
                                status: "Active",
                                department: "",
                                password: "",
                                selectedGroupId: null,
                                permissions: {
                                  users: { create: false, read: false, update: false, delete: false },
                                  reports: { create: false, read: false, update: false, delete: false },
                                  hazards: { create: false, read: false, update: false, delete: false },
                                  checklists: { create: false, read: false, update: false, delete: false },
                                  training: { create: false, read: false, update: false, delete: false },
                                },
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreateUser}>
                            Create User
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            <Card className="relative">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name, email, role, or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                          Name
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                          Role
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                          Department
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm">
                            {user.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                            {user.email}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                            {user.department}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                            <Badge
                              variant={
                                user.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap text-xs sm:text-sm">
                            <div className="flex justify-end gap-2">
                              {loggedInUser?.role === "admin" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditUserDialog(user)}
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
                                          Delete User
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete{" "}
                                          {user.name}? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteUser(user.id)
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Edit User Dialog */}
            {loggedInUser?.role === "admin" && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                      Update user information and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) =>
                            setFormData({ ...formData, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Safety Manager">
                              Safety Manager
                            </SelectItem>
                            <SelectItem value="Supervisor">
                              Supervisor
                            </SelectItem>
                            <SelectItem value="Employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-department">Department</Label>
                        <Input
                          id="edit-department"
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department: e.target.value,
                            })
                          }
                          placeholder="Enter department"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
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
                          <SelectItem value="Inactive">Inactive</SelectItem>
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
                      <Button onClick={handleEditUser}>Update User</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* ============ GROUPS TAB ============ */}
          <TabsContent value="groups" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Group Management</h2>
                <p className="text-muted-foreground text-sm">
                  Manage system groups and permissions
                </p>
              </div>
              {loggedInUser?.role === "admin" && (
                <Dialog
                  open={isCreateGroupDialogOpen}
                  onOpenChange={setIsCreateGroupDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                      <DialogDescription>
                        Create a group with members and assign permissions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                          id="group-name"
                          value={groupFormData.name}
                          onChange={(e) =>
                            setGroupFormData({
                              ...groupFormData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter group name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Members</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={`${groupFormData.members.length} members selected`}
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={() =>
                              setIsMemberSelectionDialogOpen(true)
                            }
                            className="w-full sm:w-auto"
                          >
                            Select Members
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.keys(groupFormData.permissions).map(
                            (section) => {
                              const perms =
                                groupFormData.permissions[section];
                              return (
                                <div
                                  key={section}
                                  className="p-2 border rounded-md bg-muted/5"
                                >
                                  <div className="text-xs sm:text-sm font-medium capitalize mb-2">
                                    {section.replace("_", " ")}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {["create", "read", "update", "delete"].map(
                                      (op) => (
                                        <label
                                          key={op}
                                          className="inline-flex items-center gap-1 text-xs sm:text-sm"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={!!perms[op]}
                                            onChange={(e) =>
                                              setGroupFormData({
                                                ...groupFormData,
                                                permissions: {
                                                  ...groupFormData.permissions,
                                                  [section]: {
                                                    ...groupFormData
                                                      .permissions[section],
                                                    [op]: e.target.checked,
                                                  },
                                                },
                                              })
                                            }
                                          />
                                          <span className="capitalize">
                                            {op}
                                          </span>
                                        </label>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateGroupDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateGroup}>
                          Create Group
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Member Selection Dialog */}
            {loggedInUser?.role === "admin" && (
              <Dialog
                open={isMemberSelectionDialogOpen}
                onOpenChange={(open) => {
                  setIsMemberSelectionDialogOpen(open);
                  if (!open) setMemberSearchTerm(""); // Reset search when dialog closes
                }}
              >
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Select Group Members</DialogTitle>
                    <DialogDescription>
                      Choose users to add to this group. Only approved users are
                      shown.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search members by name or email..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Department</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users
                            .filter(
                              (user) =>
                                user.approved &&
                                (user.name
                                  .toLowerCase()
                                  .includes(memberSearchTerm.toLowerCase()) ||
                                  user.email
                                    .toLowerCase()
                                    .includes(memberSearchTerm.toLowerCase()))
                            )
                            .map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    id={`select-member-${user.id}`}
                                    checked={groupFormData.members.includes(
                                      user.id
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setGroupFormData({
                                          ...groupFormData,
                                          members: [
                                            ...groupFormData.members,
                                            user.id,
                                          ],
                                        });
                                      } else {
                                        setGroupFormData({
                                          ...groupFormData,
                                          members: groupFormData.members.filter(
                                            (id) => id !== user.id
                                          ),
                                        });
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {user.name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell>{user.department}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {groupFormData.members.length} members selected
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setIsMemberSelectionDialogOpen(false)
                          }
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            setIsMemberSelectionDialogOpen(false)
                          }
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Card className="relative">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search groups by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                          Group Name
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                          Members
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                          Permissions
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                          Created
                        </TableHead>
                        {loggedInUser?.role === "admin" && (
                          <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm">
                            {group.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{group.members.length} members</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {getMemberNames(group.members)}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(group.permissions).map(
                                ([key, value]) =>
                                  value &&
                                  (typeof value === "boolean" ||
                                    value.read ||
                                    value.create) ? (
                                    <Badge
                                      key={key}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {key.replace("_", " ")}
                                    </Badge>
                                  ) : null
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                            {new Date(group.createdAt).toLocaleDateString()}
                          </TableCell>
                          {loggedInUser?.role === "admin" && (
                            <TableCell className="text-right whitespace-nowrap text-xs sm:text-sm">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openEditGroupDialog(group)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteGroup(group.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}

                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Edit Group Dialog */}
            {loggedInUser?.role === "admin" && (
              <Dialog
                open={isEditGroupDialogOpen}
                onOpenChange={setIsEditGroupDialogOpen}
              >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
                    <DialogDescription>
                      Update group information and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-group-name">Group Name</Label>
                      <Input
                        id="edit-group-name"
                        value={groupFormData.name}
                        onChange={(e) =>
                          setGroupFormData({
                            ...groupFormData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter group name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Members ({groupFormData.members.length} selected)
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {getMemberNames(groupFormData.members)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.keys(groupFormData.permissions).map((perm) => (
                          <div key={perm} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-perm-${perm}`}
                              checked={
                                groupFormData.permissions[perm] &&
                                (typeof groupFormData.permissions[perm] ===
                                "boolean"
                                  ? groupFormData.permissions[perm]
                                  : groupFormData.permissions[perm].read ||
                                    groupFormData.permissions[perm].create)
                              }
                              onChange={(e) => {
                                const currentPerms =
                                  groupFormData.permissions[perm];
                                const isObject =
                                  typeof currentPerms === "object" &&
                                  currentPerms !== null;
                                setGroupFormData({
                                  ...groupFormData,
                                  permissions: {
                                    ...groupFormData.permissions,
                                    [perm]: isObject
                                      ? {
                                          ...currentPerms,
                                          read: e.target.checked,
                                          create: e.target.checked,
                                        }
                                      : e.target.checked,
                                  },
                                });
                              }}
                            />
                            <Label
                              htmlFor={`edit-perm-${perm}`}
                              className="text-sm capitalize"
                            >
                              {perm.replace("_", " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditGroupDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleEditGroup}>Update Group</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* ============ APPROVALS TAB ============ */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Pending Approvals</h2>
                <p className="text-muted-foreground text-sm">
                  Review and approve pending user registrations
                </p>
              </div>
            </div>

            <Card className="relative">
              <CardHeader>
                <div className="overflow-x-auto -mx-6">
                  <div className="flex items-center gap-4 flex-1 px-6">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search pending users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                          Name
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                          Role
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                          Department
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                          Applied Date
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(
                          (user) =>
                            !user.approved &&
                            (user.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                              user.email
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                        )
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="cursor-pointer hover:text-primary transition-colors">
                                    {user.name}
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                        <h4 className="font-semibold">{user.name}</h4>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                      </div>
                                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                        {user.name.charAt(0)}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">Role</p>
                                        <p className="font-medium">{user.role}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">Department</p>
                                        <p className="font-medium">{user.department}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                                          {user.status}
                                        </Badge>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">Applied Date</p>
                                        <p className="font-medium text-xs">
                                          {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                              {user.email}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                              {getRoleBadge(user.role)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                              {user.department}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap text-xs sm:text-sm">
                              <div className="flex justify-end gap-1">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="h-8 px-2 bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Approve User
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to approve{" "}
                                        <strong>{user.name}</strong>? They will
                                        be able to login to the system.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleApproveUser(user.id)
                                        }
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Approve
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Reject Application
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete{" "}
                                        <strong>{user.name}</strong>'s
                                        application? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteUser(user.id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {users.filter((u) => !u.approved).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No pending approvals. All users have been approved! ✅
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
