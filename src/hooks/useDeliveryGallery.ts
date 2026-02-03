import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DeliveryGallery {
  id: string;
  user_id: string;
  booking_id: string | null;
  title: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  description: string | null;
  access_token: string;
  expires_at: string | null;
  download_count: number;
  is_active: boolean;
  layout: string;
  cover_image_url: string | null;
  show_cover: boolean;
  face_search_enabled: boolean;
  fullscreen_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryImage {
  id: string;
  gallery_id: string;
  user_id: string;
  filename: string;
  image_url: string;
  file_size: number | null;
  sort_order: number;
  created_at: string;
}

interface DeliveryGalleryData {
  gallery: DeliveryGallery;
  images: DeliveryImage[];
  profile: {
    studio_name: string;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
  } | null;
}

export function useDeliveryGalleries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['delivery-galleries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('delivery_galleries')
        .select('*, booking:bookings(client_name, event_date)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDeliveryGallery(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['delivery-gallery', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data: gallery, error: galleryError } = await supabase
        .from('delivery_galleries')
        .select('*')
        .eq('id', id)
        .single();

      if (galleryError) throw galleryError;

      const { data: images, error: imagesError } = await supabase
        .from('delivery_images')
        .select('*')
        .eq('gallery_id', id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (imagesError) throw imagesError;

      return { gallery, images } as { gallery: DeliveryGallery; images: DeliveryImage[] };
    },
    enabled: !!id && !!user,
  });
}

export function usePublicDeliveryGallery(accessToken: string | undefined) {
  return useQuery({
    queryKey: ['public-delivery-gallery', accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      
      const { data, error } = await supabase
        .rpc('get_delivery_gallery_by_token', { p_access_token: accessToken });

      if (error) throw error;
      return data as unknown as DeliveryGalleryData;
    },
    enabled: !!accessToken,
  });
}

export function useCreateDeliveryGallery() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (galleryData: {
      title: string;
      client_name: string;
      client_email?: string;
      client_phone?: string;
      description?: string;
      booking_id?: string;
      expires_at?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('delivery_galleries')
        .insert({
          user_id: user.id,
          ...galleryData,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DeliveryGallery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-galleries'] });
      toast.success('สร้างแกลเลอรี่สำเร็จ');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateDeliveryGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<DeliveryGallery> & { id: string }) => {
      const { data, error } = await supabase
        .from('delivery_galleries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-galleries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-gallery', variables.id] });
      toast.success('อัปเดตสำเร็จ');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteDeliveryGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_galleries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-galleries'] });
      toast.success('ลบแกลเลอรี่สำเร็จ');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUploadDeliveryImage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, galleryId }: { file: File; galleryId: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `delivery/${galleryId}`);

      const response = await supabase.functions.invoke('r2-storage?action=upload', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      return {
        url: response.data.url as string,
        filename: file.name,
        fileSize: file.size,
      };
    },
    onError: (error) => {
      toast.error('อัปโหลดไม่สำเร็จ: ' + error.message);
    },
  });
}

export function useAddDeliveryImage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (imageData: {
      gallery_id: string;
      filename: string;
      image_url: string;
      file_size?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('delivery_images')
        .insert({
          user_id: user.id,
          ...imageData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-gallery', variables.gallery_id] });
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteDeliveryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, galleryId }: { id: string; galleryId: string }) => {
      const { error } = await supabase
        .from('delivery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return galleryId;
    },
    onSuccess: (galleryId) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-gallery', galleryId] });
      toast.success('ลบรูปภาพสำเร็จ');
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}
