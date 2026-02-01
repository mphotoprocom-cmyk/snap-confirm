import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type R2Folder = 'profile' | 'portfolio' | 'delivery' | 'invitation';

interface UploadResult {
  url: string;
  filename: string;
  size: number;
  key: string;
}

export function useR2Upload() {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder: R2Folder }): Promise<UploadResult> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await supabase.functions.invoke('r2-storage', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      return response.data as UploadResult;
    },
    onError: (error) => {
      toast.error('อัปโหลดไม่สำเร็จ: ' + error.message);
    },
  });
}

export function useR2Delete() {
  return useMutation({
    mutationFn: async (fileUrl: string): Promise<void> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      // Extract key from URL
      const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || '';
      const key = fileUrl.replace(`${publicUrl}/`, '');

      const response = await supabase.functions.invoke('r2-storage?action=delete', {
        method: 'DELETE',
        body: { key },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Delete failed');
      }
    },
    onError: (error) => {
      toast.error('ลบไฟล์ไม่สำเร็จ: ' + error.message);
    },
  });
}

// Helper function to check if URL is from R2
export function isR2Url(url: string | null | undefined): boolean {
  if (!url) return false;
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || '';
  return publicUrl ? url.startsWith(publicUrl) : false;
}

// Helper to extract key from R2 URL
export function getR2KeyFromUrl(url: string): string {
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || '';
  return url.replace(`${publicUrl}/`, '');
}
