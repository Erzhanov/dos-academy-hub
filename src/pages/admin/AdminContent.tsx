import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, FolderOpen, BookOpen, Layers, GraduationCap } from 'lucide-react';

// Mock content data
const CATEGORIES = [
  { id: '1', name: 'Бағдарламалау', coursesCount: 4, parentId: null },
  { id: '2', name: 'Web Development', coursesCount: 5, parentId: null },
  { id: '3', name: 'Database', coursesCount: 2, parentId: null },
];

const COURSES = [
  { id: '1', title: 'Python негіздері', category: 'Бағдарламалау', modulesCount: 6, lessonsCount: 24, isPublished: true },
  { id: '2', title: 'Web-әзірлеу: HTML/CSS', category: 'Web Development', modulesCount: 5, lessonsCount: 20, isPublished: true },
  { id: '3', title: 'JavaScript Advanced', category: 'Web Development', modulesCount: 8, lessonsCount: 30, isPublished: false },
];

const MODULES = [
  { id: '1', title: 'Кіріспе', course: 'Python негіздері', lessonsCount: 4, orderIndex: 1 },
  { id: '2', title: 'Деректер типтері', course: 'Python негіздері', lessonsCount: 5, orderIndex: 2 },
  { id: '3', title: 'HTML Basics', course: 'Web-әзірлеу: HTML/CSS', lessonsCount: 6, orderIndex: 1 },
];

const LESSONS = [
  { id: '1', title: 'Python дегеніміз не?', module: 'Кіріспе', orderIndex: 1, isPublished: true },
  { id: '2', title: 'Python орнату', module: 'Кіріспе', orderIndex: 2, isPublished: true },
  { id: '3', title: 'HTML тегтері', module: 'HTML Basics', orderIndex: 1, isPublished: true },
];

export default function AdminContent() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('categories');

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.admin.content}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage categories, courses, modules, and lessons
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{t.admin.categories}</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{t.admin.courses}</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">{t.admin.modules}</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">{t.admin.lessons}</span>
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button className="btn-primary-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORIES.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.coursesCount} courses</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button className="btn-primary-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COURSES.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="text-muted-foreground">{course.category}</TableCell>
                    <TableCell>{course.modulesCount}</TableCell>
                    <TableCell>{course.lessonsCount}</TableCell>
                    <TableCell>
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? t.admin.published : t.admin.draft}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            {course.isPublished ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                {t.admin.unpublish}
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                {t.admin.publish}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button className="btn-primary-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Module
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-mono text-muted-foreground">{module.orderIndex}</TableCell>
                    <TableCell className="font-medium">{module.title}</TableCell>
                    <TableCell className="text-muted-foreground">{module.course}</TableCell>
                    <TableCell>{module.lessonsCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button className="btn-primary-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Lesson
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LESSONS.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-mono text-muted-foreground">{lesson.orderIndex}</TableCell>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell className="text-muted-foreground">{lesson.module}</TableCell>
                    <TableCell>
                      <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                        {lesson.isPublished ? t.admin.published : t.admin.draft}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            {lesson.isPublished ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                {t.admin.unpublish}
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                {t.admin.publish}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
