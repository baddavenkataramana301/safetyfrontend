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
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { dummyUsers } from "@/data";
import jsPDF from "jspdf";
import {
  createUserNotification,
  createGroupNotification,
} from "@/lib/notificationUtils";

const Users = () => {
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("dummyUsers");
    return stored ? JSON.parse(stored) : dummyUsers;
  });
  const [groups, setGroups] = useState(() => {
    const stored = localStorage.getItem("groups");
    const raw = stored ? JSON.parse(stored) : [];
    // migrate older permission shapes (boolean flags) to CRUD per-section
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

      // detect if already CRUD-shaped
      const first = Object.values(perms)[0];
      if (first && typeof first === "object") return perms;

      // otherwise, map legacy boolean flags to sensible CRUD defaults
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
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isMemberSelectionDialogOpen, setIsMemberSelectionDialogOpen] =
    useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    members: [],
    // permissions now supports CRUD per section
    permissions: {
      users: { create: false, read: false, update: false, delete: false },
      reports: { create: false, read: false, update: false, delete: false },
      hazards: { create: false, read: false, update: false, delete: false },
      checklists: { create: false, read: false, update: false, delete: false },
      training: { create: false, read: false, update: false, delete: false },
    },
  });

  useEffect(() => {
    const handleUsersUpdate = () => {
      const stored = localStorage.getItem("dummyUsers");
      setUsers(stored ? JSON.parse(stored) : dummyUsers);
    };

    window.addEventListener("usersUpdated", handleUsersUpdate);

    return () => {
      window.removeEventListener("usersUpdated", handleUsersUpdate);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
    department: "",
    password: "",
    confirmPassword: "",
  });

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

  const handleCreate = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.department ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Check if email already exists
    if (users.some((user) => user.email === formData.email)) {
      toast.error("Email already exists");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      status: formData.status,
      department: formData.department,
      approved: formData.role !== "Employee", // Auto-approve non-employees
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
      confirmPassword: "",
    });
    setIsCreateDialogOpen(false);

    // Create notification for all users
    createUserNotification("create", newUser);

    toast.success("User created successfully");
  };

  const handleEdit = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.department
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if email already exists (excluding current user)
    if (
      users.some(
        (user) => user.email === formData.email && user.id !== editingUser.id
      )
    ) {
      toast.error("Email already exists");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id ? { ...user, ...formData } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "Active",
      department: "",
    });
    setIsEditDialogOpen(false);
    setEditingUser(null);

    // Create notification for all users
    const updatedUser = updatedUsers.find((u) => u.id === editingUser.id);
    createUserNotification("update", updatedUser);

    toast.success("User updated successfully");
  };

  const handleDelete = (id) => {
    const userToDelete = users.find((u) => u.id === id);
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));

    // Create notification for all users
    createUserNotification("delete", userToDelete);

    toast.success("User deleted successfully");
  };

  const handleApprove = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, approved: true } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
    console.log("Updated dummyUsers in localStorage:", updatedUsers);

    // Update the current user's localStorage if they are the one being approved
    if (loggedInUser && loggedInUser.id === id) {
      const updatedCurrentUser = { ...loggedInUser, approved: true };
      localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
      console.log("Updated current user in localStorage:", updatedCurrentUser);
    }

    // Create notification for all users
    const approvedUser = updatedUsers.find((u) => u.id === id);
    createUserNotification("approve", approvedUser);

    toast.success("Employee approved successfully");
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!groupFormData.name || groupFormData.members.length === 0) {
      toast.error("Please provide a group name and select at least one member");
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: groupFormData.name,
      members: groupFormData.members,
      // store CRUD permissions per section
      permissions: groupFormData.permissions,
      createdAt: new Date().toISOString(),
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem("groups", JSON.stringify(updatedGroups));

    // Notify group members
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-name">Name</Label>
                        <Input
                          id="create-name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
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
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="create-confirm-password">
                          Confirm Password
                        </Label>
                        <Input
                          id="create-confirm-password"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-role">Role</Label>
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
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-department">Department</Label>
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
                            confirmPassword: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreate}>Create User</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isCreateGroupDialogOpen}
                onOpenChange={setIsCreateGroupDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Group
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </div>

        {/* Create Group Dialog */}
        {loggedInUser?.role === "admin" && (
          <Dialog
            open={isCreateGroupDialogOpen}
            onOpenChange={setIsCreateGroupDialogOpen}
          >
            <DialogContent className="max-w-2xl">
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
                  <div className="flex gap-2">
                    <Input
                      value={`${groupFormData.members.length} members selected`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setIsMemberSelectionDialogOpen(true)}
                    >
                      Select Members
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(groupFormData.permissions).map((section) => {
                      const perms = groupFormData.permissions[section];
                      return (
                        <div
                          key={section}
                          className="p-2 border rounded-md bg-muted/5"
                        >
                          <div className="text-sm font-medium capitalize mb-2">
                            {section.replace("_", " ")}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {["create", "read", "update", "delete"].map(
                              (op) => (
                                <label
                                  key={op}
                                  className="inline-flex items-center gap-2 text-sm"
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
                                            ...groupFormData.permissions[
                                              section
                                            ],
                                            [op]: e.target.checked,
                                          },
                                        },
                                      })
                                    }
                                  />
                                  <span className="capitalize">{op}</span>
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateGroupDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup}>Create Group</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Member Selection Dialog */}
        {loggedInUser?.role === "admin" && (
          <Dialog
            open={isMemberSelectionDialogOpen}
            onOpenChange={setIsMemberSelectionDialogOpen}
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
                        .filter((user) => user.approved)
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
                      onClick={() => setIsMemberSelectionDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setIsMemberSelectionDialogOpen(false)}
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
                  placeholder="Search users by name, email, role, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Department
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Approved
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {user.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {user.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {user.department}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={
                            user.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={user.approved ? "default" : "destructive"}
                        >
                          {user.approved ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          {loggedInUser?.role === "admin" &&
                            !user.approved &&
                            user.role === "Employee" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(user.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          {loggedInUser?.role === "admin" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(user)}
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
                                      {user.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(user.id)}
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

        {/* Edit Dialog */}
        {loggedInUser?.role === "admin" && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
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
                        setFormData({ ...formData, department: e.target.value })
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
                  <Button onClick={handleEdit}>Update User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;
