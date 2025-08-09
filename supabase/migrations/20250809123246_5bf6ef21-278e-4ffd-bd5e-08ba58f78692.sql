
ALTER TABLE public.photographers
ADD COLUMN IF NOT EXISTS avatar_url text;
