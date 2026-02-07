import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateLesson, useUpdateLesson, useAdminModules } from '@/hooks/useAdminContent';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: Tables<'lessons'> | null;
}

export function LessonDialog({ open, onOpenChange, lesson }: LessonDialogProps) {
  const { toast } = useToast();
  const { data: modules } = useAdminModules();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [hasHomework, setHasHomework] = useState(false);
  const [orderIndex, setOrderIndex] = useState<number>(1);
  
  const isEditing = !!lesson;
  const isPending = createLesson.isPending || updateLesson.isPending;

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description || '');
      setModuleId(lesson.module_id);
      setVideoUrl(lesson.video_url || '');
      setDuration(lesson.duration || '');
      setHasHomework(lesson.has_homework);
      setOrderIndex(lesson.order_index);
    } else {
      setTitle('');
      setDescription('');
      setModuleId('');
      setVideoUrl('');
      setDuration('');
      setHasHomework(false);
      setOrderIndex(1);
    }
  }, [lesson, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moduleId) {
      toast({ title: 'Error', description: 'Please select a module', variant: 'destructive' });
      return;
    }
    
    const lessonData = {
      title,
      description: description || null,
      module_id: moduleId,
      video_url: videoUrl || null,
      duration: duration || null,
      has_homework: hasHomework,
      order_index: orderIndex,
    };
    
    try {
      if (isEditing && lesson) {
        await updateLesson.mutateAsync({ id: lesson.id, ...lessonData });
        toast({ title: 'Lesson updated successfully' });
      } else {
        await createLesson.mutateAsync(lessonData);
        toast({ title: 'Lesson created successfully' });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save lesson',
        variant: 'destructive' 
      });
    }
  };

  // Group modules by course for better UX
  const groupedModules = modules?.reduce((acc, module) => {
    const courseTitle = module.course_title || 'No Course';
    if (!acc[courseTitle]) acc[courseTitle] = [];
    acc[courseTitle].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lesson description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {groupedModules && Object.entries(groupedModules).map(([courseTitle, courseModules]) => (
                  <div key={courseTitle}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {courseTitle}
                    </div>
                    {courseModules?.map((mod) => (
                      <SelectItem key={mod.id} value={mod.id}>
                        {mod.order_index}. {mod.title}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 15 min"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order">Order Index</Label>
              <Input
                id="order"
                type="number"
                min={0}
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="homework"
              checked={hasHomework}
              onCheckedChange={setHasHomework}
            />
            <Label htmlFor="homework">Has Homework</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
