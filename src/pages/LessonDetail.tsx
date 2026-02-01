import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  CheckCircle, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  BookOpen,
  FileText,
  Lock
} from 'lucide-react';

// Mock data for lesson
const MOCK_LESSONS = [
  {
    id: '1',
    title: 'Python кіріспе',
    description: 'Python бағдарламалау тіліне кіріспе. Негізгі түсініктер мен орнату процесі.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    homeworkUrl: '/homework/lesson-1.pdf',
    duration: '15:30',
    moduleId: '1',
    moduleTitle: '1-Модуль: Негіздер',
    courseId: '1',
    courseTitle: 'Python негіздері',
    orderIndex: 1,
    isPublished: true,
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Айнымалылар және деректер типтері',
    description: 'Python-дағы негізгі деректер типтері: string, int, float, boolean. Айнымалыларды жариялау.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    homeworkUrl: '/homework/lesson-2.pdf',
    duration: '22:45',
    moduleId: '1',
    moduleTitle: '1-Модуль: Негіздер',
    courseId: '1',
    courseTitle: 'Python негіздері',
    orderIndex: 2,
    isPublished: true,
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Шарт операторлары',
    description: 'If, elif, else операторлары. Логикалық өрнектер мен салыстыру операторлары.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    homeworkUrl: null,
    duration: '18:20',
    moduleId: '1',
    moduleTitle: '1-Модуль: Негіздер',
    courseId: '1',
    courseTitle: 'Python негіздері',
    orderIndex: 3,
    isPublished: true,
    isCompleted: false,
  },
];

// Mock module lessons for navigation
const MODULE_LESSONS = [
  { id: '1', title: 'Python кіріспе', isCompleted: false, orderIndex: 1 },
  { id: '2', title: 'Айнымалылар және деректер типтері', isCompleted: true, orderIndex: 2 },
  { id: '3', title: 'Шарт операторлары', isCompleted: false, orderIndex: 3 },
  { id: '4', title: 'Циклдар', isCompleted: false, orderIndex: 4 },
  { id: '5', title: 'Функциялар', isCompleted: false, orderIndex: 5 },
];

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Find current lesson
  const lesson = MOCK_LESSONS.find(l => l.id === id) || MOCK_LESSONS[0];
  const [isCompleted, setIsCompleted] = useState(lesson.isCompleted);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Find current index in module
  const currentIndex = MODULE_LESSONS.findIndex(l => l.id === id);
  const prevLesson = currentIndex > 0 ? MODULE_LESSONS[currentIndex - 1] : null;
  const nextLesson = currentIndex < MODULE_LESSONS.length - 1 ? MODULE_LESSONS[currentIndex + 1] : null;
  
  // Calculate module progress
  const completedCount = MODULE_LESSONS.filter(l => l.isCompleted || l.id === id && isCompleted).length;
  const progressPercent = (completedCount / MODULE_LESSONS.length) * 100;

  const handleMarkComplete = () => {
    setIsCompleted(true);
    toast({
      title: t.courses.completed,
      description: `"${lesson.title}" ${t.lessons.markComplete.toLowerCase()}`,
    });
    // In production, this would call the API to save progress
  };

  const handleDownloadHomework = () => {
    if (lesson.homeworkUrl) {
      // In production, this would trigger actual download
      toast({
        title: t.lessons.downloadHomework,
        description: 'Файл жүктелуде...',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app/courses" className="hover:text-foreground transition-colors">
          {t.nav.courses}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/app/courses/${lesson.courseId}`} className="hover:text-foreground transition-colors">
          {lesson.courseTitle}
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
              {lesson.videoUrl ? (
                <iframe
                  src={lesson.videoUrl}
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
                    <Badge variant="outline">{lesson.moduleTitle}</Badge>
                    {isCompleted && (
                      <Badge variant="secondary" className="border">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.courses.completed}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl md:text-2xl">{lesson.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{lesson.description}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!isCompleted && (
                  <Button onClick={handleMarkComplete} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t.lessons.markComplete}
                  </Button>
                )}
                
                {lesson.homeworkUrl && (
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
              <Button onClick={() => navigate(`/app/courses/${lesson.courseId}`)} className="gap-2">
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
                {lesson.moduleTitle}
              </CardTitle>
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{t.courses.progress}</span>
                  <span>{completedCount}/{MODULE_LESSONS.length}</span>
                </div>
                <ProgressBar value={progressPercent} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {MODULE_LESSONS.map((moduleLesson, index) => {
                  const isCurrent = moduleLesson.id === id;
                  const completed = moduleLesson.isCompleted || (isCurrent && isCompleted);
                  
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
                        completed
                          ? 'bg-accent text-accent-foreground'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {completed ? (
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
            </CardContent>
          </Card>

          {/* Homework Card */}
          {lesson.homeworkUrl && (
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
