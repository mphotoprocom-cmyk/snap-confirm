-- Add cover image columns to delivery_galleries
ALTER TABLE public.delivery_galleries 
ADD COLUMN cover_image_url TEXT,
ADD COLUMN show_cover BOOLEAN NOT NULL DEFAULT false;