import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PortfolioImage {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  job_type: 'wedding' | 'event' | 'corporate' | 'portrait' | 'other';
  sort_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioData {
  profile: {
    studio_name: string;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    logo_url: string | null;
    service_details: string | null;
  } | null;
  images: PortfolioImage[];
  packages: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    job_type: string | null;
  }[];
}

export function usePortfolioImages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['portfolio-images', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PortfolioImage[];
    },
    enabled: !!user,
  });
}

export function usePublicPortfolio(userId: string | undefined) {
  return useQuery({
    queryKey: ['public-portfolio', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .rpc('get_portfolio_by_user_id', { p_user_id: userId });

      if (error) throw error;
      return data as unknown as PortfolioData;
    },
    enabled: !!userId,
  });
}

export function useAddPortfolioImage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (imageData: {
      title?: string;
      description?: string;
      image_url: string;
      job_type: 'wedding' | 'event' | 'corporate' | 'portrait' | 'other';
      is_featured?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('portfolio_images')
        .insert({
          user_id: user.id,
          ...imageData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] });
      toast.success('เพิ่มรูปภาพสำเร็จ');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdatePortfolioImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<PortfolioImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('portfolio_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] });
      toast.success('อัปเดตสำเร็จ');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeletePortfolioImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] });
      toast.success('ลบรูปภาพสำเร็จ');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUploadPortfolioImage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'portfolio');

      const response = await supabase.functions.invoke('r2-storage?action=upload', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      return response.data.url as string;
    },
    onError: (error) => {
      toast.error('อัปโหลดไม่สำเร็จ: ' + error.message);
    },
  });
}
