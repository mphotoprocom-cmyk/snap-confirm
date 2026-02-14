
ALTER TABLE public.wedding_invitations
ADD COLUMN section_backgrounds jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.wedding_invitations.section_backgrounds IS 'Per-section background images and opacity. Format: { "hero": { "image_url": "...", "opacity": 0.5 }, ... }';
