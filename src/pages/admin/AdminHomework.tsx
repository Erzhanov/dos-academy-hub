import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
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
import { SubmissionCard } from '@/components/admin/SubmissionCard';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Inbox,
  Loader2,
} from 'lucide-react';

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
  const [score, setScore] = useState('');

  const { data: submissions, isLoading } = useAdminHomeworkSubmissions(activeTab === 'all' ? undefined : activeTab);
  const reviewHomework = useReviewHomework();

  if (!isAdmin) return <Navigate to="/app" replace />;

  const openReview = (submission: AdminSubmission, action: 'approved' | 'rejected') => {
    setFeedback('');
    setScore('');
    setReviewDialog({ open: true, submission, action });
  };

  const handleReview = async () => {
    if (!reviewDialog.submission) return;
    const scoreNum = score ? parseInt(score, 10) : undefined;
    if (score && (isNaN(scoreNum!) || scoreNum! < 0 || scoreNum! > 100)) {
      toast({ title: 'Балл 0-100 аралығында болуы керек', variant: 'destructive' });
      return;
    }

    try {
      await reviewHomework.mutateAsync({
        submissionId: reviewDialog.submission.id,
        status: reviewDialog.action,
        feedback,
        score: scoreNum,
      });
      toast({
        title: reviewDialog.action === 'approved' ? 'Тапсырма қабылданды' : 'Тапсырма қайтарылды',
      });
      setReviewDialog({ open: false, submission: null, action: 'approved' });
    } catch (error) {
      toast({ title: 'Қате', description: String(error), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Үй тапсырмалары</h1>
        <p className="text-muted-foreground mt-1">Студенттердің жіберген тапсырмаларын тексеру</p>
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
                <SubmissionCard key={sub.id} sub={sub} onReview={openReview} />
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
              <Label>Балл (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="85"
              />
            </div>
            <div className="space-y-2">
              <Label>Пікір (міндетті емес)</Label>
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
