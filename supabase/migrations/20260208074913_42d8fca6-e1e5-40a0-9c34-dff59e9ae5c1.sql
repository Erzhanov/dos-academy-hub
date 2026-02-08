-- Drop existing policy and create new one that allows unauthenticated users to see published courses
DROP POLICY IF EXISTS "Published courses are viewable by authenticated" ON public.courses;

CREATE POLICY "Published courses are viewable by everyone"
ON public.courses
FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

-- Also update modules policy to allow viewing if course is published
DROP POLICY IF EXISTS "Modules viewable if course is accessible" ON public.modules;

CREATE POLICY "Modules viewable if course is accessible"
ON public.modules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = modules.course_id 
    AND (c.is_published = true OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Update lessons policy similarly
DROP POLICY IF EXISTS "Lessons viewable if course is accessible" ON public.lessons;

CREATE POLICY "Lessons viewable if course is accessible"
ON public.lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id
    AND (c.is_published = true OR has_role(auth.uid(), 'admin'::app_role))
  )
);