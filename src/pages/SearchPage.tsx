import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');

  const t = {
    kk: {
      title: 'Іздеу',
      placeholder: 'Курс немесе сабақ іздеу...',
      courses: 'Курстар',
      lessons: 'Сабақтар',
      noResults: 'Нәтиже табылмады',
      hint: 'Курс немесе сабақ атауын жазыңыз',
    },
    ru: {
      title: 'Поиск',
      placeholder: 'Поиск курсов и уроков...',
      courses: 'Курсы',
      lessons: 'Уроки',
      noResults: 'Ничего не найдено',
      hint: 'Введите название курса или урока',
    },
  }[language];

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return { courses: [], lessons: [] };

      const q = `%${query}%`;

      const [coursesRes, lessonsRes] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, description, level')
          .eq('is_published', true)
          .or(`title.ilike.${q},description.ilike.${q}`)
          .limit(10),
        supabase
          .from('lessons')
          .select('id, title, description, module_id, modules(course_id)')
          .or(`title.ilike.${q},description.ilike.${q}`)
          .limit(10),
      ]);

      return {
        courses: coursesRes.data || [],
        lessons: lessonsRes.data || [],
      };
    },
    enabled: query.length >= 2,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          className="pl-11 h-12 text-lg"
          autoFocus
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {query.length < 2 && (
        <p className="text-center text-muted-foreground py-12">{t.hint}</p>
      )}

      {results && query.length >= 2 && (
        <div className="space-y-6">
          {results.courses.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {t.courses}
              </h2>
              <div className="space-y-2">
                {results.courses.map((course) => (
                  <Link key={course.id} to={`/app/courses/${course.id}`}>
                    <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                      <CardContent className="py-3 px-4">
                        <p className="font-medium text-foreground">{course.title}</p>
                        {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.lessons.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t.lessons}
              </h2>
              <div className="space-y-2">
                {results.lessons.map((lesson) => (
                  <Link key={lesson.id} to={`/app/lessons/${lesson.id}`}>
                    <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                      <CardContent className="py-3 px-4">
                        <p className="font-medium text-foreground">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.courses.length === 0 && results.lessons.length === 0 && (
            <p className="text-center text-muted-foreground py-12">{t.noResults}</p>
          )}
        </div>
      )}
    </div>
  );
}
