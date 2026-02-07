import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useCreateModule, useUpdateModule, useAdminCourses } from '@/hooks/useAdminContent';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: Tables<'modules'> | null;
}

export function ModuleDialog({ open, onOpenChange, module }: ModuleDialogProps) {
  const { toast } = useToast();
  const { data: courses } = useAdminCourses();
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState<string>('');
  const [orderIndex, setOrderIndex] = useState<number>(1);
  
  const isEditing = !!module;
  const isPending = createModule.isPending || updateModule.isPending;

  useEffect(() => {
    if (module) {
      setTitle(module.title);
      setCourseId(module.course_id);
      setOrderIndex(module.order_index);
    } else {
      setTitle('');
      setCourseId('');
      setOrderIndex(1);
    }
  }, [module, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId) {
      toast({ title: 'Error', description: 'Please select a course', variant: 'destructive' });
      return;
    }
    
    const moduleData = {
      title,
      course_id: courseId,
      order_index: orderIndex,
    };
    
    try {
      if (isEditing && module) {
        await updateModule.mutateAsync({ id: module.id, ...moduleData });
        toast({ title: 'Module updated successfully' });
      } else {
        await createModule.mutateAsync(moduleData);
        toast({ title: 'Module created successfully' });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save module',
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Module' : 'Add Module'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Module'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
