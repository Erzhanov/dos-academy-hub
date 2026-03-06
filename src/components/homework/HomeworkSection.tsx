import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useHomeworkSubmission, useSubmitHomework } from '@/hooks/useHomework';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Send, Loader2, CheckCircle, Clock, ExternalLink, XCircle, MessageSquare } from 'lucide-react';

interface HomeworkSectionProps {
  lessonId: string;
  homeworkInstructions: string | null;
  homeworkAttachmentUrl: string | null;
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  submitted: { label: 'Жіберілді', variant: 'default' },
  reviewed: { label: 'Тексерілді', variant: 'secondary' },
  approved: { label: 'Қабылданды', variant: 'default' },
  rejected: { label: 'Қайтарылды', variant: 'destructive' },
};

export function HomeworkSection({ lessonId, homeworkInstructions, homeworkAttachmentUrl }: HomeworkSectionProps) {
  const { toast } = useToast();
  const { data: submission, isLoading } = useHomeworkSubmission(lessonId);
  const submitHomework = useSubmitHomework();

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const hasSubmission = !!submission;
  const showForm = !hasSubmission || isEditing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionUrl && !notes) {
      toast({ title: 'Қате', description: 'Сілтеме немесе жазба қосыңыз', variant: 'destructive' });
      return;
    }

    try {
      await submitHomework.mutateAsync({ lessonId, submissionUrl, notes });
      toast({ title: 'Тапсырма жіберілді!' });
      setIsEditing(false);
      setSubmissionUrl('');
      setNotes('');
    } catch (error) {
      toast({ title: 'Қате', description: String(error), variant: 'destructive' });
    }
  };

  const handleEdit = () => {
    setSubmissionUrl(submission?.submission_url || '');
    setNotes(submission?.notes || '');
    setIsEditing(true);
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Үй тапсырмасы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        {homeworkInstructions && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground whitespace-pre-wrap">
            {homeworkInstructions}
          </div>
        )}

        {/* Download attachment */}
        {homeworkAttachmentUrl && (
          <Button variant="outline" className="w-full gap-2" asChild>
            <a href={homeworkAttachmentUrl} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              Тапсырма файлын жүктеу
            </a>
          </Button>
        )}

        {/* Existing submission */}
        {hasSubmission && !isEditing && (
          <div className="space-y-3 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Сіздің жауабыңыз</span>
              <Badge variant={statusMap[submission.status]?.variant || 'outline'}>
                {submission.status === 'submitted' && <Clock className="w-3 h-3 mr-1" />}
                {submission.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                {statusMap[submission.status]?.label || submission.status}
              </Badge>
            </div>
            {submission.submission_url && (
              <a
                href={submission.submission_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {submission.submission_url}
              </a>
            )}
            {submission.notes && (
              <p className="text-sm text-muted-foreground">{submission.notes}</p>
            )}
            {/* Admin feedback */}
            {submission.feedback && (
              <div className="p-2.5 rounded-md bg-primary/5 border border-primary/10 text-sm">
                <div className="flex items-center gap-1.5 text-primary font-medium mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Мұғалімнің пікірі
                </div>
                <p className="text-muted-foreground">{submission.feedback}</p>
              </div>
            )}
            {submission.status === 'rejected' && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Тапсырманы қайта жіберіңіз
              </p>
            )}
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Қайта жіберу
            </Button>
          </div>
        )}

        {/* Submission form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="hw-url" className="text-sm">Сілтеме (GitHub, Google Drive, т.б.)</Label>
              <Input
                id="hw-url"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hw-notes" className="text-sm">Жазба / Комментарий</Label>
              <Textarea
                id="hw-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Қосымша ақпарат..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gap-2" disabled={submitHomework.isPending}>
                {submitHomework.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Жіберу
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Болдырмау
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
