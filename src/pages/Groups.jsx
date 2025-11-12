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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, MoreVertical, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { dummyUsers } from "@/data";
import { createGroupNotification } from "@/lib/notificationUtils";

const Groups = () => {
  const { user: loggedInUser } = useAuth();
  const [groups, setGroups] = useState(() => {
    const stored = localStorage.getItem("groups");
    return stored ? JSON.parse(stored) : [];
  });
  const [users] = useState(() => {
    const stored = localStorage.getItem("dummyUsers");
    return stored ? JSON.parse(stored) : dummyUsers;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    members: [],
    permissions: {
      manage_users: false,
      view_reports: false,
      create_hazards: false,
      manage_checklists: false,
      view_training: false,
    },
  });

  useEffect(() => {
    const handleGroupsUpdate = () => {
      const stored = localStorage.getItem("groups");
      setGroups(stored ? JSON.parse(stored) : []);
    };

    window.addEventListener("groupsUpdated", handleGroupsUpdate);

    return () => {
      window.removeEventListener("groupsUpdated", handleGroupsUpdate);
    };
  }, []);

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

  const getUserGroups = () => {
    if (loggedInUser?.role === "admin") {
      return groups;
    }
    return groups.filter((group) => group.members.includes(loggedInUser?.id));
  };

  const handleEdit = () => {
    if (!groupFormData.name || groupFormData.members.length === 0) {
      toast.error("Please provide a group name and select at least one member");
      return;
    }

    const updatedGroups = groups.map((group) =>
      group.id === editingGroup.id ? { ...group, ...groupFormData } : group
    );
    setGroups(updatedGroups);
    localStorage.setItem("groups", JSON.stringify(updatedGroups));

    // Notify group members about the update
    createGroupNotification("update", groupFormData, groupFormData.members);

    setGroupFormData({
      name: "",
      members: [],
      permissions: {
        manage_users: false,
        view_reports: false,
        create_hazards: false,
        manage_checklists: false,
        view_training: false,
      },
    });
    setIsEditDialogOpen(false);
    setEditingGroup(null);
    toast.success("Group updated successfully");
  };

  const handleDelete = (id) => {
    const updatedGroups = groups.filter((group) => group.id !== id);
    setGroups(updatedGroups);
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
    toast.success("Group deleted successfully");
  };

  const openEditDialog = (group) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      members: group.members,
      permissions: group.permissions,
    });
    setIsEditDialogOpen(true);
  };

  const filteredGroups = getUserGroups().filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberNames = (memberIds) => {
    return memberIds
      .map((id) => {
        const user = users.find((u) => u.id === id);
        return user ? user.name : "Unknown User";
      })
      .join(", ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {loggedInUser?.role === "admin"
                ? "Groups Management"
                : "My Groups"}
            </h1>
            <p className="text-muted-foreground">
              {loggedInUser?.role === "admin"
                ? "Manage system groups and permissions"
                : "View groups you belong to"}
            </p>
          </div>
        </div>

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
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      Group Name
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Members</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Permissions
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Created</TableHead>
                    {loggedInUser?.role === "admin" && (
                      <TableHead className="text-right whitespace-nowrap">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {group.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{group.members.length} members</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {getMemberNames(group.members)}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(group.permissions).map(
                            ([key, value]) =>
                              value ? (
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
                      <TableCell className="whitespace-nowrap">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </TableCell>
                      {loggedInUser?.role === "admin" && (
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(group.id)}
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

        {/* Edit Dialog */}
        {loggedInUser?.role === "admin" && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
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
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(groupFormData.permissions).map((perm) => (
                      <div key={perm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-perm-${perm}`}
                          checked={groupFormData.permissions[perm]}
                          onChange={(e) =>
                            setGroupFormData({
                              ...groupFormData,
                              permissions: {
                                ...groupFormData.permissions,
                                [perm]: e.target.checked,
                              },
                            })
                          }
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
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEdit}>Update Group</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Groups;
