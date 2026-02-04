import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  lessons_count: number;
  completed_lessons: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  has_homework: boolean;
  order_index: number;
  completed: boolean;
}

// Fetch all courses with enrollment and progress data
export function useCourses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courses', user?.id],
    queryFn: async () => {
      // Fetch courses with category names
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          category_id,
          level,
          duration,
          thumbnail_url,
          is_published,
          categories (name)
        `)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Fetch lesson counts per course
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, course_id');

      if (modulesError) throw modulesError;

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, module_id');

      if (lessonsError) throw lessonsError;

      // Fetch user's progress
      let progressMap: Record<string, boolean> = {};
      if (user) {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id);

        if (progress) {
          progressMap = progress.reduce((acc, p) => {
            if (p.completed) acc[p.lesson_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }

      // Map modules to courses
      const modulesByCourse: Record<string, string[]> = {};
      modules?.forEach(m => {
        if (!modulesByCourse[m.course_id]) modulesByCourse[m.course_id] = [];
        modulesByCourse[m.course_id].push(m.id);
      });

      // Map lessons to modules
      const lessonsByModule: Record<string, string[]> = {};
      lessons?.forEach(l => {
        if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
        lessonsByModule[l.module_id].push(l.id);
      });

      // Calculate lesson counts and progress
      return courses?.map(course => {
        const courseModuleIds = modulesByCourse[course.id] || [];
        const courseLessonIds = courseModuleIds.flatMap(mId => lessonsByModule[mId] || []);
        const completedLessonIds = courseLessonIds.filter(lid => progressMap[lid]);

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          category_id: course.category_id,
          category_name: (course.categories as { name: string } | null)?.name || null,
          level: course.level as 'beginner' | 'intermediate' | 'advanced',
          duration: course.duration,
          thumbnail_url: course.thumbnail_url,
          is_published: course.is_published,
          lessons_count: courseLessonIds.length,
          completed_lessons: completedLessonIds.length,
        };
      }) || [];
    },
    enabled: true,
  });
}

// Fetch a single course with modules and lessons
export function useCourseDetail(courseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course', courseId, user?.id],
    queryFn: async () => {
      if (!courseId) return null;

      // Fetch course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          category_id,
          level,
          duration,
          thumbnail_url,
          is_published,
          categories (name)
        `)
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!course) return null;

      // Fetch modules
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, course_id, title, order_index')
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;

      // Fetch lessons
      const moduleIds = modules?.map(m => m.id) || [];
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, module_id, title, description, video_url, duration, has_homework, order_index')
        .in('module_id', moduleIds.length > 0 ? moduleIds : [''])
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Fetch user's progress
      let progressMap: Record<string, boolean> = {};
      if (user) {
        const lessonIds = lessons?.map(l => l.id) || [];
        if (lessonIds.length > 0) {
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);

          if (progress) {
            progressMap = progress.reduce((acc, p) => {
              if (p.completed) acc[p.lesson_id] = true;
              return acc;
            }, {} as Record<string, boolean>);
          }
        }
      }

      // Build modules with lessons
      const modulesWithLessons: Module[] = (modules || []).map(module => ({
        id: module.id,
        course_id: module.course_id,
        title: module.title,
        order_index: module.order_index,
        lessons: (lessons || [])
          .filter(l => l.module_id === module.id)
          .map(l => ({
            id: l.id,
            module_id: l.module_id,
            title: l.title,
            description: l.description,
            video_url: l.video_url,
            duration: l.duration,
            has_homework: l.has_homework,
            order_index: l.order_index,
            completed: progressMap[l.id] || false,
          })),
      }));

      const totalLessons = modulesWithLessons.reduce((acc, m) => acc + m.lessons.length, 0);
      const completedLessons = modulesWithLessons.reduce(
        (acc, m) => acc + m.lessons.filter(l => l.completed).length,
        0
      );

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category_name: (course.categories as { name: string } | null)?.name || null,
        level: course.level as 'beginner' | 'intermediate' | 'advanced',
        duration: course.duration,
        is_published: course.is_published,
        modules: modulesWithLessons,
        lessons_count: totalLessons,
        completed_lessons: completedLessons,
      };
    },
    enabled: !!courseId,
  });
}

// Fetch categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}
