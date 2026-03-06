
ALTER TABLE public.homework_submissions 
ADD COLUMN IF NOT EXISTS feedback text,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
