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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const DepartmentsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState(() => {
    const stored = localStorage.getItem("departments");
    return stored ? JSON.parse(stored) : [];
  });
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("dummyUsers");
    return stored ? JSON.parse(stored) : [];
  });

  const [newDeptName, setNewDeptName] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState(() => {
    const stored = localStorage.getItem("groups");
    return stored ? JSON.parse(stored) : [];
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    status: "Active",
    department: "",
    selectedGroupId: null,
    permissions: {
      users: { create: false, read: false, update: false, delete: false },
      reports: { create: false, read: false, update: false, delete: false },
      hazards: { create: false, read: false, update: false, delete: false },
      checklists: { create: false, read: false, update: false, delete: false },
      training: { create: false, read: false, update: false, delete: false },
    },
  });

  useEffect(() => {
    const handleUsersUpdated = () => {
      const stored = localStorage.getItem("dummyUsers");
      setUsers(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener("usersUpdated", handleUsersUpdated);
    return () => window.removeEventListener("usersUpdated", handleUsersUpdated);
  }, []);

  useEffect(() => {
    const handleGroupsUpdated = () => {
      const stored = localStorage.getItem("groups");
      setGroups(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener("groupsUpdated", handleGroupsUpdated);
    return () => window.removeEventListener("groupsUpdated", handleGroupsUpdated);
  }, []);

  useEffect(() => {
    const handleGroupsUpdated = () => {
      // no-op here but keep symmetry
    };
    window.addEventListener("groupsUpdated", handleGroupsUpdated);
    return () => window.removeEventListener("groupsUpdated", handleGroupsUpdated);
  }, []);

  // Ensure departments list includes any department currently used by users
  useEffect(() => {
    const namesFromUsers = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
    const merged = Array.from(new Set([...(departments || []), ...namesFromUsers]));
    if (JSON.stringify(merged) !== JSON.stringify(departments)) {
      setDepartments(merged);
      localStorage.setItem("departments", JSON.stringify(merged));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const addDepartment = () => {
    const name = newDeptName.trim();
    if (!name) return toast.error("Enter department name");
    if (departments.includes(name)) return toast.error("Department already exists");
    const updated = [...departments, name];
    setDepartments(updated);
    localStorage.setItem("departments", JSON.stringify(updated));
    setNewDeptName("");
    toast.success(`Department '${name}' created`);
  };

  const deleteMember = (userId) => {
    try {
      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
      // remove from groups
      const storedGroups = localStorage.getItem("groups");
      const gr = storedGroups ? JSON.parse(storedGroups) : [];
      const newGroups = gr.map((g) => ({ ...g, members: (g.members || []).filter((id) => id !== userId) }));
      localStorage.setItem("groups", JSON.stringify(newGroups));
      window.dispatchEvent(new Event("usersUpdated"));
      window.dispatchEvent(new Event("groupsUpdated"));
      toast.success("Member deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete member");
    }
  };

  const viewMembers = (dept) => {
  setSelectedDept(dept);
  setShowAddUserForm(false);
  };

  const addUserToDept = () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) return toast.error("Fill all fields");
    const exists = users.some((u) => u.email === newUserData.email);
    if (exists) return toast.error("Email already exists");

    const newUser = {
      id: Date.now(),
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password,
      role: "Employee",
      status: "Active",
      department: selectedDept,
      approved: true,
      groupId: null,
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        reports: { create: false, read: false, update: false, delete: false },
        hazards: { create: false, read: false, update: false, delete: false },
        checklists: { create: false, read: false, update: false, delete: false },
        training: { create: false, read: false, update: false, delete: false },
      },
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event("usersUpdated"));

    // ensure department present
    if (!departments.includes(selectedDept)) {
      const updated = [...departments, selectedDept];
      setDepartments(updated);
      localStorage.setItem("departments", JSON.stringify(updated));
    }

    setNewUserData({ name: "", email: "", password: "" });
    setShowAddUserForm(false);
    toast.success("User added to department");
  };

  const deptCounts = departments.map((d) => ({ name: d, count: users.filter((u) => u.department === d).length }));

  const filteredDeptCounts = deptCounts.filter((d) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    if (d.name.toLowerCase().includes(term)) return true;
    return users.some((u) => u.department === d.name && (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)));
  });

  if (user?.role !== "admin") {
    return <div className="p-4">Unauthorized</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Departments</h1>
            <p className="text-muted-foreground text-sm">Manage departments and members</p>
          </div>
          <div className="flex-1 max-w-md">
            <Input placeholder="Search departments or members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/users')}>Back to Users</Button>
            <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setSelectedDept(null); setShowAddUserForm(false); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Department</DialogTitle>
                  <DialogDescription>Enter a name for the new department</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Department name" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setIsDeptDialogOpen(false); setNewDeptName(""); }}>Cancel</Button>
                    <Button onClick={() => { addDepartment(); setIsDeptDialogOpen(false); }}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeptCounts.map((d) => (
            <Card key={d.name} className="relative">
              <CardHeader>
                <CardTitle className="text-sm font-medium">{d.name}</CardTitle>
                <CardDescription>{d.count} members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    if (selectedDept === d.name) {
                      // close members view
                      setSelectedDept(null);
                      setShowAddUserForm(false);
                      setIsCreateDialogOpen(false);
                    } else {
                      viewMembers(d.name);
                    }
                  }}>
                    {selectedDept === d.name ? 'Close Members' : 'View Members'}
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedDept(d.name); setShowAddUserForm(true); setIsCreateDialogOpen(true); }}>Add Member</Button>
                </div>
                {selectedDept === d.name && (
                  <div className="mt-4">
                    <h4 className="font-medium">Members</h4>
                    <ul className="mt-2">
                      {users.filter((u) => u.department === d.name).map((u) => (
                        <li key={u.id} className="text-sm flex items-center justify-between">
                          <span>{u.name} — {u.email}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { /* open edit user in Users page */ navigate(`/users`); }}>
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {u.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMember(u.id)} className="text-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </li>
                      ))}
                      {users.filter((u) => u.department === d.name).length === 0 && (
                        <li className="text-sm text-muted-foreground">No members in this department</li>
                      )}
                    </ul>
                    {showAddUserForm && (
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <div />
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create User in {selectedDept}</DialogTitle>
                            <DialogDescription>Add a new user and assign to the department</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                <Label>Group (optional)</Label>
                                <Select value={formData.selectedGroupId?.toString() || "none"} onValueChange={(value) => setFormData({...formData, selectedGroupId: value === 'none' ? null : parseInt(value) })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No Group</SelectItem>
                                    {groups.map(g => (
                                      <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => { setShowAddUserForm(false); setIsCreateDialogOpen(false); setFormData({...formData, name:'', email:'', password:''}); }}>Cancel</Button>
                              <Button onClick={() => {
                                // set department and create
                                setFormData(prev => ({ ...prev, department: selectedDept }));
                                // create user
                                if (!formData.name || !formData.email || !formData.password) { toast.error('Please fill all fields'); return; }
                                const storedUsers = localStorage.getItem('dummyUsers');
                                const usr = storedUsers ? JSON.parse(storedUsers) : [];
                                if (usr.some(u => u.email === formData.email)) { toast.error('Email already exists'); return; }
                                const newUser = {
                                  id: Date.now(),
                                  name: formData.name,
                                  email: formData.email,
                                  password: formData.password,
                                  role: formData.role || 'Employee',
                                  status: formData.status || 'Active',
                                  department: selectedDept,
                                  approved: true,
                                  groupId: formData.selectedGroupId || null,
                                  permissions: formData.permissions,
                                  createdAt: new Date().toISOString(),
                                };
                                const updated = [...usr, newUser];
                                localStorage.setItem('dummyUsers', JSON.stringify(updated));
                                window.dispatchEvent(new Event('usersUpdated'));
                                // if added to group, update groups
                                if (newUser.groupId) {
                                  const storedGroups = localStorage.getItem('groups');
                                  const gr = storedGroups ? JSON.parse(storedGroups) : [];
                                  const newGroups = gr.map(g => g.id === newUser.groupId ? { ...g, members: Array.isArray(g.members) ? [...g.members, newUser.id] : [newUser.id] } : g);
                                  localStorage.setItem('groups', JSON.stringify(newGroups));
                                  window.dispatchEvent(new Event('groupsUpdated'));
                                }
                                toast.success('User added to department');
                                setShowAddUserForm(false);
                                setIsCreateDialogOpen(false);
                                setFormData({ name: '', email: '', password: '', role: 'Employee', status: 'Active', department: '', selectedGroupId: null, permissions: formData.permissions });
                              }}>Create & Add</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* static create section removed — creation moved to dialog in header */}
    </div>
  );
};

const Departments = () => {
  return (
    <DashboardLayout>
      <DepartmentsPanel />
    </DashboardLayout>
  );
};

export default Departments;
