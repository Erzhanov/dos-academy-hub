import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminSubmission {
  id: string;
  lesson_id: string;
  user_id: string;
  submission_url: string | null;
  submission_file_path: string | null;
  notes: string | null;
  status: string;
  feedback: string | null;
  reviewed_at: string | null;
  attempt_no: number | null;
  is_latest: boolean | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  lesson_title: string;
  course_title: string;
  student_name: string | null;
}

export function useAdminHomeworkSubmissions(statusFilter?: string) {
  return useQuery({
    queryKey: ['admin-homework-submissions', statusFilter],
    queryFn: async (): Promise<AdminSubmission[]> => {
      let query = supabase
        .from('homework_submissions')
        .select(`
          *,
          lessons!homework_submissions_lesson_id_fkey (
            title,
            modules (
              courses (title)
            )
          ),
          profiles!homework_submissions_user_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        // If profiles join fails, try without it
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('homework_submissions')
          .select(`
            *,
            lessons!homework_submissions_lesson_id_fkey (
              title,
              modules (
                courses (title)
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;

        return (fallbackData || []).map((sub: any) => ({
          ...sub,
          lesson_title: sub.lessons?.title || 'Unknown',
          course_title: sub.lessons?.modules?.courses?.title || 'Unknown',
          student_name: null,
        }));
      }

      return (data || []).map((sub: any) => ({
        ...sub,
        lesson_title: sub.lessons?.title || 'Unknown',
        course_title: sub.lessons?.modules?.courses?.title || 'Unknown',
        student_name: sub.profiles?.full_name || null,
      }));
    },
  });
}

export function useReviewHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      status,
      feedback,
    }: {
      submissionId: string;
      status: 'approved' | 'rejected';
      feedback?: string;
    }) => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .update({
          status,
          feedback: feedback || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homework-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['homework-submission'] });
    },
  });
}
