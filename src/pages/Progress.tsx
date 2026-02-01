import { useLanguage } from '@/contexts/LanguageContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookOpen, CheckCircle, Clock, Trophy } from 'lucide-react';

// Mock data
const COURSE_PROGRESS = [
  {
    id: '1',
    title: 'Python негіздері',
    lessonsCount: 24,
    completedLessons: 18,
    lastAccessed: '2024-01-15',
  },
  {
    id: '2',
    title: 'Web-әзірлеу: HTML/CSS',
    lessonsCount: 20,
    completedLessons: 20,
    lastAccessed: '2024-01-10',
  },
  {
    id: '3',
    title: 'JavaScript Advanced',
    lessonsCount: 30,
    completedLessons: 5,
    lastAccessed: '2024-01-14',
  },
  {
    id: '4',
    title: 'React негіздері',
    lessonsCount: 28,
    completedLessons: 0,
    lastAccessed: null,
  },
];

export default function Progress() {
  const { t } = useLanguage();

  const totalLessons = COURSE_PROGRESS.reduce((acc, c) => acc + c.lessonsCount, 0);
  const totalCompleted = COURSE_PROGRESS.reduce((acc, c) => acc + c.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;
  
  const completedCourses = COURSE_PROGRESS.filter(c => c.completedLessons === c.lessonsCount).length;
  const inProgressCourses = COURSE_PROGRESS.filter(c => c.completedLessons > 0 && c.completedLessons < c.lessonsCount).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.dashboard.myProgress}
        </h1>
      </div>

      {/* Overall Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Overall Progress</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{Math.round(overallProgress)}%</p>
          <ProgressBar value={overallProgress} size="md" className="mt-3" />
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">{t.dashboard.completedCourses}</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{completedCourses}</p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">{t.dashboard.coursesInProgress}</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{inProgressCourses}</p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">{t.dashboard.completedLessons}</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalCompleted} / {totalLessons}</p>
        </div>
      </div>

      {/* Course Progress List */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Course Progress
        </h2>
        
        <div className="space-y-4">
          {COURSE_PROGRESS.map((course) => {
            const progress = course.lessonsCount > 0 
              ? (course.completedLessons / course.lessonsCount) * 100 
              : 0;
            const status = progress === 100 
              ? 'completed' 
              : progress > 0 
                ? 'in_progress' 
                : 'not_started';

            return (
              <div key={course.id} className="card-elevated p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {course.completedLessons} / {course.lessonsCount} {t.courses.lessons}
                    </p>
                  </div>
                  
                  <div className="sm:w-48">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t.courses.progress}</span>
                      <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                    </div>
                    <ProgressBar value={progress} size="md" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
