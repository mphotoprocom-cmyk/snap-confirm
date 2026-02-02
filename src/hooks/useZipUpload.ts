import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ZipUploadResult {
  filename: string;
  url: string;
  size: number;
  key: string;
}

interface ZipUploadResponse {
  success: boolean;
  uploaded: ZipUploadResult[];
  totalFiles: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

interface ZipUploadProgress {
  status: 'idle' | 'uploading' | 'extracting' | 'complete' | 'error';
  message: string;
}

export function useZipUpload() {
  const [progress, setProgress] = useState<ZipUploadProgress>({
    status: 'idle',
    message: '',
  });

  const mutation = useMutation({
    mutationFn: async ({ 
      file, 
      galleryId, 
      folder = 'delivery' 
    }: { 
      file: File; 
      galleryId: string; 
      folder?: string;
    }): Promise<ZipUploadResponse> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      setProgress({ status: 'uploading', message: 'กำลังอัปโหลดไฟล์ ZIP...' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('galleryId', galleryId);

      setProgress({ status: 'extracting', message: 'กำลังแตกไฟล์และอัปโหลดรูปภาพ...' });

      const response = await supabase.functions.invoke('zip-upload', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'ZIP upload failed');
      }

      setProgress({ status: 'complete', message: 'เสร็จสิ้น' });
      
      return response.data as ZipUploadResponse;
    },
    onError: (error) => {
      setProgress({ status: 'error', message: error.message });
      toast.error('อัปโหลด ZIP ไม่สำเร็จ: ' + error.message);
    },
  });

  const reset = () => {
    setProgress({ status: 'idle', message: '' });
  };

  return {
    ...mutation,
    progress,
    reset,
  };
}
