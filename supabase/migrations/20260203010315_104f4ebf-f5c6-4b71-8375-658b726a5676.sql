-- Add full_width_layout column to delivery_galleries table
ALTER TABLE public.delivery_galleries
ADD COLUMN full_width_layout boolean NOT NULL DEFAULT false;