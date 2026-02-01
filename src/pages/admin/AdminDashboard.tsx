import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, BookOpen, GraduationCap, BarChart3, Activity } from 'lucide-react';

// Mock admin stats
const ADMIN_STATS = {
  totalUsers: 156,
  activeUsers7Days: 89,
  activeUsers30Days: 134,
  totalCourses: 12,
  totalLessons: 248,
  averageProgress: 67,
};

const RECENT_ACTIVITY = [
  { id: 1, action: 'User Created', user: 'Aibek Tolegenov', time: '2 min ago' },
  { id: 2, action: 'Course Published', user: 'Admin', time: '15 min ago' },
  { id: 3, action: 'Lesson Completed', user: 'Dana Nurmukhanova', time: '1 hour ago' },
  { id: 4, action: 'User Login', user: 'Aibek Tolegenov', time: '2 hours ago' },
  { id: 5, action: 'Module Added', user: 'Admin', time: '3 hours ago' },
];

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  // Guard: Only admins can access
  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.admin.dashboard}
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.admin.totalUsers}
          value={ADMIN_STATS.totalUsers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t.admin.activeUsers}
          value={ADMIN_STATS.activeUsers7Days}
          icon={Activity}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title={t.admin.totalCourses}
          value={ADMIN_STATS.totalCourses}
          icon={BookOpen}
        />
        <StatCard
          title={t.admin.totalLessons}
          value={ADMIN_STATS.totalLessons}
          icon={GraduationCap}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Activity Chart Placeholder */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            User Activity (Last 30 Days)
          </h2>
          <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart will be rendered here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Top Courses by Enrollment
        </h2>
        <div className="space-y-4">
          {[
            { name: 'Python негіздері', enrolled: 89, progress: 75 },
            { name: 'Web-әзірлеу: HTML/CSS', enrolled: 67, progress: 82 },
            { name: 'JavaScript Advanced', enrolled: 45, progress: 45 },
            { name: 'React негіздері', enrolled: 34, progress: 28 },
          ].map((course, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="w-6 text-center text-muted-foreground font-medium">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{course.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {course.enrolled} enrolled
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {course.progress}% avg progress
                  </span>
                </div>
              </div>
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
