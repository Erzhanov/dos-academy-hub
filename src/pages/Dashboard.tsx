import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { CourseCard } from '@/components/courses/CourseCard';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

// Mock data - in production this would come from Supabase
const MOCK_COURSES = [
  {
    id: '1',
    title: 'Python негіздері',
    description: 'Python бағдарламалау тілін нөлден үйреніңіз. Синтаксис, деректер типтері және негізгі құрылымдар.',
    category: 'Бағдарламалау',
    level: 'beginner' as const,
    lessonsCount: 24,
    completedLessons: 18,
    duration: '12 сағ',
  },
  {
    id: '2',
    title: 'Web-әзірлеу: HTML/CSS',
    description: 'Веб-сайттар құруды үйреніңіз. HTML тегтері, CSS стильдері және респонсив дизайн.',
    category: 'Web Development',
    level: 'beginner' as const,
    lessonsCount: 20,
    completedLessons: 20,
    duration: '10 сағ',
  },
  {
    id: '3',
    title: 'JavaScript Advanced',
    description: 'JavaScript тілінің advanced тақырыптары: async/await, promises, modules.',
    category: 'Web Development',
    level: 'advanced' as const,
    lessonsCount: 30,
    completedLessons: 5,
    duration: '15 сағ',
  },
  {
    id: '4',
    title: 'React негіздері',
    description: 'React кітапханасымен қосымшалар құру. Components, hooks, state management.',
    category: 'Frontend',
    level: 'intermediate' as const,
    lessonsCount: 28,
    completedLessons: 0,
    duration: '14 сағ',
  },
];

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const totalLessons = MOCK_COURSES.reduce((acc, c) => acc + c.lessonsCount, 0);
  const completedLessons = MOCK_COURSES.reduce((acc, c) => acc + c.completedLessons, 0);
  const inProgressCourses = MOCK_COURSES.filter(c => c.completedLessons > 0 && c.completedLessons < c.lessonsCount).length;
  const completedCourses = MOCK_COURSES.filter(c => c.completedLessons === c.lessonsCount).length;

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
          trend={{ value: 12, isPositive: true }}
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_COURSES.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </section>
    </div>
  );
}
