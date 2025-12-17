import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, PlayCircle, FileText, ChevronLeft, ChevronRight, Lock, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import CertificateGenerator from "@/components/CertificateGenerator";
import { addPoints } from "@/lib/pointUtils";
import { dummyQuizzes } from "@/data"; 

const CoursePlayer = ({ course, user, onBack, onComplete }) => {
  // State for progress
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [courseCompleted, setCourseCompleted] = useState(false);
  
  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);

  const modules = course.modules || [];
  const currentModule = modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];
  
  // Calculate Progress
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercentage = (completedLessons.size / totalLessons) * 100;

  useEffect(() => {
     // Check if user already completed this course (simulated)
     if (course.status === "Completed") {
        setCourseCompleted(true);
        setQuizPassed(true);
     }
  }, [course]);

  const handleNext = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setCurrentLessonIndex(0);
    } else {
      // End of content
      if (course.quizId) {
        setShowQuiz(true);
      } else {
        completeCourse();
      }
    }
  };

  const handleMarkComplete = () => {
    const lessonId = currentLesson.id;
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lessonId);
    setCompletedLessons(newCompleted);
    toast.success("Lesson marked as completed");
    handleNext();
  };

  const completeCourse = () => {
    if (!courseCompleted) {
        setCourseCompleted(true);
        setQuizPassed(true);
        // Award points
        addPoints(user.id, "Course Completion", course.points, user.role);
        toast.success(`Course Completed! You have earned ${course.points} points.`);
        if (onComplete) onComplete(course.id);
    }
  };

  const handleQuizSubmit = (score, passed) => {
      setQuizScore(score);
      if (passed) {
          setQuizPassed(true);
          completeCourse();
      } else {
          toast.error("You didn't pass the quiz. Please try again.");
      }
  };

  if (showQuiz && !quizPassed) {
      const quiz = dummyQuizzes.find(q => q.id === course.quizId);
      return (
          <QuizView quiz={quiz} onSubmit={handleQuizSubmit} onCancel={() => setShowQuiz(false)} />
      );
  }

  if (courseCompleted && quizPassed) {
      return (
          <div className="max-w-3xl mx-auto py-8 space-y-8 text-center">
              <Card className="p-8">
                  <div className="flex justify-center mb-6">
                      <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Trophy className="h-12 w-12 text-yellow-600" />
                      </div>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Congratulations, {user.name}!</h1>
                  <p className="text-muted-foreground text-lg mb-8">
                      You have successfully completed the course <strong>{course.title}</strong> and earned <strong>{course.points} Points</strong>.
                  </p>
                  
                  <div className="flex justify-center mb-8">
                      <CertificateGenerator user={user} course={course} date={new Date()} />
                  </div>
                  
                  <Button onClick={onBack} variant="outline">Back to Courses</Button>
              </Card>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:flex-row gap-6">
      {/* Sidebar - Course Content */}
      <div className="w-full md:w-80 flex-shrink-0 border rounded-lg bg-card overflow-hidden flex flex-col">
         <div className="p-4 border-b bg-muted/50">
            <h3 className="font-semibold truncate" title={course.title}>{course.title}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
               <Progress value={progressPercentage} className="h-2" />
               <span>{Math.round(progressPercentage)}%</span>
            </div>
         </div>
         <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
               {modules.map((module, mIdx) => (
                 <div key={module.id}>
                    <h4 className="font-medium text-sm mb-2 text-muted-foreground uppercase tracking-wider">Module {mIdx + 1}: {module.title}</h4>
                    <div className="space-y-1">
                       {module.lessons.map((lesson, lIdx) => {
                          const isCompleted = completedLessons.has(lesson.id);
                          const isActive = mIdx === currentModuleIndex && lIdx === currentLessonIndex;
                          const isLocked = !isCompleted && !isActive && (mIdx > currentModuleIndex || (mIdx === currentModuleIndex && lIdx > currentLessonIndex));

                          return (
                            <button
                              key={lesson.id}
                              disabled={isLocked}
                              onClick={() => {
                                setCurrentModuleIndex(mIdx);
                                setCurrentLessonIndex(lIdx);
                              }}
                              className={`w-full flex items-center gap-3 p-2 text-sm rounded-md transition-colors text-left
                                ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"}
                                ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
                              `}
                            >
                               {isCompleted ? (
                                 <CheckCircle className="h-4 w-4 text-green-500" />
                               ) : isLocked ? (
                                 <Lock className="h-4 w-4" />
                               ) : lesson.type === 'video' ? (
                                 <PlayCircle className="h-4 w-4" />
                               ) : (
                                 <FileText className="h-4 w-4" />
                               )}
                               <span className="truncate">{lIdx + 1}. {lesson.title}</span>
                            </button>
                          );
                       })}
                    </div>
                 </div>
               ))}
            </div>
         </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         <Card className="flex-1 flex flex-col shadow-sm">
            <CardHeader className="border-b pb-4">
               <div className="flex justify-between items-center">
                   <div>
                       <CardTitle>{currentLesson?.title}</CardTitle>
                       <CardDescription>{currentModule?.title}</CardDescription>
                   </div>
                   <Button variant="ghost" onClick={onBack}>Exit Course</Button>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/10">
               {currentLesson?.type === 'video' ? (
                  <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center text-white relative group">
                      {/* Simulated Video Player */}
                      <video src={currentLesson.content} controls className="w-full h-full rounded-lg" />
                  </div>
               ) : (
                  <div className="w-full h-full min-h-[400px] border rounded-lg bg-white p-8 prose max-w-none dark:bg-gray-950 dark:prose-invert">
                     <h3>{currentLesson?.title}</h3>
                     <p>{currentLesson?.content}</p>
                     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                     {currentLesson?.content && currentLesson.content.endsWith('.pdf') && (
                        <div className="mt-8 p-4 border rounded bg-muted text-center">
                           <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                           <p>PDF Content Placeholder</p>
                           <Button variant="link">Download PDF</Button>
                        </div>
                     )}
                  </div>
               )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
               <Button 
                 variant="outline" 
                 onClick={() => {
                    if (currentLessonIndex > 0) setCurrentLessonIndex(prev => prev - 1);
                    else if (currentModuleIndex > 0) {
                        setCurrentModuleIndex(prev => prev - 1);
                        setCurrentLessonIndex(modules[currentModuleIndex - 1].lessons.length - 1);
                    }
                 }}
                 disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
               >
                 <ChevronLeft className="h-4 w-4 mr-2" /> Previous
               </Button>
               <Button onClick={handleMarkComplete}>
                 Mark Complete & Next <ChevronRight className="h-4 w-4 ml-2" />
               </Button>
            </CardFooter>
         </Card>
      </div>
    </div>
  );
};

const QuizView = ({ quiz, onSubmit, onCancel }) => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    if (!quiz) return <div>Quiz not found</div>;

    const handleOptionSelect = (qId, optionIdx) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const handleSubmit = () => {
        const unansweredCount = quiz.questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            toast.error(`Please answer all questions. ${unansweredCount} remaining.`);
            return;
        }

        let correctCount = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctOption) correctCount += q.points;
        });
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        const score = (correctCount / totalPoints) * 100;
        const passed = score >= quiz.passingScore;
        
        setSubmitted(true);
        onSubmit(score, passed);
    };

    return (
        <Card className="max-w-2xl mx-auto my-8">
            <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>Passing Score: {quiz.passingScore}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {quiz.questions.map((q, idx) => (
                    <div key={q.id} className="space-y-3">
                        <h4 className="font-medium">{idx + 1}. {q.text}</h4>
                        <div className="space-y-2">
                            {q.options.map((opt, optIdx) => (
                                <div 
                                    key={optIdx} 
                                    className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors
                                        ${answers[q.id] === optIdx ? 'border-primary bg-primary/5' : 'border-input'}
                                    `}
                                    onClick={() => handleOptionSelect(q.id, optIdx)}
                                >
                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center
                                        ${answers[q.id] === optIdx ? 'border-primary' : 'border-muted-foreground'}
                                    `}>
                                        {answers[q.id] === optIdx && <div className="h-2 w-2 rounded-full bg-primary" />}
                                    </div>
                                    <span>{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit Quiz</Button>
            </CardFooter>
        </Card>
    );
};

export default CoursePlayer;
