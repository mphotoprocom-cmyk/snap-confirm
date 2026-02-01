-- Create wedding invitations table
CREATE TABLE public.wedding_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  
  -- Access
  access_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Couple info
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  
  -- Event details
  event_date DATE NOT NULL,
  event_time TIME,
  ceremony_time TIME,
  reception_time TIME,
  
  -- Venue
  venue_name TEXT,
  venue_address TEXT,
  google_maps_url TEXT,
  google_maps_embed_url TEXT,
  
  -- Design
  cover_image_url TEXT,
  theme_color TEXT DEFAULT '#d4af37',
  message TEXT,
  
  -- RSVP settings
  rsvp_enabled BOOLEAN NOT NULL DEFAULT true,
  rsvp_deadline DATE,
  
  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RSVP responses table
CREATE TABLE public.invitation_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES public.wedding_invitations(id) ON DELETE CASCADE,
  
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  attending BOOLEAN NOT NULL,
  guest_count INTEGER DEFAULT 1,
  message TEXT,
  dietary_requirements TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wedding_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS policies for wedding_invitations
CREATE POLICY "Users can view their own invitations"
ON public.wedding_invitations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invitations"
ON public.wedding_invitations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invitations"
ON public.wedding_invitations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invitations"
ON public.wedding_invitations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for invitation_rsvps (anyone can insert, owner can view)
CREATE POLICY "Anyone can submit RSVP"
ON public.invitation_rsvps FOR INSERT
WITH CHECK (true);

CREATE POLICY "Invitation owners can view RSVPs"
ON public.invitation_rsvps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_invitations 
    WHERE id = invitation_rsvps.invitation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Invitation owners can delete RSVPs"
ON public.invitation_rsvps FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_invitations 
    WHERE id = invitation_rsvps.invitation_id 
    AND user_id = auth.uid()
  )
);

-- Create function to get invitation by token (public)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_access_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  invitation_record RECORD;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record 
  FROM public.wedding_invitations 
  WHERE access_token = p_access_token 
    AND is_active = true;
  
  IF invitation_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Increment view count
  UPDATE public.wedding_invitations 
  SET view_count = view_count + 1
  WHERE id = invitation_record.id;
  
  -- Build result with invitation info and profile
  SELECT json_build_object(
    'invitation', row_to_json(invitation_record),
    'rsvp_count', (
      SELECT json_build_object(
        'attending', COALESCE(SUM(CASE WHEN attending THEN guest_count ELSE 0 END), 0),
        'not_attending', COALESCE(COUNT(*) FILTER (WHERE NOT attending), 0)
      )
      FROM public.invitation_rsvps 
      WHERE invitation_id = invitation_record.id
    ),
    'profile', (
      SELECT row_to_json(p) 
      FROM public.profiles p 
      WHERE p.user_id = invitation_record.user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_wedding_invitations_updated_at
BEFORE UPDATE ON public.wedding_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();