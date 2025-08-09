-- Ensure RLS is enabled and allow inserts for Photographers, and set default rating to 3.5
ALTER TABLE public."Photographers" ENABLE ROW LEVEL SECURITY;

-- Set default rating to 3.5 for new photographers
ALTER TABLE public."Photographers"
  ALTER COLUMN rating SET DEFAULT 3.5;

-- Create INSERT policy to allow creating photographer rows
CREATE POLICY "Anyone can insert photographers"
  ON public."Photographers"
  FOR INSERT
  TO public
  WITH CHECK (true);
