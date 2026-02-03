-- Add fullscreen_mode column to delivery_galleries table
ALTER TABLE public.delivery_galleries
ADD COLUMN fullscreen_mode boolean NOT NULL DEFAULT false;