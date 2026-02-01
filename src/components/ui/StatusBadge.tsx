import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type Status = 'completed' | 'in_progress' | 'not_started';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useLanguage();
  
  const statusConfig = {
    completed: {
      label: t.courses.completed,
      className: 'status-completed',
    },
    in_progress: {
      label: t.courses.inProgress,
      className: 'status-in-progress',
    },
    not_started: {
      label: t.courses.notStarted,
      className: 'status-not-started',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
