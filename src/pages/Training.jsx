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
  Upload,
  Link,
  FileVideo,
  File,
  HelpCircle,
  Trophy,
  RefreshCw,
  FileCheck,
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
    category: "",
    type: "",
    format: "",
    description: "",
    duration: "",
    status: "Available",
    assignedTo: "",
    dueDate: "",
    points: "",
    passingScore: "",
    videoUrl: "",
    videoFile: null,
    pdfFile: null,
    certificateTemplate: null,
    recurringTraining: "",
    isRecurring: false,
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
      (training.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (training.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle file uploads
  const handleFileChange = (field, file) => {
    if (file) {
      // In a real app, you would upload to a server
      // For now, we'll store the file name and create a preview URL
      const fileUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        [field]: { file, url: fileUrl, name: file.name },
      });
    }
  };

  // Handle form submission for creating new training
  const handleCreateTraining = () => {
    if (!formData.title || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate format-specific fields
    if (
      formData.format === "Video" &&
      !formData.videoUrl &&
      !formData.videoFile
    ) {
      toast.error("Please provide either a video URL or upload a video file");
      return;
    }
    if (formData.format === "PDF" && !formData.pdfFile) {
      toast.error("Please upload a PDF file");
      return;
    }
    if (formData.format === "Quiz" && !formData.passingScore) {
      toast.error("Please provide a passing score for quiz-based training");
      return;
    }

    const newTraining = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      type: formData.type || formData.category, // Keep type for backward compatibility
      format: formData.format,
      description: formData.description,
      duration: formData.duration,
      status: formData.status,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      points: formData.points ? parseInt(formData.points) : 0,
      passingScore: formData.passingScore
        ? parseInt(formData.passingScore)
        : null,
      videoUrl: formData.videoUrl || null,
      videoFile: formData.videoFile ? formData.videoFile.name : null,
      pdfFile: formData.pdfFile ? formData.pdfFile.name : null,
      certificateTemplate: formData.certificateTemplate
        ? formData.certificateTemplate.name
        : null,
      recurringTraining: formData.isRecurring
        ? formData.recurringTraining
        : null,
      isRecurring: formData.isRecurring,
      createdAt: new Date().toISOString(),
      completedBy: [],
    };

    const updatedTrainings = [...trainings, newTraining];
    setTrainings(updatedTrainings);
    localStorage.setItem("trainings", JSON.stringify(updatedTrainings));

    // Create notification for all users
    createTrainingNotification("create", newTraining);

    // Reset form
    setFormData({
      title: "",
      category: "",
      type: "",
      format: "",
      description: "",
      duration: "",
      status: "Available",
      assignedTo: "",
      dueDate: "",
      points: "",
      passingScore: "",
      videoUrl: "",
      videoFile: null,
      pdfFile: null,
      certificateTemplate: null,
      recurringTraining: "",
      isRecurring: false,
    });
    setIsCreateDialogOpen(false);
    toast.success("Training created successfully");
  };

  // Handle form submission for editing training
  const handleEditTraining = () => {
    if (!formData.title || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate format-specific fields
    if (
      formData.format === "Video" &&
      !formData.videoUrl &&
      !formData.videoFile
    ) {
      toast.error("Please provide either a video URL or upload a video file");
      return;
    }
    if (formData.format === "PDF" && !formData.pdfFile) {
      toast.error("Please upload a PDF file");
      return;
    }
    if (formData.format === "Quiz" && !formData.passingScore) {
      toast.error("Please provide a passing score for quiz-based training");
      return;
    }

    const updatedTrainings = trainings.map((training) =>
      training.id === editingTraining.id
        ? {
            ...training,
            title: formData.title,
            category: formData.category,
            type: formData.type || formData.category,
            format: formData.format,
            description: formData.description,
            duration: formData.duration,
            status: formData.status,
            assignedTo: formData.assignedTo,
            dueDate: formData.dueDate,
            points: formData.points
              ? parseInt(formData.points)
              : training.points || 0,
            passingScore: formData.passingScore
              ? parseInt(formData.passingScore)
              : training.passingScore || null,
            videoUrl: formData.videoUrl || training.videoUrl || null,
            videoFile: formData.videoFile
              ? formData.videoFile.name
              : training.videoFile || null,
            pdfFile: formData.pdfFile
              ? formData.pdfFile.name
              : training.pdfFile || null,
            certificateTemplate: formData.certificateTemplate
              ? formData.certificateTemplate.name
              : training.certificateTemplate || null,
            recurringTraining: formData.isRecurring
              ? formData.recurringTraining
              : training.recurringTraining || null,
            isRecurring: formData.isRecurring,
          }
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
      category: "",
      type: "",
      format: "",
      description: "",
      duration: "",
      status: "Available",
      assignedTo: "",
      dueDate: "",
      points: "",
      passingScore: "",
      videoUrl: "",
      videoFile: null,
      pdfFile: null,
      certificateTemplate: null,
      recurringTraining: "",
      isRecurring: false,
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
      title: training.title || "",
      category: training.category || training.type || "",
      type: training.type || "",
      format: training.format || "",
      description: training.description || "",
      duration: training.duration || "",
      status: training.status || "Available",
      assignedTo: training.assignedTo || "",
      dueDate: training.dueDate || "",
      points: training.points?.toString() || "",
      passingScore: training.passingScore?.toString() || "",
      videoUrl: training.videoUrl || "",
      videoFile: training.videoFile ? { name: training.videoFile } : null,
      pdfFile: training.pdfFile ? { name: training.pdfFile } : null,
      certificateTemplate: training.certificateTemplate
        ? { name: training.certificateTemplate }
        : null,
      recurringTraining: training.recurringTraining || "",
      isRecurring: training.isRecurring || false,
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
      case "HR":
        return <User className="h-4 w-4" />;
      case "Quality":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  // Training category descriptions
  const categoryDescriptions = {
    Safety:
      "Covers workplace hazards, PPE usage, emergency procedures, and incident prevention.",
    HR: "Focuses on company policies, ethics, onboarding, behavior guidelines, and communication.",
    Quality:
      "Ensures process compliance, product handling, SOP training, and operational excellence.",
    Compliance:
      "Mandated by legal or industry standards—includes audits, certifications, and regulatory requirements.",
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
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Training</DialogTitle>
                  <DialogDescription>
                    Add a new training program for employees with comprehensive
                    details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      Title *
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter training title"
                    />
                  </div>

                  {/* Training Category */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="flex items-center gap-2"
                    >
                      Training Category *
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          category: value,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the category that best describes the training program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Safety">
                          <div className="flex flex-col">
                            <span>Safety</span>
                            <span className="text-xs text-muted-foreground">
                              {categoryDescriptions.Safety}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HR">
                          <div className="flex flex-col">
                            <span>HR</span>
                            <span className="text-xs text-muted-foreground">
                              {categoryDescriptions.HR}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Quality">
                          <div className="flex flex-col">
                            <span>Quality</span>
                            <span className="text-xs text-muted-foreground">
                              {categoryDescriptions.Quality}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Compliance">
                          <div className="flex flex-col">
                            <span>Compliance</span>
                            <span className="text-xs text-muted-foreground">
                              {categoryDescriptions.Compliance}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.category && (
                      <p className="text-xs text-muted-foreground">
                        {categoryDescriptions[formData.category]}
                      </p>
                    )}
                  </div>

                  {/* Training Format */}
                  <div className="space-y-2">
                    <Label htmlFor="format" className="flex items-center gap-2">
                      Training Format *
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Select
                      value={formData.format}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          format: value,
                          passingScore:
                            value !== "Quiz" ? "" : formData.passingScore,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select training format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="flex items-center gap-2"
                    >
                      Description *
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
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
                      placeholder="Enter training description"
                      rows={3}
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="e.g., 2 hours"
                    />
                  </div>

                  {/* Points for Rewards System */}
                  <div className="space-y-2">
                    <Label htmlFor="points" className="flex items-center gap-2">
                      Points (For Rewards System)
                      <Trophy className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      min="0"
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({ ...formData, points: e.target.value })
                      }
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Points awarded to employees upon completion
                    </p>
                  </div>

                  {/* Passing Score (Only for Quiz) */}
                  {formData.format === "Quiz" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="passingScore"
                        className="flex items-center gap-2"
                      >
                        Passing Score *
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.passingScore}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passingScore: e.target.value,
                          })
                        }
                        placeholder="e.g., 70 (percentage)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum score required to pass (0-100%)
                      </p>
                    </div>
                  )}

                  {/* Upload Training Material - Video */}
                  {formData.format === "Video" && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Upload Training Material *
                        <FileVideo className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="videoUrl" className="text-sm">
                            Video URL (Optional)
                          </Label>
                          <div className="flex gap-2">
                            <Link className="h-4 w-4 mt-2 text-muted-foreground" />
                            <Input
                              id="videoUrl"
                              type="url"
                              value={formData.videoUrl}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  videoUrl: e.target.value,
                                })
                              }
                              placeholder="https://example.com/video.mp4"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="videoFile" className="text-sm">
                            Or Upload Video File
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="videoFile"
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                handleFileChange("videoFile", e.target.files[0])
                              }
                              className="flex-1"
                            />
                            {formData.videoFile && (
                              <span className="text-xs text-muted-foreground">
                                {formData.videoFile.name || formData.videoFile}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Training Material - PDF */}
                  {formData.format === "PDF" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="pdfFile"
                        className="flex items-center gap-2"
                      >
                        Upload PDF Training Material *
                        <File className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="pdfFile"
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            handleFileChange("pdfFile", e.target.files[0])
                          }
                          className="flex-1"
                        />
                        {formData.pdfFile && (
                          <span className="text-xs text-muted-foreground">
                            {formData.pdfFile.name || formData.pdfFile}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Certificate Template */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="certificateTemplate"
                      className="flex items-center gap-2"
                    >
                      Certificate Template
                      <FileCheck className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="certificateTemplate"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) =>
                          handleFileChange(
                            "certificateTemplate",
                            e.target.files[0]
                          )
                        }
                        className="flex-1"
                      />
                      {formData.certificateTemplate && (
                        <span className="text-xs text-muted-foreground">
                          {formData.certificateTemplate.name ||
                            formData.certificateTemplate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a certificate layout (PDF, PNG, or JPG) that will
                      be automatically filled with employee details after
                      completion
                    </p>
                  </div>

                  {/* Recurring Training */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={formData.isRecurring}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isRecurring: e.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor="isRecurring"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        Enable Recurring Training
                        <RefreshCw className="h-3 w-3 text-muted-foreground" />
                      </Label>
                    </div>
                    {formData.isRecurring && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="recurringTraining">
                          Recurrence Frequency *
                        </Label>
                        <Select
                          value={formData.recurringTraining}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              recurringTraining: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6_months">
                              <div className="flex flex-col">
                                <span>Every 6 Months</span>
                                <span className="text-xs text-muted-foreground">
                                  Training will reassign to employees twice a
                                  year
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="1_year">
                              <div className="flex flex-col">
                                <span>Every Year</span>
                                <span className="text-xs text-muted-foreground">
                                  Training will automatically repeat once every
                                  12 months
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          System creates a new assignment when the recurrence
                          date arrives. Employees get notifications and
                          supervisors can track recurring completion.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) =>
                        setFormData({ ...formData, assignedTo: e.target.value })
                      }
                      placeholder="e.g., All Employees"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
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
                    {getTrainingTypeIcon(training.category || training.type)}
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusBadgeVariant(training.status)}>
                      {training.status}
                    </Badge>
                    {training.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{training.description}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {training.category || training.type || "General"}
                  </Badge>
                  {training.format && (
                    <Badge variant="outline" className="text-xs">
                      {training.format}
                    </Badge>
                  )}
                  {training.points > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      <Trophy className="h-3 w-3" />
                      {training.points} pts
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm text-muted-foreground h-full">
                  {training.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{training.duration}</span>
                    </div>
                  )}
                  {training.assignedTo && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{training.assignedTo}</span>
                    </div>
                  )}
                  {training.dueDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {training.dueDate}</span>
                    </div>
                  )}
                  {training.passingScore && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Passing Score: {training.passingScore}%</span>
                    </div>
                  )}
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
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Training</DialogTitle>
              <DialogDescription>
                Update the training program details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="flex items-center gap-2">
                  Title *
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter training title"
                />
              </div>

              {/* Training Category */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-category"
                  className="flex items-center gap-2"
                >
                  Training Category *
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the category that best describes the training program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Safety">
                      <div className="flex flex-col">
                        <span>Safety</span>
                        <span className="text-xs text-muted-foreground">
                          {categoryDescriptions.Safety}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="HR">
                      <div className="flex flex-col">
                        <span>HR</span>
                        <span className="text-xs text-muted-foreground">
                          {categoryDescriptions.HR}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Quality">
                      <div className="flex flex-col">
                        <span>Quality</span>
                        <span className="text-xs text-muted-foreground">
                          {categoryDescriptions.Quality}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Compliance">
                      <div className="flex flex-col">
                        <span>Compliance</span>
                        <span className="text-xs text-muted-foreground">
                          {categoryDescriptions.Compliance}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.category && (
                  <p className="text-xs text-muted-foreground">
                    {categoryDescriptions[formData.category]}
                  </p>
                )}
              </div>

              {/* Training Format */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-format"
                  className="flex items-center gap-2"
                >
                  Training Format *
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      format: value,
                      passingScore:
                        value !== "Quiz" ? "" : formData.passingScore,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="flex items-center gap-2"
                >
                  Description *
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter training description"
                  rows={3}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 2 hours"
                />
              </div>

              {/* Points for Rewards System */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-points"
                  className="flex items-center gap-2"
                >
                  Points (For Rewards System)
                  <Trophy className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="0"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({ ...formData, points: e.target.value })
                  }
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-muted-foreground">
                  Points awarded to employees upon completion
                </p>
              </div>

              {/* Passing Score (Only for Quiz) */}
              {formData.format === "Quiz" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-passingScore"
                    className="flex items-center gap-2"
                  >
                    Passing Score *
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    id="edit-passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScore: e.target.value })
                    }
                    placeholder="e.g., 70 (percentage)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum score required to pass (0-100%)
                  </p>
                </div>
              )}

              {/* Upload Training Material - Video */}
              {formData.format === "Video" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Upload Training Material *
                    <FileVideo className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-videoUrl" className="text-sm">
                        Video URL (Optional)
                      </Label>
                      <div className="flex gap-2">
                        <Link className="h-4 w-4 mt-2 text-muted-foreground" />
                        <Input
                          id="edit-videoUrl"
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              videoUrl: e.target.value,
                            })
                          }
                          placeholder="https://example.com/video.mp4"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-videoFile" className="text-sm">
                        Or Upload Video File
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="edit-videoFile"
                          type="file"
                          accept="video/*"
                          onChange={(e) =>
                            handleFileChange("videoFile", e.target.files[0])
                          }
                          className="flex-1"
                        />
                        {formData.videoFile && (
                          <span className="text-xs text-muted-foreground">
                            {formData.videoFile.name || formData.videoFile}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Training Material - PDF */}
              {formData.format === "PDF" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-pdfFile"
                    className="flex items-center gap-2"
                  >
                    Upload PDF Training Material *
                    <File className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-pdfFile"
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        handleFileChange("pdfFile", e.target.files[0])
                      }
                      className="flex-1"
                    />
                    {formData.pdfFile && (
                      <span className="text-xs text-muted-foreground">
                        {formData.pdfFile.name || formData.pdfFile}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Certificate Template */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-certificateTemplate"
                  className="flex items-center gap-2"
                >
                  Certificate Template
                  <FileCheck className="h-3 w-3 text-muted-foreground" />
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-certificateTemplate"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) =>
                      handleFileChange("certificateTemplate", e.target.files[0])
                    }
                    className="flex-1"
                  />
                  {formData.certificateTemplate && (
                    <span className="text-xs text-muted-foreground">
                      {formData.certificateTemplate.name ||
                        formData.certificateTemplate}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a certificate layout (PDF, PNG, or JPG) that will be
                  automatically filled with employee details after completion
                </p>
              </div>

              {/* Recurring Training */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isRecurring: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor="edit-isRecurring"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    Enable Recurring Training
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  </Label>
                </div>
                {formData.isRecurring && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="edit-recurringTraining">
                      Recurrence Frequency *
                    </Label>
                    <Select
                      value={formData.recurringTraining}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recurringTraining: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6_months">
                          <div className="flex flex-col">
                            <span>Every 6 Months</span>
                            <span className="text-xs text-muted-foreground">
                              Training will reassign to employees twice a year
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="1_year">
                          <div className="flex flex-col">
                            <span>Every Year</span>
                            <span className="text-xs text-muted-foreground">
                              Training will automatically repeat once every 12
                              months
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      System creates a new assignment when the recurrence date
                      arrives. Employees get notifications and supervisors can
                      track recurring completion.
                    </p>
                  </div>
                )}
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label htmlFor="edit-assignedTo">Assigned To</Label>
                <Input
                  id="edit-assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  placeholder="e.g., All Employees"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>

              {/* Status */}
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
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t">
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
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingTraining?.title}</DialogTitle>
              <DialogDescription>Training program details</DialogDescription>
            </DialogHeader>
            {viewingTraining && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.category ||
                        viewingTraining.type ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Format</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.format || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.duration || "N/A"}
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
                  {viewingTraining.points && (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Points <Trophy className="h-3 w-3" />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {viewingTraining.points} points
                      </p>
                    </div>
                  )}
                  {viewingTraining.passingScore && (
                    <div>
                      <Label className="text-sm font-medium">
                        Passing Score
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {viewingTraining.passingScore}%
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.dueDate || "N/A"}
                    </p>
                  </div>
                  {viewingTraining.isRecurring && (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Recurring <RefreshCw className="h-3 w-3" />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {viewingTraining.recurringTraining === "6_months"
                          ? "Every 6 Months"
                          : viewingTraining.recurringTraining === "1_year"
                          ? "Every Year"
                          : viewingTraining.recurringTraining || "N/A"}
                      </p>
                    </div>
                  )}
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
                    {viewingTraining.assignedTo || "N/A"}
                  </p>
                </div>
                {viewingTraining.videoUrl && (
                  <div>
                    <Label className="text-sm font-medium">Video URL</Label>
                    <a
                      href={viewingTraining.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Link className="h-3 w-3" />
                      {viewingTraining.videoUrl}
                    </a>
                  </div>
                )}
                {(viewingTraining.videoFile || viewingTraining.pdfFile) && (
                  <div>
                    <Label className="text-sm font-medium">
                      Training Material
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.videoFile || viewingTraining.pdfFile}
                    </p>
                  </div>
                )}
                {viewingTraining.certificateTemplate && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Certificate Template <FileCheck className="h-3 w-3" />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTraining.certificateTemplate}
                    </p>
                  </div>
                )}
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
