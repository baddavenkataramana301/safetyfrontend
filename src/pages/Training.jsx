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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  User,
  Calendar,
  FileText,
  Play,
  BookOpen,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { dummyTrainings } from "@/data";
import { createTrainingNotification } from "@/lib/notificationUtils";

const Training = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState(() => {
    const savedTrainings = localStorage.getItem("trainings");
    return savedTrainings ? JSON.parse(savedTrainings) : dummyTrainings;
  });

  // Load trainings from localStorage on component mount and listen for changes
  useEffect(() => {
    const loadTrainings = () => {
      const savedTrainings = localStorage.getItem("trainings");
      setTrainings(
        savedTrainings ? JSON.parse(savedTrainings) : dummyTrainings
      );
    };

    loadTrainings();

    // Listen for storage changes to update trainings in real-time across tabs
    const handleStorageChange = (e) => {
      if (e.key === "trainings") {
        loadTrainings();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    duration: "",
    status: "Available",
    assignedTo: "",
    dueDate: "",
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingTraining, setViewingTraining] = useState(null);

  // Check if user has admin privileges (admin, supervisor, safety_manager)
  const isAdmin = ["admin", "supervisor", "safety_manager"].includes(
    user?.role
  );

  // Filter trainings based on search term
  const filteredTrainings = trainings.filter(
    (training) =>
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission for creating new training
  const handleCreateTraining = () => {
    if (!formData.title || !formData.type || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTraining = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      completedBy: [],
    };

    const updatedTrainings = [...trainings, newTraining];
    setTrainings(updatedTrainings);
    localStorage.setItem("trainings", JSON.stringify(updatedTrainings));

    // Create notification for all users
    createTrainingNotification("create", newTraining);

    setFormData({
      title: "",
      type: "",
      description: "",
      duration: "",
      status: "Available",
      assignedTo: "",
      dueDate: "",
    });
    setIsCreateDialogOpen(false);
    toast.success("Training created successfully");
  };

  // Handle form submission for editing training
  const handleEditTraining = () => {
    if (!formData.title || !formData.type || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedTrainings = trainings.map((training) =>
      training.id === editingTraining.id
        ? { ...training, ...formData }
        : training
    );
    setTrainings(updatedTrainings);
    localStorage.setItem("trainings", JSON.stringify(updatedTrainings));

    // Create notification for all users
    const updatedTraining = updatedTrainings.find(
      (t) => t.id === editingTraining.id
    );
    createTrainingNotification("update", updatedTraining);

    setIsEditDialogOpen(false);
    setEditingTraining(null);
    setFormData({
      title: "",
      type: "",
      description: "",
      duration: "",
      status: "Available",
      assignedTo: "",
      dueDate: "",
    });
    toast.success("Training updated successfully");
  };

  // Handle deleting training
  const handleDeleteTraining = (id) => {
    const trainingToDelete = trainings.find((t) => t.id === id);
    const updatedTrainings = trainings.filter((training) => training.id !== id);
    setTrainings(updatedTrainings);
    localStorage.setItem("trainings", JSON.stringify(updatedTrainings));

    // Create notification for all users
    createTrainingNotification("delete", trainingToDelete);

    toast.success("Training deleted successfully");
  };

  // Handle marking training as completed
  const handleCompleteTraining = (id) => {
    const updatedTrainings = trainings.map((training) =>
      training.id === id
        ? {
            ...training,
            status: "Completed",
            completedBy: [...training.completedBy, user?.name || "Unknown"],
          }
        : training
    );
    setTrainings(updatedTrainings);
    localStorage.setItem("trainings", JSON.stringify(updatedTrainings));

    // Create notification for all users
    const completedTraining = updatedTrainings.find((t) => t.id === id);
    createTrainingNotification("complete", completedTraining);

    toast.success("Training marked as completed");
  };

  // Open edit dialog with training data
  const openEditDialog = (training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title,
      type: training.type,
      description: training.description,
      duration: training.duration,
      status: training.status,
      assignedTo: training.assignedTo,
      dueDate: training.dueDate,
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (training) => {
    setViewingTraining(training);
    setIsViewDialogOpen(true);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Available":
        return "default";
      case "In Progress":
        return "secondary";
      case "Completed":
        return "outline";
      case "Overdue":
        return "destructive";
      default:
        return "default";
    }
  };

  // Get training type icon
  const getTrainingTypeIcon = (type) => {
    switch (type) {
      case "Safety":
        return <Award className="h-4 w-4" />;
      case "Technical":
        return <BookOpen className="h-4 w-4" />;
      case "Compliance":
        return <FileText className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Training Management
            </h1>
            <p className="text-muted-foreground">
              Manage and track employee training programs
            </p>
          </div>
          {isAdmin && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Training
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Training</DialogTitle>
                  <DialogDescription>
                    Add a new training program for employees.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="Enter training title"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select training type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Compliance">Compliance</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter training description"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignedTo" className="text-right">
                      Assigned To
                    </Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) =>
                        setFormData({ ...formData, assignedTo: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="e.g., All Employees"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTraining}>
                    Create Training
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Training Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrainings.map((training) => (
            <Card key={training.id} className="relative h-full w-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTrainingTypeIcon(training.type)}
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                  </div>
                  <Badge variant={getStatusBadgeVariant(training.status)}>
                    {training.status}
                  </Badge>
                </div>
                <CardDescription>{training.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm text-muted-foreground h-full">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{training.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{training.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {training.dueDate}</span>
                  </div>
                  {training.completedBy.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Completed by: {training.completedBy.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewDialog(training)}
                    className="w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(training)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Training
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this training?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteTraining(training.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {training.status !== "Completed" && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTraining(training.id)}
                        className="flex-1"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Training</DialogTitle>
              <DialogDescription>
                Update the training program details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Enter training title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select training type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description *
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Enter training description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-assignedTo" className="text-right">
                  Assigned To
                </Label>
                <Input
                  id="edit-assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., All Employees"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditTraining}>Update Training</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{viewingTraining?.title}</DialogTitle>
              <DialogDescription>Training program details</DialogDescription>
            </DialogHeader>
            {viewingTraining && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.type}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.duration}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge
                      variant={getStatusBadgeVariant(viewingTraining.status)}
                    >
                      {viewingTraining.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.dueDate}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingTraining.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingTraining.assignedTo}
                  </p>
                </div>
                {viewingTraining.completedBy.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Completed By</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.completedBy.join(", ")}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingTraining.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Training;
