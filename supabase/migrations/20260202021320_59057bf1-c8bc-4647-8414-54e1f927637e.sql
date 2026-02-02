-- Add face_search_enabled column to delivery_galleries table
ALTER TABLE public.delivery_galleries 
ADD COLUMN face_search_enabled BOOLEAN NOT NULL DEFAULT true;