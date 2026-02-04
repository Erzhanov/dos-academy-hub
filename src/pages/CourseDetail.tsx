import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCourseDetail } from '@/hooks/useCourses';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  BookOpen, 
  Clock, 
  BarChart3, 
  PlayCircle, 
  CheckCircle2, 
  Circle,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { data: course, isLoading, error } = useCourseDetail(id);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Course not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/app/courses">{t.common.back}</Link>
        </Button>
      </div>
    );
  }
  
  const progress = course.lessons_count > 0 
    ? (course.completed_lessons / course.lessons_count) * 100 
    : 0;
  
  const courseStatus = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
  
  const levelLabels = {
    beginner: t.courses.beginner,
    intermediate: t.courses.intermediate,
    advanced: t.courses.advanced,
  };

  const levelColors = {
    beginner: 'text-success',
    intermediate: 'text-warning',
    advanced: 'text-destructive',
  };

  const getModuleProgress = (lessons: typeof course.modules[0]['lessons']) => {
    const completed = lessons.filter(l => l.completed).length;
    return { completed, total: lessons.length, percent: lessons.length > 0 ? (completed / lessons.length) * 100 : 0 };
  };

  const getLessonStatus = (completed: boolean, index: number, allLessons: { completed: boolean }[]): 'completed' | 'in_progress' | 'not_started' => {
    if (completed) return 'completed';
    // First incomplete lesson is "in progress"
    const completedCount = allLessons.filter(l => l.completed).length;
    if (index === completedCount) return 'in_progress';
    return 'not_started';
  };

  const getStatusIcon = (status: 'completed' | 'in_progress' | 'not_started') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-primary" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Find first incomplete lesson for "Continue" button
  const allLessons = course.modules.flatMap(m => m.lessons);
  const firstIncompleteLesson = allLessons.find(l => !l.completed);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/app/courses">{t.nav.courses}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Course Header */}
      <div className="card-elevated p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Thumbnail */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-hero">
                <BookOpen className="w-16 h-16 text-sidebar-foreground/20" />
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {course.category_name && (
                <span className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                  {course.category_name}
                </span>
              )}
              <span className={cn("text-sm font-medium", levelColors[course.level])}>
                {levelLabels[course.level]}
              </span>
              <StatusBadge status={courseStatus} />
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold">{course.title}</h1>
            
            {course.description && (
              <p className="text-muted-foreground">{course.description}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{course.lessons_count} {t.courses.lessons}</span>
              </div>
              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>{course.modules.length} {t.courses.modules}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.courses.progress}</span>
                <span className="font-medium">
                  {course.completed_lessons}/{course.lessons_count} ({Math.round(progress)}%)
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {firstIncompleteLesson ? (
                <Button asChild size="lg">
                  <Link to={`/app/lessons/${firstIncompleteLesson.id}`}>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    {progress > 0 ? t.courses.continue : t.courses.startLearning}
                  </Link>
                </Button>
              ) : course.lessons_count > 0 ? (
                <Button size="lg" variant="secondary" disabled>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {t.courses.completed}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Modules & Lessons */}
      {course.modules.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t.courses.courseContent}</h2>
          
          <Accordion 
            type="multiple" 
            defaultValue={course.modules.slice(0, 2).map(m => m.id)} 
            className="space-y-3"
          >
            {course.modules.map((module, moduleIndex) => {
              const moduleProgress = getModuleProgress(module.lessons);
              
              return (
                <AccordionItem 
                  key={module.id} 
                  value={module.id}
                  className="card-elevated border-0 overflow-hidden"
                >
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-accent/50">
                    <div className="flex-1 flex items-center justify-between pr-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {moduleIndex + 1}
                        </span>
                        <div className="text-left">
                          <h3 className="font-medium">{module.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {moduleProgress.completed}/{moduleProgress.total} {t.courses.lessons} • {Math.round(moduleProgress.percent)}%
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block w-24">
                        <Progress value={moduleProgress.percent} className="h-1.5" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4">
                    <div className="space-y-1 pt-2">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const lessonStatus = getLessonStatus(lesson.completed, lessonIndex, module.lessons);
                        
                        return (
                          <Link
                            key={lesson.id}
                            to={`/app/lessons/${lesson.id}`}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-colors",
                              "hover:bg-accent group",
                              lessonStatus === 'in_progress' && "bg-primary/5"
                            )}
                          >
                            {getStatusIcon(lessonStatus)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {moduleIndex + 1}.{lessonIndex + 1}
                                </span>
                                <h4 className={cn(
                                  "font-medium truncate group-hover:text-primary transition-colors",
                                  lessonStatus === 'completed' && "text-muted-foreground"
                                )}>
                                  {lesson.title}
                                </h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {lesson.has_homework && (
                                <FileText className="w-4 h-4" />
                              )}
                              {lesson.duration && (
                                <span className="hidden sm:inline">{lesson.duration}</span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ) : (
        <div className="card-elevated p-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No content available for this course yet.</p>
        </div>
      )}
    </div>
  );
}
