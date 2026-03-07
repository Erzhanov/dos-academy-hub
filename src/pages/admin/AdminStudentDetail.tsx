import { useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentDetail, useReviewHomework, type AdminSubmission } from '@/hooks/useAdminHomework';
import { SubmissionCard } from '@/components/admin/SubmissionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, FileText, Loader2, Star,
} from 'lucide-react';

export default function AdminStudentDetail() {
  const { isAdmin } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const { data: student, isLoading } = useStudentDetail(userId || '');
  const reviewHomework = useReviewHomework();

  const [activeTab, setActiveTab] = useState('all');
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; submission: AdminSubmission | null; action: 'approved' | 'rejected' }>({
    open: false, submission: null, action: 'approved',
  });
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');

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
      toast({ title: reviewDialog.action === 'approved' ? 'Қабылданды' : 'Қайтарылды' });
      setReviewDialog({ open: false, submission: null, action: 'approved' });
    } catch (error) {
      toast({ title: 'Қате', description: String(error), variant: 'destructive' });
    }
  };

  const filtered = student?.submissions.filter(s => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (!student) return <p className="text-muted-foreground p-6">Студент табылмады</p>;

  const initials = student.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back & header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/homework"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <Avatar className="w-12 h-12">
          <AvatarImage src={student.avatar_url || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{student.full_name || 'Аты белгісіз'}</h1>
          <p className="text-sm text-muted-foreground">Студенттің жеке кабинеті</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{student.average_score ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Орташа балл</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-muted">
              <FileText className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{student.total_submissions}</p>
              <p className="text-xs text-muted-foreground">Барлық тапсырмалар</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{student.approved_count}</p>
              <p className="text-xs text-muted-foreground">Қабылданды</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{student.pending_count}</p>
              <p className="text-xs text-muted-foreground">Күтілуде</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Барлығы ({student.total_submissions})</TabsTrigger>
          <TabsTrigger value="submitted">Күтілуде ({student.pending_count})</TabsTrigger>
          <TabsTrigger value="approved">Қабылданды ({student.approved_count})</TabsTrigger>
          <TabsTrigger value="rejected">Қайтарылды ({student.rejected_count})</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Тапсырмалар жоқ
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map(sub => (
                <SubmissionCard key={sub.id} sub={sub} onReview={openReview} showStudentLink={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approved' ? 'Тапсырманы қабылдау' : 'Тапсырманы қайтару'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reviewDialog.submission && (
              <div className="text-sm">
                <p><span className="text-muted-foreground">Сабақ:</span> {reviewDialog.submission.lesson_title}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Балл (0-100)</Label>
              <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} placeholder="85" />
            </div>
            <div className="space-y-2">
              <Label>Пікір</Label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Пікір жазыңыз..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog({ ...reviewDialog, open: false })}>Болдырмау</Button>
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
