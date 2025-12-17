import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dummyCourses } from "@/data";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import CourseList from "@/components/training/CourseList";
import CoursePlayer from "@/components/training/CoursePlayer";
import CourseCreator from "@/components/training/CourseCreator";
import { toast } from "sonner";
import { normalizeRole } from "@/lib/utils";

const Training = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list', 'player', 'create'
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Normalize role for permissions
  const userRole = normalizeRole(user?.role);
  const isAdmin = userRole === "admin" || userRole === "safety_manager";

  useEffect(() => {
    // Load courses from localStorage or use dummy data
    const storedCourses = localStorage.getItem("courses");
    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    } else {
      setCourses(dummyCourses);
      localStorage.setItem("courses", JSON.stringify(dummyCourses));
    }
  }, []);

  const handleSaveCourse = (newCourse) => {
    let updatedCourses;
    if (newCourse.id) {
        // Edit existing (logic depends on if ID exists, assuming creation generates ID)
        const exists = courses.some(c => c.id === newCourse.id);
        if (exists) {
            updatedCourses = courses.map(c => c.id === newCourse.id ? newCourse : c);
        } else {
             updatedCourses = [...courses, newCourse];
        }
    } else {
        // Create new
        const courseWithId = { ...newCourse, id: Date.now(), createdAt: new Date().toISOString() };
        updatedCourses = [...courses, courseWithId];
    }

    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    toast.success("Course saved successfully!");
    setViewMode("list");
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setViewMode("player");
  };

  const handleCourseComplete = (courseId) => {
     // Trigger update if needed
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Training Center</h1>
        {viewMode === "list" && (
           <p className="text-muted-foreground">
             Access training modules, track your progress, and earn certificates.
           </p>
        )}
      </div>

      {viewMode === "list" && (
        <CourseList 
          courses={courses} 
          onSelectCourse={handleSelectCourse} 
          onCreateCourse={() => setViewMode("create")}
          isAdmin={isAdmin}
        />
      )}

      {viewMode === "player" && selectedCourse && (
        <CoursePlayer 
          course={selectedCourse} 
          user={user} 
          onBack={() => setViewMode("list")}
          onComplete={handleCourseComplete}
        />
      )}

      {viewMode === "create" && (
        <CourseCreator 
          onSave={handleSaveCourse} 
          onCancel={() => setViewMode("list")} 
        />
      )}
    </DashboardLayout>
  );
};

export default Training;
