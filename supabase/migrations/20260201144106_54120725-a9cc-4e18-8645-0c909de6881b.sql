-- Create storage bucket for delivery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('delivery-images', 'delivery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for delivery-images bucket
CREATE POLICY "Delivery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'delivery-images');

CREATE POLICY "Users can upload their own delivery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'delivery-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own delivery images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'delivery-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own delivery images"
ON storage.objects FOR DELETE
USING (bucket_id = 'delivery-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create delivery_galleries table
CREATE TABLE public.delivery_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  description TEXT,
  access_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_images table
CREATE TABLE public.delivery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES public.delivery_galleries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_size INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for delivery_galleries
CREATE POLICY "Users can view their own delivery galleries"
ON public.delivery_galleries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own delivery galleries"
ON public.delivery_galleries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery galleries"
ON public.delivery_galleries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own delivery galleries"
ON public.delivery_galleries FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for delivery_images
CREATE POLICY "Users can view their own delivery images"
ON public.delivery_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own delivery images"
ON public.delivery_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery images"
ON public.delivery_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own delivery images"
ON public.delivery_images FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_delivery_galleries_updated_at
BEFORE UPDATE ON public.delivery_galleries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for access_token lookup
CREATE INDEX idx_delivery_galleries_access_token ON public.delivery_galleries(access_token);

-- Create RPC function to get delivery gallery by access token (public access)
CREATE OR REPLACE FUNCTION public.get_delivery_gallery_by_token(p_access_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  gallery_record RECORD;
BEGIN
  -- Find the gallery
  SELECT * INTO gallery_record 
  FROM public.delivery_galleries 
  WHERE access_token = p_access_token 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
  
  IF gallery_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Increment download count
  UPDATE public.delivery_galleries 
  SET download_count = download_count + 1
  WHERE id = gallery_record.id;
  
  -- Build result with gallery info, images, and profile
  SELECT json_build_object(
    'gallery', row_to_json(gallery_record),
    'images', (
      SELECT COALESCE(json_agg(row_to_json(i) ORDER BY i.sort_order, i.created_at), '[]'::json) 
      FROM public.delivery_images i 
      WHERE i.gallery_id = gallery_record.id
    ),
    'profile', (
      SELECT row_to_json(p) 
      FROM public.profiles p 
      WHERE p.user_id = gallery_record.user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$;