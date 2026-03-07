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
  score: number | null;
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

export interface StudentStats {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_submissions: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  average_score: number | null;
  submissions: AdminSubmission[];
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

export function useStudentDetail(userId: string) {
  return useQuery({
    queryKey: ['admin-student-detail', userId],
    enabled: !!userId,
    queryFn: async (): Promise<StudentStats> => {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', userId)
        .single();

      // Fetch all submissions for this student
      const { data: submissions, error } = await supabase
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (submissions || []).map((sub: any) => ({
        ...sub,
        lesson_title: sub.lessons?.title || 'Unknown',
        course_title: sub.lessons?.modules?.courses?.title || 'Unknown',
        student_name: profile?.full_name || null,
      }));

      const scores = mapped.filter((s: any) => s.score != null).map((s: any) => s.score as number);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : null;

      return {
        user_id: userId,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
        total_submissions: mapped.length,
        approved_count: mapped.filter((s: any) => s.status === 'approved').length,
        rejected_count: mapped.filter((s: any) => s.status === 'rejected').length,
        pending_count: mapped.filter((s: any) => s.status === 'submitted').length,
        average_score: avgScore,
        submissions: mapped,
      };
    },
  });
}

export function useAllStudentsStats() {
  return useQuery({
    queryKey: ['admin-all-students-stats'],
    queryFn: async () => {
      const { data: submissions, error } = await supabase
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
            full_name, avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by user
      const byUser: Record<string, StudentStats> = {};
      for (const sub of submissions || []) {
        const s = sub as any;
        const uid = s.user_id;
        if (!byUser[uid]) {
          byUser[uid] = {
            user_id: uid,
            full_name: s.profiles?.full_name || null,
            avatar_url: s.profiles?.avatar_url || null,
            total_submissions: 0,
            approved_count: 0,
            rejected_count: 0,
            pending_count: 0,
            average_score: null,
            submissions: [],
          };
        }
        const mapped = {
          ...s,
          lesson_title: s.lessons?.title || 'Unknown',
          course_title: s.lessons?.modules?.courses?.title || 'Unknown',
          student_name: s.profiles?.full_name || null,
        };
        byUser[uid].submissions.push(mapped);
        byUser[uid].total_submissions++;
        if (s.status === 'approved') byUser[uid].approved_count++;
        if (s.status === 'rejected') byUser[uid].rejected_count++;
        if (s.status === 'submitted') byUser[uid].pending_count++;
      }

      // Calculate averages
      for (const uid in byUser) {
        const scores = byUser[uid].submissions.filter(s => s.score != null).map(s => s.score as number);
        byUser[uid].average_score = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;
      }

      return Object.values(byUser);
    },
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['admin-weekly-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('created_at, status, score')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by week
      const weeks: Record<string, { week: string; total: number; approved: number; rejected: number; pending: number; avgScore: number | null; scores: number[] }> = {};

      for (const sub of data || []) {
        const d = new Date(sub.created_at);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay() + 1); // Monday
        const key = weekStart.toISOString().slice(0, 10);
        
        if (!weeks[key]) {
          weeks[key] = { week: key, total: 0, approved: 0, rejected: 0, pending: 0, avgScore: null, scores: [] };
        }
        weeks[key].total++;
        if (sub.status === 'approved') weeks[key].approved++;
        if (sub.status === 'rejected') weeks[key].rejected++;
        if (sub.status === 'submitted') weeks[key].pending++;
        if (sub.score != null) weeks[key].scores.push(sub.score);
      }

      return Object.values(weeks).map(w => ({
        ...w,
        avgScore: w.scores.length > 0 ? Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length) : null,
        scores: undefined,
      })).sort((a, b) => a.week.localeCompare(b.week));
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
      score,
    }: {
      submissionId: string;
      status: 'approved' | 'rejected';
      feedback?: string;
      score?: number;
    }) => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .update({
          status,
          feedback: feedback || null,
          score: score ?? null,
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
      queryClient.invalidateQueries({ queryKey: ['admin-student-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-students-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-weekly-stats'] });
    },
  });
}
