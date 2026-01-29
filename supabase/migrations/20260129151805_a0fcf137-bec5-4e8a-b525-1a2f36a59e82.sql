-- Create table for public share tokens
CREATE TABLE public.share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  
  -- Ensure only one of booking_id or quotation_id is set
  CONSTRAINT share_token_target CHECK (
    (booking_id IS NOT NULL AND quotation_id IS NULL) OR
    (booking_id IS NULL AND quotation_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;

-- Users can create tokens for their own bookings/quotations
CREATE POLICY "Users can create share tokens for own bookings"
ON public.share_tokens
FOR INSERT
WITH CHECK (
  (booking_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid()
  )) OR
  (quotation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.quotations WHERE id = quotation_id AND user_id = auth.uid()
  ))
);

-- Users can view their own tokens
CREATE POLICY "Users can view own share tokens"
ON public.share_tokens
FOR SELECT
USING (
  (booking_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid()
  )) OR
  (quotation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.quotations WHERE id = quotation_id AND user_id = auth.uid()
  ))
);

-- Users can delete their own tokens
CREATE POLICY "Users can delete own share tokens"
ON public.share_tokens
FOR DELETE
USING (
  (booking_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid()
  )) OR
  (quotation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.quotations WHERE id = quotation_id AND user_id = auth.uid()
  ))
);

-- Create function to get share data by token (public access)
CREATE OR REPLACE FUNCTION public.get_share_data(share_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  token_record RECORD;
BEGIN
  -- Find the token
  SELECT * INTO token_record FROM public.share_tokens 
  WHERE token = share_token AND (expires_at IS NULL OR expires_at > now());
  
  IF token_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get booking or quotation data with profile
  IF token_record.booking_id IS NOT NULL THEN
    SELECT json_build_object(
      'type', 'booking',
      'data', row_to_json(b),
      'profile', row_to_json(p)
    ) INTO result
    FROM public.bookings b
    LEFT JOIN public.profiles p ON p.user_id = b.user_id
    WHERE b.id = token_record.booking_id;
  ELSE
    SELECT json_build_object(
      'type', 'quotation',
      'data', row_to_json(q),
      'profile', row_to_json(p)
    ) INTO result
    FROM public.quotations q
    LEFT JOIN public.profiles p ON p.user_id = q.user_id
    WHERE q.id = token_record.quotation_id;
  END IF;
  
  RETURN result;
END;
$$;

-- Create function to accept quotation by token (public access)
CREATE OR REPLACE FUNCTION public.accept_quotation_by_token(share_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Find the token
  SELECT * INTO token_record FROM public.share_tokens 
  WHERE token = share_token AND quotation_id IS NOT NULL AND (expires_at IS NULL OR expires_at > now());
  
  IF token_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update quotation status to accepted
  UPDATE public.quotations 
  SET status = 'accepted', updated_at = now()
  WHERE id = token_record.quotation_id;
  
  RETURN TRUE;
END;
$$;