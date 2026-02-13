
-- Add new fields for enhanced invitation templates
ALTER TABLE public.wedding_invitations
  ADD COLUMN IF NOT EXISTS timeline_events jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dress_code text,
  ADD COLUMN IF NOT EXISTS dress_code_colors jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS accommodation_info text,
  ADD COLUMN IF NOT EXISTS accommodation_links jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS registry_info text,
  ADD COLUMN IF NOT EXISTS registry_url text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

-- Add comments for clarity
COMMENT ON COLUMN public.wedding_invitations.timeline_events IS 'JSON array of {time, title, icon} objects for the day schedule';
COMMENT ON COLUMN public.wedding_invitations.dress_code_colors IS 'JSON array of hex color strings for dress code palette';
COMMENT ON COLUMN public.wedding_invitations.accommodation_links IS 'JSON array of {name, url} objects for hotel booking links';
