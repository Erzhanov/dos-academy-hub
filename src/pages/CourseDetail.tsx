import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock course data - will be replaced with real data from backend
const MOCK_COURSE = {
  id: '1',
  title: 'Python негіздері',
  description: 'Python бағдарламалау тілінің негізгі концепциялары мен синтаксисін үйреніңіз. Бұл курс бағдарламалауды жаңадан бастаушыларға арналған.',
  category: 'Бағдарламалау',
  level: 'beginner' as const,
  duration: '12 сағат',
  lessonsCount: 24,
  completedLessons: 8,
  thumbnail: null,
  modules: [
    {
      id: 'm1',
      title: 'Python-ға кіріспе',
      order_index: 1,
      lessons: [
        { id: 'l1', title: 'Python дегеніміз не?', duration: '15 мин', status: 'completed' as const, hasHomework: true },
        { id: 'l2', title: 'Python орнату', duration: '20 мин', status: 'completed' as const, hasHomework: false },
        { id: 'l3', title: 'Бірінші бағдарлама', duration: '25 мин', status: 'completed' as const, hasHomework: true },
      ]
    },
    {
      id: 'm2',
      title: 'Айнымалылар мен деректер түрлері',
      order_index: 2,
      lessons: [
        { id: 'l4', title: 'Айнымалылар', duration: '30 мин', status: 'completed' as const, hasHomework: true },
        { id: 'l5', title: 'Сандар', duration: '25 мин', status: 'completed' as const, hasHomework: true },
        { id: 'l6', title: 'Жолдар (Strings)', duration: '35 мин', status: 'in_progress' as const, hasHomework: true },
        { id: 'l7', title: 'Тізімдер (Lists)', duration: '40 мин', status: 'not_started' as const, hasHomework: true },
      ]
    },
    {
      id: 'm3',
      title: 'Басқару құрылымдары',
      order_index: 3,
      lessons: [
        { id: 'l8', title: 'Шартты операторлар (if/else)', duration: '35 мин', status: 'not_started' as const, hasHomework: true },
        { id: 'l9', title: 'Циклдар (for, while)', duration: '45 мин', status: 'not_started' as const, hasHomework: true },
        { id: 'l10', title: 'Функциялар', duration: '50 мин', status: 'not_started' as const, hasHomework: true },
      ]
    },
    {
      id: 'm4',
      title: 'Қосымша тақырыптар',
      order_index: 4,
      lessons: [
        { id: 'l11', title: 'Файлдармен жұмыс', duration: '40 мин', status: 'not_started' as const, hasHomework: true },
        { id: 'l12', title: 'Қателерді өңдеу', duration: '35 мин', status: 'not_started' as const, hasHomework: false },
      ]
    },
  ]
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  // In real app, fetch course by id
  const course = MOCK_COURSE;
  
  const progress = course.lessonsCount > 0 
    ? (course.completedLessons / course.lessonsCount) * 100 
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

  const getModuleProgress = (lessons: typeof MOCK_COURSE.modules[0]['lessons']) => {
    const completed = lessons.filter(l => l.status === 'completed').length;
    return { completed, total: lessons.length, percent: (completed / lessons.length) * 100 };
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
  const firstIncompleteLessonId = course.modules
    .flatMap(m => m.lessons)
    .find(l => l.status !== 'completed')?.id;

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
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-hero">
                  <BookOpen className="w-16 h-16 text-sidebar-foreground/20" />
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                {course.category}
              </span>
              <span className={cn("text-sm font-medium", levelColors[course.level])}>
                {levelLabels[course.level]}
              </span>
              <StatusBadge status={courseStatus} />
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold">{course.title}</h1>
            
            <p className="text-muted-foreground">{course.description}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{course.lessonsCount} {t.courses.lessons}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
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
                  {course.completedLessons}/{course.lessonsCount} ({Math.round(progress)}%)
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {firstIncompleteLessonId ? (
                <Button asChild size="lg">
                  <Link to={`/app/lessons/${firstIncompleteLessonId}`}>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    {progress > 0 ? t.courses.continue : t.courses.startLearning}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" disabled>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {t.courses.completed}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t.courses.courseContent}</h2>
        
        <Accordion type="multiple" defaultValue={['m1', 'm2']} className="space-y-3">
          {course.modules.map((module) => {
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
                        {module.order_index}
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
                    {module.lessons.map((lesson, lessonIndex) => (
                      <Link
                        key={lesson.id}
                        to={`/app/lessons/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                          "hover:bg-accent group",
                          lesson.status === 'in_progress' && "bg-primary/5"
                        )}
                      >
                        {getStatusIcon(lesson.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {module.order_index}.{lessonIndex + 1}
                            </span>
                            <h4 className={cn(
                              "font-medium truncate group-hover:text-primary transition-colors",
                              lesson.status === 'completed' && "text-muted-foreground"
                            )}>
                              {lesson.title}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {lesson.hasHomework && (
                            <FileText className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">{lesson.duration}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
