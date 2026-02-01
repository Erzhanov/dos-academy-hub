import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CourseCard } from '@/components/courses/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

// Mock data
const MOCK_COURSES = [
  {
    id: '1',
    title: 'Python негіздері',
    description: 'Python бағдарламалау тілін нөлден үйреніңіз.',
    category: 'Бағдарламалау',
    level: 'beginner' as const,
    lessonsCount: 24,
    completedLessons: 18,
    duration: '12 сағ',
  },
  {
    id: '2',
    title: 'Web-әзірлеу: HTML/CSS',
    description: 'Веб-сайттар құруды үйреніңіз.',
    category: 'Web Development',
    level: 'beginner' as const,
    lessonsCount: 20,
    completedLessons: 20,
    duration: '10 сағ',
  },
  {
    id: '3',
    title: 'JavaScript Advanced',
    description: 'JavaScript тілінің advanced тақырыптары.',
    category: 'Web Development',
    level: 'advanced' as const,
    lessonsCount: 30,
    completedLessons: 5,
    duration: '15 сағ',
  },
  {
    id: '4',
    title: 'React негіздері',
    description: 'React кітапханасымен қосымшалар құру.',
    category: 'Frontend',
    level: 'intermediate' as const,
    lessonsCount: 28,
    completedLessons: 0,
    duration: '14 сағ',
  },
  {
    id: '5',
    title: 'Node.js Backend',
    description: 'Backend әзірлеуді Node.js арқылы үйреніңіз.',
    category: 'Backend',
    level: 'intermediate' as const,
    lessonsCount: 32,
    completedLessons: 10,
    duration: '16 сағ',
  },
  {
    id: '6',
    title: 'SQL және деректер қоры',
    description: 'SQL тілі және PostgreSQL деректер қорымен жұмыс.',
    category: 'Database',
    level: 'beginner' as const,
    lessonsCount: 18,
    completedLessons: 0,
    duration: '9 сағ',
  },
];

const CATEGORIES = ['Барлығы', 'Бағдарламалау', 'Web Development', 'Frontend', 'Backend', 'Database'];

export default function Courses() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');

  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === 'all' || course.category === category;
    const matchesLevel = level === 'all' || course.level === level;
    
    let matchesStatus = true;
    if (status === 'completed') {
      matchesStatus = course.completedLessons === course.lessonsCount;
    } else if (status === 'in_progress') {
      matchesStatus = course.completedLessons > 0 && course.completedLessons < course.lessonsCount;
    } else if (status === 'not_started') {
      matchesStatus = course.completedLessons === 0;
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
              {CATEGORIES.slice(1).map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
          <CourseCard key={course.id} {...course} />
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
