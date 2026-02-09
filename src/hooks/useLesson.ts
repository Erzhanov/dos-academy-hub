import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LessonWithModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  has_homework: boolean;
  homework_instructions: string | null;
  homework_attachment_url: string | null;
  order_index: number;
  module_id: string;
  module_title: string;
  module_order_index: number;
  course_id: string;
  course_title: string;
  is_completed: boolean;
}

export interface ModuleLesson {
  id: string;
  title: string;
  order_index: number;
  is_completed: boolean;
}

// Fetch a single lesson with its module and course info
export function useLesson(lessonId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lesson', lessonId, user?.id],
    queryFn: async (): Promise<LessonWithModule | null> => {
      if (!lessonId) return null;

      // Fetch lesson with module and course info
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          video_url,
          duration,
          has_homework,
          homework_instructions,
          homework_attachment_url,
          order_index,
          module_id,
          modules!inner (
            id,
            title,
            order_index,
            course_id,
            courses!inner (
              id,
              title
            )
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      if (!lesson) return null;

      // Fetch user's progress for this lesson
      let isCompleted = false;
      if (user) {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('completed')
          .eq('lesson_id', lessonId)
          .eq('user_id', user.id)
          .maybeSingle();

        isCompleted = progress?.completed ?? false;
      }

      const module = lesson.modules as { id: string; title: string; order_index: number; course_id: string; courses: { id: string; title: string } };

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        video_url: lesson.video_url,
        duration: lesson.duration,
        has_homework: lesson.has_homework,
        homework_instructions: lesson.homework_instructions,
        homework_attachment_url: lesson.homework_attachment_url,
        order_index: lesson.order_index,
        module_id: module.id,
        module_title: module.title,
        module_order_index: module.order_index,
        course_id: module.courses.id,
        course_title: module.courses.title,
        is_completed: isCompleted,
      };
    },
    enabled: !!lessonId,
  });
}

// Fetch all lessons in the same module with completion status
export function useModuleLessons(moduleId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['module-lessons', moduleId, user?.id],
    queryFn: async (): Promise<ModuleLesson[]> => {
      if (!moduleId) return [];

      // Fetch all lessons in the module
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (!lessons || lessons.length === 0) return [];

      // Fetch user's progress for all lessons in this module
      const lessonIds = lessons.map(l => l.id);
      let progressMap: Record<string, boolean> = {};

      if (user) {
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id)
          .in('lesson_id', lessonIds);

        if (progressData) {
          progressMap = progressData.reduce((acc, p) => {
            acc[p.lesson_id] = p.completed;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }

      return lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        order_index: lesson.order_index,
        is_completed: progressMap[lesson.id] ?? false,
      }));
    },
    enabled: !!moduleId,
  });
}
