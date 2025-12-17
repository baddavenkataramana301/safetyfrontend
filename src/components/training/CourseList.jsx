import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, PlayCircle, Clock, Award, Star } from "lucide-react";

const CourseList = ({ courses, onSelectCourse, onCreateCourse, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(courses.map(c => c.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isAdmin && (
          <Button onClick={onCreateCourse}>Create New Course</Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map(course => (
          <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectCourse(course)}>
            <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-muted">
               <img 
                 src={course.thumbnail} 
                 alt={course.title} 
                 className="h-full w-full object-cover transition-transform hover:scale-105"
                 onError={(e) => e.target.style.display = 'none'}
               />
               <div className="absolute top-2 right-2">
                 <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/70">
                    {course.level}
                 </Badge>
               </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-2">{course.category}</Badge>
                <div className="flex items-center text-yellow-500 text-xs font-bold">
                   <Star className="w-3 h-3 mr-1 fill-current" />
                   {course.rating || "New"}
                </div>
              </div>
              <CardTitle className="line-clamp-2 text-xl">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
               <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                     <Clock className="w-4 h-4 mr-1" />
                     {course.duration}
                  </div>
                  <div className="flex items-center">
                     <PlayCircle className="w-4 h-4 mr-1" />
                     {course.modules?.length || 0} Modules
                  </div>
               </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between items-center">
               <div className="flex items-center text-green-600 font-semibold text-sm">
                  <Award className="w-4 h-4 mr-1" />
                  {course.points} Pts
               </div>
               <Button size="sm">Start Learning</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No courses found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default CourseList;
