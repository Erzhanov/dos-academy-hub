-- Add unique constraint for user_id and lesson_id on lesson_progress
ALTER TABLE public.lesson_progress
ADD CONSTRAINT lesson_progress_user_lesson_unique UNIQUE (user_id, lesson_id);