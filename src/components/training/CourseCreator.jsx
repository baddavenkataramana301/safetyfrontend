import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Trash, GripVertical, Save, X } from "lucide-react";
import { toast } from "sonner";

const CourseCreator = ({ onSave, onCancel, initialData }) => {
  const [course, setCourse] = useState(initialData || {
    title: "",
    category: "Safety",
    description: "",
    level: "Beginner",
    duration: "1 hour",
    points: 50,
    thumbnail: "",
    modules: [],
    quizId: null
  });

  const handleCourseChange = (field, value) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };

  const addModule = () => {
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, { id: Date.now(), title: "", lessons: [] }]
    }));
  };

  const removeModule = (index) => {
    setCourse(prev => {
        const newModules = [...prev.modules];
        newModules.splice(index, 1);
        return { ...prev, modules: newModules };
    });
  };

  const updateModule = (index, field, value) => {
    setCourse(prev => {
        const newModules = [...prev.modules];
        newModules[index] = { ...newModules[index], [field]: value };
        return { ...prev, modules: newModules };
    });
  };

  const addLesson = (moduleIndex) => {
    setCourse(prev => {
        const newModules = [...prev.modules];
        newModules[moduleIndex].lessons.push({
            id: Date.now(),
            title: "",
            type: "video",
            content: "",
            duration: "5 min"
        });
        return { ...prev, modules: newModules };
    });
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    setCourse(prev => {
        const newModules = [...prev.modules];
        newModules[moduleIndex].lessons.splice(lessonIndex, 1);
        return { ...prev, modules: newModules };
    });
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    setCourse(prev => {
        const newModules = [...prev.modules];
        newModules[moduleIndex].lessons[lessonIndex] = { 
            ...newModules[moduleIndex].lessons[lessonIndex], 
            [field]: value 
        };
        return { ...prev, modules: newModules };
    });
  };

  const handleSave = () => {
      if (!course.title || !course.description) {
          toast.error("Please fill in basic course details.");
          return;
      }
      if (course.modules.length === 0) {
          toast.error("Please add at least one module.");
          return;
      }
      onSave(course);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{initialData ? "Edit Course" : "Create New Course"}</h1>
        <div className="space-x-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save Course</Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={course.title} onChange={e => handleCourseChange("title", e.target.value)} placeholder="e.g. Fire Safety 101" />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={course.category} onValueChange={v => handleCourseChange("category", v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Safety">Safety</SelectItem>
                                <SelectItem value="Compliance">Compliance</SelectItem>
                                <SelectItem value="Technical">Technical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={course.description} onChange={e => handleCourseChange("description", e.target.value)} placeholder="Course description..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Level</Label>
                        <Select value={course.level} onValueChange={v => handleCourseChange("level", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input value={course.duration} onChange={e => handleCourseChange("duration", e.target.value)} placeholder="e.g. 2 hours" />
                    </div>
                    <div className="space-y-2">
                        <Label>Points Reward</Label>
                        <Input type="number" value={course.points} onChange={e => handleCourseChange("points", parseInt(e.target.value))} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Thumbnail URL</Label>
                    <Input value={course.thumbnail} onChange={e => handleCourseChange("thumbnail", e.target.value)} placeholder="https://..." />
                </div>
            </CardContent>
        </Card>

        {/* Modules Builder */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Course Modules</h2>
                <Button onClick={addModule} variant="secondary" size="sm"><Plus className="h-4 w-4 mr-2" /> Add Module</Button>
            </div>
            
            {course.modules.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    No modules added. Click "Add Module" to start adding content.
                </div>
            )}

            {course.modules.map((module, mIdx) => (
                <Card key={module.id} className="relative">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700" 
                        onClick={() => removeModule(mIdx)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                    <CardHeader className="pb-2">
                         <div className="flex items-center gap-2">
                             <div className="font-mono text-sm text-muted-foreground">Module {mIdx + 1}</div>
                             <Input 
                                className="font-semibold text-lg" 
                                value={module.title} 
                                onChange={e => updateModule(mIdx, "title", e.target.value)} 
                                placeholder="Module Title" 
                             />
                         </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                             {module.lessons.map((lesson, lIdx) => (
                                 <div key={lesson.id} className="flex gap-4 items-start bg-muted/30 p-3 rounded-md">
                                     <div className="mt-2 text-muted-foreground font-mono text-xs">{lIdx + 1}</div>
                                     <div className="grid gap-2 flex-1">
                                         <Input 
                                             value={lesson.title} 
                                             onChange={e => updateLesson(mIdx, lIdx, "title", e.target.value)} 
                                             placeholder="Lesson Title" 
                                             className="h-8"
                                         />
                                         <div className="flex gap-2">
                                             <Select value={lesson.type} onValueChange={v => updateLesson(mIdx, lIdx, "type", v)}>
                                                 <SelectTrigger className="h-8 w-32">
                                                     <SelectValue />
                                                 </SelectTrigger>
                                                 <SelectContent>
                                                     <SelectItem value="video">Video</SelectItem>
                                                     <SelectItem value="article">Article</SelectItem>
                                                     <SelectItem value="pdf">PDF</SelectItem>
                                                 </SelectContent>
                                             </Select>
                                             <Input 
                                                 value={lesson.content} 
                                                 onChange={e => updateLesson(mIdx, lIdx, "content", e.target.value)} 
                                                 placeholder={lesson.type === 'article' ? "Article content..." : "URL..."} 
                                                 className="h-8 flex-1"
                                             />
                                             <Input 
                                                 value={lesson.duration} 
                                                 onChange={e => updateLesson(mIdx, lIdx, "duration", e.target.value)} 
                                                 placeholder="Duration" 
                                                 className="h-8 w-24"
                                             />
                                         </div>
                                     </div>
                                     <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeLesson(mIdx, lIdx)}>
                                         <X className="h-4 w-4" />
                                     </Button>
                                 </div>
                             ))}
                             <Button variant="outline" size="sm" onClick={() => addLesson(mIdx)} className="w-full border-dashed">
                                 <Plus className="h-3 w-3 mr-2" /> Add Lesson
                             </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCreator;
