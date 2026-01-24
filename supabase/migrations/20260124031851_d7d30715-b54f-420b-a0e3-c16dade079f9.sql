-- Create storage bucket for profile assets (logo, signature)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-assets', 'profile-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile-assets bucket
CREATE POLICY "Users can view their own profile assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own profile assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to profile assets (for displaying in PDF)
CREATE POLICY "Public can view profile assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-assets');