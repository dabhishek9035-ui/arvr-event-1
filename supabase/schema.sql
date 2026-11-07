-- ==============================================================================
-- AR/VR Workshop Registration Schema (Supabase)
-- Project ID: ofltdenhtlpykwjbqmwl
-- Cap: 100 registrations, 40 to be shortlisted
-- ==============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  usn TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  section TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT NOT NULL,
  github_url TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  prior_experience TEXT NOT NULL,
  why_attend TEXT NOT NULL,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  laptop_specs TEXT NOT NULL,
  shortlisted BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT unique_usn UNIQUE (usn),
  CONSTRAINT unique_email UNIQUE (email)
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_registrations_usn ON public.registrations(usn);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);

-- 3. Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon) to insert a new registration
DROP POLICY IF EXISTS "Allow public registration insert" ON public.registrations;
CREATE POLICY "Allow public registration insert"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading count and records (publicly readable for count checks & status)
DROP POLICY IF EXISTS "Allow public registration read" ON public.registrations;
CREATE POLICY "Allow public registration read"
ON public.registrations
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Database-level trigger to strictly cap registrations at 100
CREATE OR REPLACE FUNCTION check_registration_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.registrations;
  IF current_count >= 100 THEN
    RAISE EXCEPTION 'Registration limit reached. Maximum 100 registrations allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_registration_limit ON public.registrations;
CREATE TRIGGER trg_check_registration_limit
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION check_registration_limit();

-- 5. Helper view to view candidate list and manage shortlisting (40 members)
CREATE OR REPLACE VIEW public.shortlist_view AS
SELECT 
  id,
  full_name,
  usn,
  phone,
  email,
  branch,
  semester,
  section,
  prior_experience,
  why_attend,
  laptop_specs,
  shortlisted,
  created_at
FROM public.registrations
ORDER BY created_at ASC;
