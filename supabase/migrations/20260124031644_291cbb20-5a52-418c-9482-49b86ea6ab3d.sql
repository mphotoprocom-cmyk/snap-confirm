-- Add signature and full name columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signature_url text,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS show_signature boolean DEFAULT false;

-- Add client_note column to bookings (replacing email as freetext)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_note text;