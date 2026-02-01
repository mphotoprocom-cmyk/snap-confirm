-- Add template field to wedding_invitations
ALTER TABLE public.wedding_invitations 
ADD COLUMN template TEXT NOT NULL DEFAULT 'classic';

-- Create invitation gallery images table
CREATE TABLE public.invitation_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES public.wedding_invitations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitation_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitation_images
CREATE POLICY "Users can view their own invitation images"
ON public.invitation_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invitation images"
ON public.invitation_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invitation images"
ON public.invitation_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invitation images"
ON public.invitation_images FOR DELETE
USING (auth.uid() = user_id);

-- Update get_invitation_by_token to include images
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
  
  -- Build result with invitation info, images, and profile
  SELECT json_build_object(
    'invitation', row_to_json(invitation_record),
    'images', (
      SELECT COALESCE(json_agg(row_to_json(i) ORDER BY i.sort_order, i.created_at), '[]'::json) 
      FROM public.invitation_images i 
      WHERE i.invitation_id = invitation_record.id
    ),
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