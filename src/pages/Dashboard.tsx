import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { StatCard } from '@/components/dashboard/StatCard';
import { CourseCard } from '@/components/courses/CourseCard';
import { BookOpen, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: courses = [], isLoading } = useCourses();

  const totalLessons = courses.reduce((acc, c) => acc + c.lessons_count, 0);
  const completedLessons = courses.reduce((acc, c) => acc + c.completed_lessons, 0);
  const inProgressCourses = courses.filter(c => c.completed_lessons > 0 && c.completed_lessons < c.lessons_count).length;
  const completedCourses = courses.filter(c => c.completed_lessons === c.lessons_count && c.lessons_count > 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.dashboard.welcomeBack}, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.dashboard.continueWatching}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.coursesInProgress}
          value={inProgressCourses}
          icon={Clock}
        />
        <StatCard
          title={t.dashboard.completedCourses}
          value={completedCourses}
          icon={CheckCircle}
        />
        <StatCard
          title={t.dashboard.totalLessons}
          value={totalLessons}
          icon={BookOpen}
        />
        <StatCard
          title={t.dashboard.completedLessons}
          value={completedLessons}
          icon={TrendingUp}
          trend={totalLessons > 0 ? { value: Math.round((completedLessons / totalLessons) * 100), isPositive: true } : undefined}
        />
      </div>

      {/* My Courses */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {t.dashboard.myCourses}
          </h2>
          <a 
            href="/app/courses" 
            className="text-sm text-primary hover:underline font-medium"
          >
            {t.common.viewAll}
          </a>
        </div>

        {courses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.slice(0, 4).map((course) => (
              <CourseCard 
                key={course.id} 
                id={course.id}
                title={course.title}
                description={course.description || ''}
                category={course.category_name || ''}
                level={course.level}
                lessonsCount={course.lessons_count}
                completedLessons={course.completed_lessons}
                duration={course.duration || ''}
              />
            ))}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
