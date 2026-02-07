import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Mark a lesson as complete or incomplete
export function useToggleLessonProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (completed) {
        // Upsert progress record
        const { error } = await supabase
          .from('lesson_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,lesson_id',
          });

        if (error) throw error;
      } else {
        // Update to incomplete
        const { error } = await supabase
          .from('lesson_progress')
          .update({ completed: false, completed_at: null })
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['module-lessons'] });
    },
  });
}

// Enroll in a course
export function useEnrollCourse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('enrollments')
        .upsert({
          user_id: user.id,
          course_id: courseId,
        }, {
          onConflict: 'user_id,course_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}
