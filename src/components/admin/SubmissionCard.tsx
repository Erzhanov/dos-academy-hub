import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { type AdminSubmission } from '@/hooks/useAdminHomework';
import { Link } from 'react-router-dom';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  submitted: { label: 'Күтілуде', variant: 'default', icon: Clock },
  approved: { label: 'Қабылданды', variant: 'secondary', icon: CheckCircle },
  rejected: { label: 'Қайтарылды', variant: 'destructive', icon: XCircle },
};

interface SubmissionCardProps {
  sub: AdminSubmission;
  onReview?: (sub: AdminSubmission, action: 'approved' | 'rejected') => void;
  showStudentLink?: boolean;
}

export function SubmissionCard({ sub, onReview, showStudentLink = true }: SubmissionCardProps) {
  const config = statusConfig[sub.status] || statusConfig.submitted;
  const StatusIcon = config.icon;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="font-medium truncate">{sub.lesson_title}</p>
            <p className="text-sm text-muted-foreground truncate">{sub.course_title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {sub.score != null && (
              <Badge variant="outline" className="font-mono">
                {sub.score}/100
              </Badge>
            )}
            <Badge variant={config.variant} className="gap-1">
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {showStudentLink ? (
            <Link
              to={`/admin/students/${sub.user_id}`}
              className="text-primary hover:underline font-medium"
            >
              {sub.student_name || sub.user_id.slice(0, 8)}
            </Link>
          ) : (
            <span>{sub.student_name || sub.user_id.slice(0, 8)}</span>
          )}
          <span>•</span>
          <span>{format(new Date(sub.created_at), 'dd.MM.yyyy HH:mm')}</span>
          {sub.attempt_no && sub.attempt_no > 1 && (
            <>
              <span>•</span>
              <span>#{sub.attempt_no} әрекет</span>
            </>
          )}
        </div>

        {sub.submission_url && (
          <a
            href={sub.submission_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {sub.submission_url.length > 60 ? sub.submission_url.slice(0, 60) + '...' : sub.submission_url}
          </a>
        )}

        {sub.notes && (
          <div className="p-2.5 rounded-md bg-muted/50 text-sm">
            <p className="text-muted-foreground">{sub.notes}</p>
          </div>
        )}

        {sub.feedback && (
          <div className="p-2.5 rounded-md bg-primary/5 border border-primary/10 text-sm">
            <div className="flex items-center gap-1.5 text-primary font-medium mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Пікір
            </div>
            <p className="text-muted-foreground">{sub.feedback}</p>
          </div>
        )}

        {sub.status === 'submitted' && onReview && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="gap-1.5" onClick={() => onReview(sub, 'approved')}>
              <CheckCircle className="w-4 h-4" />
              Қабылдау
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onReview(sub, 'rejected')}>
              <XCircle className="w-4 h-4" />
              Қайтару
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
