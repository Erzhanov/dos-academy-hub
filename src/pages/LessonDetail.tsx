import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useLesson, useModuleLessons } from '@/hooks/useLesson';
import { useToggleLessonProgress } from '@/hooks/useProgress';
import { 
  CheckCircle, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  BookOpen,
  FileText,
  Lock,
  Loader2
} from 'lucide-react';

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch lesson data
  const { data: lesson, isLoading: isLoadingLesson, error: lessonError } = useLesson(id);
  const { data: moduleLessons = [], isLoading: isLoadingModuleLessons } = useModuleLessons(lesson?.module_id);
  
  // Progress mutation
  const toggleProgress = useToggleLessonProgress();
  
  // Find navigation lessons
  const currentIndex = moduleLessons.findIndex(l => l.id === id);
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null;
  
  // Calculate module progress
  const completedCount = moduleLessons.filter(l => l.is_completed).length;
  const progressPercent = moduleLessons.length > 0 ? (completedCount / moduleLessons.length) * 100 : 0;

  const handleMarkComplete = async () => {
    if (!lesson || !user) return;
    
    try {
      await toggleProgress.mutateAsync({ lessonId: lesson.id, completed: true });
      toast({
        title: t.courses.completed,
        description: `"${lesson.title}" ${t.lessons.markComplete.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: t.common.error,
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  const handleDownloadHomework = () => {
    // In production, this would trigger actual download from storage
    toast({
      title: t.lessons.downloadHomework,
      description: 'Файл жүктелуде...',
    });
  };

  // Loading state
  if (isLoadingLesson) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-6 w-96" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (lessonError || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-muted-foreground">{t.common.error}</p>
        <Button onClick={() => navigate('/app/courses')}>{t.common.back}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app/courses" className="hover:text-foreground transition-colors">
          {t.nav.courses}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/app/courses/${lesson.course_id}`} className="hover:text-foreground transition-colors">
          {lesson.course_title}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{lesson.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <AspectRatio ratio={16 / 9} className="bg-muted">
              {lesson.video_url ? (
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Бейне қолжетімсіз</p>
                  </div>
                </div>
              )}
            </AspectRatio>
          </Card>

          {/* Lesson Info */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{`${lesson.module_order_index + 1}-Модуль: ${lesson.module_title}`}</Badge>
                    {lesson.is_completed && (
                      <Badge variant="secondary" className="border">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.courses.completed}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl md:text-2xl">{lesson.title}</CardTitle>
                </div>
                {lesson.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.description && (
                <p className="text-muted-foreground">{lesson.description}</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!lesson.is_completed && (
                  <Button 
                    onClick={handleMarkComplete} 
                    className="gap-2"
                    disabled={toggleProgress.isPending}
                  >
                    {toggleProgress.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {t.lessons.markComplete}
                  </Button>
                )}
                
                {lesson.has_homework && (
                  <Button variant="outline" onClick={handleDownloadHomework} className="gap-2">
                    <Download className="w-4 h-4" />
                    {t.lessons.downloadHomework}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lesson Navigation */}
          <div className="flex items-center justify-between gap-4">
            {prevLesson ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/app/lessons/${prevLesson.id}`)}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t.lessons.previousLesson}</span>
              </Button>
            ) : (
              <div />
            )}
            
            {nextLesson ? (
              <Button
                onClick={() => navigate(`/app/lessons/${nextLesson.id}`)}
                className="gap-2"
              >
                <span className="hidden sm:inline">{t.lessons.nextLesson}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate(`/app/courses/${lesson.course_id}`)} className="gap-2">
                {t.common.back}
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Module Lessons */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {`${lesson.module_order_index + 1}-Модуль: ${lesson.module_title}`}
              </CardTitle>
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{t.courses.progress}</span>
                  <span>{completedCount}/{moduleLessons.length}</span>
                </div>
                <ProgressBar value={progressPercent} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingModuleLessons ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {moduleLessons.map((moduleLesson, index) => {
                    const isCurrent = moduleLesson.id === id;
                    
                    return (
                      <button
                        key={moduleLesson.id}
                        onClick={() => navigate(`/app/lessons/${moduleLesson.id}`)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isCurrent
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          moduleLesson.is_completed
                            ? 'bg-accent text-accent-foreground'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {moduleLesson.is_completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={`text-sm truncate ${
                          isCurrent ? 'font-medium' : ''
                        }`}>
                          {moduleLesson.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Homework Card */}
          {lesson.has_homework && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Үй тапсырмасы
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Сабақты аяқтағаннан кейін тапсырманы орындаңыз.
                </p>
                <Button
                  variant="outline"
                  onClick={handleDownloadHomework}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t.lessons.downloadHomework}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
