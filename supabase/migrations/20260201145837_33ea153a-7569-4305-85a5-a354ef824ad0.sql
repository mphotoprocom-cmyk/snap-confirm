-- Add layout column to delivery_galleries
ALTER TABLE public.delivery_galleries 
ADD COLUMN layout TEXT NOT NULL DEFAULT 'grid-4';