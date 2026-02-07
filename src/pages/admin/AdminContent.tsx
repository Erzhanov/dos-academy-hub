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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, FolderOpen, BookOpen, Layers, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminCategories,
  useAdminCourses,
  useAdminModules,
  useAdminLessons,
  useDeleteCategory,
  useDeleteCourse,
  useDeleteModule,
  useDeleteLesson,
  useUpdateCourse,
} from '@/hooks/useAdminContent';
import { CategoryDialog } from '@/components/admin/CategoryDialog';
import { CourseDialog } from '@/components/admin/CourseDialog';
import { ModuleDialog } from '@/components/admin/ModuleDialog';
import { LessonDialog } from '@/components/admin/LessonDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Tables } from '@/integrations/supabase/types';

export default function AdminContent() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('categories');

  // Dialogs state
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; item: Tables<'categories'> | null }>({ open: false, item: null });
  const [courseDialog, setCourseDialog] = useState<{ open: boolean; item: Tables<'courses'> | null }>({ open: false, item: null });
  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; item: Tables<'modules'> | null }>({ open: false, item: null });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; item: Tables<'lessons'> | null }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({ open: false, type: '', id: '', name: '' });

  // Data hooks
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const { data: courses, isLoading: coursesLoading } = useAdminCourses();
  const { data: modules, isLoading: modulesLoading } = useAdminModules();
  const { data: lessons, isLoading: lessonsLoading } = useAdminLessons();

  // Delete mutations
  const deleteCategory = useDeleteCategory();
  const deleteCourse = useDeleteCourse();
  const deleteModule = useDeleteModule();
  const deleteLesson = useDeleteLesson();
  const updateCourse = useUpdateCourse();

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  const handleDelete = async () => {
    try {
      switch (deleteDialog.type) {
        case 'category':
          await deleteCategory.mutateAsync(deleteDialog.id);
          break;
        case 'course':
          await deleteCourse.mutateAsync(deleteDialog.id);
          break;
        case 'module':
          await deleteModule.mutateAsync(deleteDialog.id);
          break;
        case 'lesson':
          await deleteLesson.mutateAsync(deleteDialog.id);
          break;
      }
      toast({ title: `${deleteDialog.type.charAt(0).toUpperCase() + deleteDialog.type.slice(1)} deleted successfully` });
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to delete',
        variant: 'destructive' 
      });
    }
  };

  const toggleCoursePublish = async (course: { id: string; is_published: boolean }) => {
    try {
      await updateCourse.mutateAsync({ id: course.id, is_published: !course.is_published });
      toast({ title: course.is_published ? 'Course unpublished' : 'Course published' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update course', variant: 'destructive' });
    }
  };

  const isDeletePending = deleteCategory.isPending || deleteCourse.isPending || deleteModule.isPending || deleteLesson.isPending;

  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );

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
            <Button className="btn-primary-gradient gap-2" onClick={() => setCategoryDialog({ open: true, item: null })}>
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            {categoriesLoading ? (
              <div className="p-4"><LoadingSkeleton /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No categories yet. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                  {categories?.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => setCategoryDialog({ open: true, item: category })}>
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => setDeleteDialog({ open: true, type: 'category', id: category.id, name: category.name })}
                            >
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
            )}
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button className="btn-primary-gradient gap-2" onClick={() => setCourseDialog({ open: true, item: null })}>
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            {coursesLoading ? (
              <div className="p-4"><LoadingSkeleton /></div>
            ) : (
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
                  {courses?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No courses yet. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                  {courses?.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell className="text-muted-foreground">{course.category_name || '-'}</TableCell>
                      <TableCell>{course.modules_count}</TableCell>
                      <TableCell>{course.lessons_count}</TableCell>
                      <TableCell>
                        <Badge variant={course.is_published ? 'default' : 'secondary'}>
                          {course.is_published ? t.admin.published : t.admin.draft}
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
                            <DropdownMenuItem className="gap-2" onClick={() => setCourseDialog({ open: true, item: course })}>
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => toggleCoursePublish(course)}>
                              {course.is_published ? (
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
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => setDeleteDialog({ open: true, type: 'course', id: course.id, name: course.title })}
                            >
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
            )}
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button className="btn-primary-gradient gap-2" onClick={() => setModuleDialog({ open: true, item: null })}>
              <Plus className="w-4 h-4" />
              Add Module
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            {modulesLoading ? (
              <div className="p-4"><LoadingSkeleton /></div>
            ) : (
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
                  {modules?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No modules yet. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                  {modules?.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-mono text-muted-foreground">{module.order_index}</TableCell>
                      <TableCell className="font-medium">{module.title}</TableCell>
                      <TableCell className="text-muted-foreground">{module.course_title || '-'}</TableCell>
                      <TableCell>{module.lessons_count}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => setModuleDialog({ open: true, item: module })}>
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => setDeleteDialog({ open: true, type: 'module', id: module.id, name: module.title })}
                            >
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
            )}
          </div>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button className="btn-primary-gradient gap-2" onClick={() => setLessonDialog({ open: true, item: null })}>
              <Plus className="w-4 h-4" />
              Add Lesson
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            {lessonsLoading ? (
              <div className="p-4"><LoadingSkeleton /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessons?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No lessons yet. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                  {lessons?.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-mono text-muted-foreground">{lesson.order_index}</TableCell>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell className="text-muted-foreground">{lesson.module_title || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{lesson.course_title || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => setLessonDialog({ open: true, item: lesson })}>
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => setDeleteDialog({ open: true, type: 'lesson', id: lesson.id, name: lesson.title })}
                            >
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
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CategoryDialog 
        open={categoryDialog.open} 
        onOpenChange={(open) => setCategoryDialog({ open, item: null })}
        category={categoryDialog.item}
      />
      <CourseDialog 
        open={courseDialog.open} 
        onOpenChange={(open) => setCourseDialog({ open, item: null })}
        course={courseDialog.item}
      />
      <ModuleDialog 
        open={moduleDialog.open} 
        onOpenChange={(open) => setModuleDialog({ open, item: null })}
        module={moduleDialog.item}
      />
      <LessonDialog 
        open={lessonDialog.open} 
        onOpenChange={(open) => setLessonDialog({ open, item: null })}
        lesson={lessonDialog.item}
      />
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.type}?`}
        description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        isPending={isDeletePending}
      />
    </div>
  );
}
