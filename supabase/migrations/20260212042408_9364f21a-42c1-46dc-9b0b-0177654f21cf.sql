
-- Add thumbnail_url column to delivery_images
ALTER TABLE public.delivery_images 
ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_delivery_images_thumbnail 
ON public.delivery_images (gallery_id) 
WHERE thumbnail_url IS NOT NULL;
