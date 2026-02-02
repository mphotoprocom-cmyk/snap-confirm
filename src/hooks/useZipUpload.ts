import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ZipUploadResult {
  filename: string;
  url: string;
  size: number;
  key: string;
}

interface ZipUploadJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_files: number;
  processed_files: number;
  uploaded_files: ZipUploadResult[];
  error: string | null;
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
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  message: string;
  progress: number;
  totalFiles: number;
  processedFiles: number;
}

export function useZipUpload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<ZipUploadProgress>({
    status: 'idle',
    message: '',
    progress: 0,
    totalFiles: 0,
    processedFiles: 0,
  });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Poll for job status
  useEffect(() => {
    if (!currentJobId) return;

    const channel = supabase
      .channel(`zip-upload-${currentJobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'zip_upload_jobs',
          filter: `id=eq.${currentJobId}`,
        },
        (payload) => {
          const job = payload.new as ZipUploadJob;
          
          if (job.status === 'processing') {
            setProgress({
              status: 'processing',
              message: `กำลังแตกไฟล์และอัปโหลด... (${job.processed_files}/${job.total_files})`,
              progress: job.progress,
              totalFiles: job.total_files,
              processedFiles: job.processed_files,
            });
          } else if (job.status === 'completed') {
            setProgress({
              status: 'complete',
              message: `เสร็จสิ้น ${job.processed_files} รูป`,
              progress: 100,
              totalFiles: job.total_files,
              processedFiles: job.processed_files,
            });
          } else if (job.status === 'failed') {
            setProgress({
              status: 'error',
              message: job.error || 'เกิดข้อผิดพลาด',
              progress: 0,
              totalFiles: job.total_files,
              processedFiles: job.processed_files,
            });
          }
        }
      )
      .subscribe();

    // Also poll manually every 2 seconds as backup
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('zip_upload_jobs')
        .select('*')
        .eq('id', currentJobId)
        .single();

      if (data) {
        const job = data as unknown as ZipUploadJob;
        
        if (job.status === 'processing') {
          setProgress({
            status: 'processing',
            message: `กำลังแตกไฟล์และอัปโหลด... (${job.processed_files}/${job.total_files})`,
            progress: job.progress,
            totalFiles: job.total_files,
            processedFiles: job.processed_files,
          });
        } else if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(pollInterval);
        }
      }
    }, 2000);

    return () => {
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [currentJobId]);

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

      setProgress({ 
        status: 'uploading', 
        message: 'กำลังอัปโหลดไฟล์ ZIP...', 
        progress: 0,
        totalFiles: 0,
        processedFiles: 0,
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('galleryId', galleryId);

      const response = await supabase.functions.invoke('zip-upload', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'ZIP upload failed');
      }

      const data = response.data as { success: boolean; jobId: string };
      
      if (!data.success || !data.jobId) {
        throw new Error('Failed to start upload job');
      }

      // Set job ID to start polling
      setCurrentJobId(data.jobId);

      setProgress({ 
        status: 'processing', 
        message: 'กำลังแตกไฟล์และอัปโหลดรูปภาพ...', 
        progress: 0,
        totalFiles: 0,
        processedFiles: 0,
      });

      // Wait for job completion
      const result = await waitForJobCompletion(data.jobId);
      
      queryClient.invalidateQueries({ queryKey: ['delivery-gallery', galleryId] });
      
      return result;
    },
    onError: (error) => {
      setProgress({ 
        status: 'error', 
        message: error.message, 
        progress: 0,
        totalFiles: 0,
        processedFiles: 0,
      });
      toast.error('อัปโหลด ZIP ไม่สำเร็จ: ' + error.message);
    },
  });

  const reset = useCallback(() => {
    setProgress({ 
      status: 'idle', 
      message: '', 
      progress: 0,
      totalFiles: 0,
      processedFiles: 0,
    });
    setCurrentJobId(null);
  }, []);

  return {
    ...mutation,
    progress,
    reset,
  };
}

// Wait for job to complete by polling
async function waitForJobCompletion(jobId: string, maxWaitMs = 600000): Promise<ZipUploadResponse> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const { data, error } = await supabase
      .from('zip_upload_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      throw new Error('Failed to check job status');
    }

    const job = data as unknown as ZipUploadJob;

    if (job.status === 'completed') {
      return {
        success: true,
        uploaded: job.uploaded_files || [],
        totalFiles: job.total_files,
        successCount: job.processed_files,
        errorCount: job.total_files - job.processed_files,
        errors: job.error ? [job.error] : [],
      };
    }

    if (job.status === 'failed') {
      throw new Error(job.error || 'Upload job failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Upload job timed out');
}
