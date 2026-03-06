import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminHomeworkSubmissions,
  useReviewHomework,
  type AdminSubmission,
} from '@/hooks/useAdminHomework';
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Loader2,
  FileText,
  Inbox,
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  submitted: { label: 'Күтілуде', variant: 'default', icon: Clock },
  approved: { label: 'Қабылданды', variant: 'secondary', icon: CheckCircle },
  rejected: { label: 'Қайтарылды', variant: 'destructive', icon: XCircle },
};

export default function AdminHomework() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('submitted');
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; submission: AdminSubmission | null; action: 'approved' | 'rejected' }>({
    open: false,
    submission: null,
    action: 'approved',
  });
  const [feedback, setFeedback] = useState('');

  const { data: submissions, isLoading } = useAdminHomeworkSubmissions(activeTab === 'all' ? undefined : activeTab);
  const reviewHomework = useReviewHomework();

  if (!isAdmin) return <Navigate to="/app" replace />;

  const openReview = (submission: AdminSubmission, action: 'approved' | 'rejected') => {
    setFeedback('');
    setReviewDialog({ open: true, submission, action });
  };

  const handleReview = async () => {
    if (!reviewDialog.submission) return;

    try {
      await reviewHomework.mutateAsync({
        submissionId: reviewDialog.submission.id,
        status: reviewDialog.action,
        feedback,
      });
      toast({
        title: reviewDialog.action === 'approved' ? 'Тапсырма қабылданды' : 'Тапсырма қайтарылды',
      });
      setReviewDialog({ open: false, submission: null, action: 'approved' });
    } catch (error) {
      toast({ title: 'Қате', description: String(error), variant: 'destructive' });
    }
  };

  const SubmissionCard = ({ sub }: { sub: AdminSubmission }) => {
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
            <Badge variant={config.variant} className="shrink-0 gap-1">
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{sub.student_name || sub.user_id.slice(0, 8)}</span>
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

          {sub.status === 'submitted' && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => openReview(sub, 'approved')}
              >
                <CheckCircle className="w-4 h-4" />
                Қабылдау
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => openReview(sub, 'rejected')}
              >
                <XCircle className="w-4 h-4" />
                Қайтару
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Үй тапсырмалары
        </h1>
        <p className="text-muted-foreground mt-1">
          Студенттердің жіберген тапсырмаларын тексеру
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submitted" className="gap-1.5">
            <Clock className="w-4 h-4" />
            Күтілуде
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Қабылданды
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="w-4 h-4" />
            Қайтарылды
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            <FileText className="w-4 h-4" />
            Барлығы
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : submissions?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Inbox className="w-12 h-12 mb-3 opacity-40" />
                <p>Тапсырмалар жоқ</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {submissions?.map(sub => (
                <SubmissionCard key={sub.id} sub={sub} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approved' ? 'Тапсырманы қабылдау' : 'Тапсырманы қайтару'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reviewDialog.submission && (
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Сабақ:</span> {reviewDialog.submission.lesson_title}</p>
                <p><span className="text-muted-foreground">Студент:</span> {reviewDialog.submission.student_name || reviewDialog.submission.user_id.slice(0, 8)}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Пікір (міндетті емес)</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Студентке хабарлама жазыңыз..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog({ ...reviewDialog, open: false })}>
              Болдырмау
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewHomework.isPending}
              variant={reviewDialog.action === 'rejected' ? 'destructive' : 'default'}
              className="gap-1.5"
            >
              {reviewHomework.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {reviewDialog.action === 'approved' ? 'Қабылдау' : 'Қайтару'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
