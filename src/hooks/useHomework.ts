import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HomeworkSubmission {
  id: string;
  lesson_id: string;
  user_id: string;
  submission_url: string | null;
  notes: string | null;
  status: string;
  feedback: string | null;
  score: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useHomeworkSubmission(lessonId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['homework-submission', lessonId, user?.id],
    queryFn: async (): Promise<HomeworkSubmission | null> => {
      if (!lessonId || !user) return null;

      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId && !!user,
  });
}

export function useSubmitHomework() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      lessonId,
      submissionUrl,
      notes,
    }: {
      lessonId: string;
      submissionUrl?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if submission already exists
      const { data: existing } = await supabase
        .from('homework_submissions')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('homework_submissions')
          .update({
            submission_url: submissionUrl || null,
            notes: notes || null,
            status: 'submitted',
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('homework_submissions')
          .insert({
            lesson_id: lessonId,
            user_id: user.id,
            submission_url: submissionUrl || null,
            notes: notes || null,
            status: 'submitted',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homework-submission', variables.lessonId] });
    },
  });
}
