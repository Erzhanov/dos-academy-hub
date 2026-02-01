import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookOpen, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessonsCount: number;
  completedLessons: number;
  duration?: string;
  thumbnail?: string;
  className?: string;
}

export function CourseCard({
  id,
  title,
  description,
  category,
  level,
  lessonsCount,
  completedLessons,
  duration,
  thumbnail,
  className,
}: CourseCardProps) {
  const { t } = useLanguage();
  
  const progress = lessonsCount > 0 ? (completedLessons / lessonsCount) * 100 : 0;
  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
  
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

  return (
    <Link
      to={`/app/courses/${id}`}
      className={cn(
        "card-elevated block group transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-secondary rounded-t-lg overflow-hidden relative">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-hero">
            <BookOpen className="w-12 h-12 text-sidebar-foreground/20" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-xs font-medium", levelColors[level])}>
            {levelLabels[level]}
          </span>
          <StatusBadge status={status} />
        </div>
        
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lessonsCount} {t.courses.lessons}</span>
          </div>
          {duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t.courses.progress}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} size="sm" />
        </div>
      </div>
    </Link>
  );
}
