import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CourseCard } from '@/components/courses/CourseCard';
import { useCourses, useCategories } from '@/hooks/useCourses';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, Loader2 } from 'lucide-react';

export default function Courses() {
  const { t } = useLanguage();
  const { data: courses = [], isLoading, error } = useCourses();
  const { data: categories = [] } = useCategories();
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    
    const matchesCategory = category === 'all' || course.category_name === category;
    const matchesLevel = level === 'all' || course.level === level;
    
    let matchesStatus = true;
    if (status === 'completed') {
      matchesStatus = course.completed_lessons === course.lessons_count && course.lessons_count > 0;
    } else if (status === 'in_progress') {
      matchesStatus = course.completed_lessons > 0 && course.completed_lessons < course.lessons_count;
    } else if (status === 'not_started') {
      matchesStatus = course.completed_lessons === 0;
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setLevel('all');
    setStatus('all');
  };

  const hasActiveFilters = search || category !== 'all' || level !== 'all' || status !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t.common.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.courses.allCourses}
        </h1>
        <p className="text-muted-foreground mt-1">
          {filteredCourses.length} {t.courses.lessons}
        </p>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.filters.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder={t.filters.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filters.all}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder={t.filters.level} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filters.all}</SelectItem>
              <SelectItem value="beginner">{t.courses.beginner}</SelectItem>
              <SelectItem value="intermediate">{t.courses.intermediate}</SelectItem>
              <SelectItem value="advanced">{t.courses.advanced}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder={t.filters.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filters.all}</SelectItem>
              <SelectItem value="completed">{t.courses.completed}</SelectItem>
              <SelectItem value="in_progress">{t.courses.inProgress}</SelectItem>
              <SelectItem value="not_started">{t.courses.notStarted}</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="flex-shrink-0">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            id={course.id}
            title={course.title}
            description={course.description || ''}
            category={course.category_name || ''}
            level={course.level}
            lessonsCount={course.lessons_count}
            completedLessons={course.completed_lessons}
            duration={course.duration || ''}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No courses found matching your filters.</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            {t.filters.clear}
          </Button>
        </div>
      )}
    </div>
  );
}
