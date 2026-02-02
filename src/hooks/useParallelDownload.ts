import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import type { DownloadProgress } from '@/components/DownloadProgressDialog';

interface DownloadableImage {
  image_url: string;
  filename: string;
}

const CONCURRENT_DOWNLOADS = 8;
const BATCH_SIZE = 500;

export function useParallelDownload() {
  const [progress, setProgress] = useState<DownloadProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    currentBatch: 1,
    totalBatches: 1,
    status: 'downloading',
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const cancelledRef = useRef(false);

  const downloadImage = async (image: DownloadableImage): Promise<{ filename: string; data: Uint8Array } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('download-image', {
        body: { url: image.image_url },
      });
      
      if (error || !data?.data) {
        console.error('Failed to fetch image:', image.filename, error);
        return null;
      }
      
      // Convert base64 to Uint8Array
      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return { filename: image.filename, data: bytes };
    } catch (error) {
      console.error('Download error:', image.filename, error);
      return null;
    }
  };

  const downloadBatch = async (
    images: DownloadableImage[], 
    zipFilename: string,
    batchNumber: number,
    totalBatches: number
  ): Promise<{ success: number; failed: number }> => {
    const zip = new JSZip();
    let completed = 0;
    let failed = 0;
    
    // Process images in parallel with concurrency limit
    const chunks: DownloadableImage[][] = [];
    for (let i = 0; i < images.length; i += CONCURRENT_DOWNLOADS) {
      chunks.push(images.slice(i, i + CONCURRENT_DOWNLOADS));
    }
    
    for (const chunk of chunks) {
      if (cancelledRef.current) break;
      
      const results = await Promise.all(chunk.map(downloadImage));
      
      for (const result of results) {
        if (cancelledRef.current) break;
        
        if (result) {
          zip.file(result.filename, result.data);
          completed++;
        } else {
          failed++;
          completed++;
        }
        
        setProgress(prev => ({
          ...prev,
          completed: prev.completed + 1,
          failed: prev.failed + (result ? 0 : 1),
          currentBatch: batchNumber,
          totalBatches,
        }));
      }
    }
    
    if (cancelledRef.current) {
      return { success: completed - failed, failed };
    }
    
    // Generate and download ZIP
    setProgress(prev => ({ ...prev, status: 'zipping' }));
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = totalBatches > 1 ? `${zipFilename}_part${batchNumber}.zip` : `${zipFilename}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: completed - failed, failed };
  };

  const downloadAll = useCallback(async (
    images: DownloadableImage[], 
    galleryTitle: string
  ): Promise<{ success: boolean; totalSuccess: number; totalFailed: number }> => {
    if (images.length === 0) {
      return { success: false, totalSuccess: 0, totalFailed: 0 };
    }
    
    cancelledRef.current = false;
    setIsDownloading(true);
    
    // Split into batches if needed
    const batches: DownloadableImage[][] = [];
    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      batches.push(images.slice(i, i + BATCH_SIZE));
    }
    
    const totalBatches = batches.length;
    
    setProgress({
      total: images.length,
      completed: 0,
      failed: 0,
      currentBatch: 1,
      totalBatches,
      status: 'downloading',
    });
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    try {
      for (let i = 0; i < batches.length; i++) {
        if (cancelledRef.current) break;
        
        const result = await downloadBatch(batches[i], galleryTitle, i + 1, totalBatches);
        totalSuccess += result.success;
        totalFailed += result.failed;
        
        // Reset completed count for next batch but keep failed count
        if (i < batches.length - 1 && !cancelledRef.current) {
          setProgress(prev => ({
            ...prev,
            completed: 0,
            status: 'downloading',
          }));
        }
      }
      
      if (!cancelledRef.current) {
        setProgress(prev => ({
          ...prev,
          completed: images.length,
          status: 'complete',
        }));
      }
      
      return { success: !cancelledRef.current, totalSuccess, totalFailed };
    } catch (error) {
      console.error('Download all error:', error);
      setProgress(prev => ({ ...prev, status: 'error' }));
      return { success: false, totalSuccess, totalFailed };
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setIsDownloading(false);
    setProgress(prev => ({ ...prev, status: 'error' }));
  }, []);

  const reset = useCallback(() => {
    setProgress({
      total: 0,
      completed: 0,
      failed: 0,
      currentBatch: 1,
      totalBatches: 1,
      status: 'downloading',
    });
  }, []);

  return {
    progress,
    isDownloading,
    downloadAll,
    cancel,
    reset,
  };
}
