import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  size = 'md',
  showLabel = false,
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("progress-bar", sizeClasses[size])}>
        <div 
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground mt-1 block">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
