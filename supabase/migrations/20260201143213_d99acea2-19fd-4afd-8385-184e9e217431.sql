-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for portfolio-images bucket
CREATE POLICY "Portfolio images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Users can upload their own portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own portfolio images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own portfolio images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create portfolio_images table
CREATE TABLE public.portfolio_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  job_type public.job_type NOT NULL DEFAULT 'event',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_images
CREATE POLICY "Anyone can view portfolio images"
ON public.portfolio_images FOR SELECT
USING (true);

CREATE POLICY "Users can create their own portfolio images"
ON public.portfolio_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio images"
ON public.portfolio_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio images"
ON public.portfolio_images FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_portfolio_images_updated_at
BEFORE UPDATE ON public.portfolio_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create RPC function to get portfolio data for public view
CREATE OR REPLACE FUNCTION public.get_portfolio_by_user_id(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.user_id = p_user_id),
    'images', (SELECT COALESCE(json_agg(row_to_json(i) ORDER BY i.sort_order, i.created_at DESC), '[]'::json) FROM public.portfolio_images i WHERE i.user_id = p_user_id),
    'packages', (SELECT COALESCE(json_agg(row_to_json(pkg) ORDER BY pkg.sort_order), '[]'::json) FROM public.packages pkg WHERE pkg.user_id = p_user_id AND pkg.is_active = true)
  ) INTO result;
  
  RETURN result;
END;
$$;