import { useState, useCallback, useRef } from 'react';
import type { DeliveryImage } from '@/hooks/useDeliveryGallery';

interface FaceSearchState {
  isLoading: boolean;
  isModelLoaded: boolean;
  progress: number;
  matchedImages: DeliveryImage[];
  error: string | null;
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';

let faceApiModulePromise: Promise<typeof import('face-api.js')> | null = null;

async function getFaceApi() {
  // Lazy-load to keep public gallery initial load fast.
  if (!faceApiModulePromise) {
    faceApiModulePromise = import('face-api.js');
  }
  return faceApiModulePromise;
}

export function useFaceSearch(images: DeliveryImage[]) {
  const [state, setState] = useState<FaceSearchState>({
    isLoading: false,
    isModelLoaded: false,
    progress: 0,
    matchedImages: [],
    error: null,
  });

  const descriptorsRef = useRef<Map<string, Float32Array[]>>(new Map());
  const modelsLoadedRef = useRef(false);

  // Load face-api models
  const loadModels = useCallback(async () => {
    if (modelsLoadedRef.current) return true;

    try {
      const faceapi = await getFaceApi();
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoadedRef.current = true;
      setState(prev => ({ ...prev, isModelLoaded: true }));
      return true;
    } catch (error) {
      console.error('Failed to load face-api models:', error);
      setState(prev => ({ ...prev, error: 'ไม่สามารถโหลดโมเดลได้' }));
      return false;
    }
  }, []);

  // Get face descriptor from an image element
  const getFaceDescriptors = async (img: HTMLImageElement): Promise<Float32Array[]> => {
    const faceapi = await getFaceApi();
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections.map(d => d.descriptor);
  };

  // Load image from URL and get descriptors
  const loadImageAndGetDescriptors = async (url: string): Promise<Float32Array[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      // Helps when storage blocks Referer, and improves consistency with <SafeImage />
      // (supported in modern browsers; ignored otherwise)
      img.referrerPolicy = 'no-referrer';
      img.onload = async () => {
        try {
          const descriptors = await getFaceDescriptors(img);
          resolve(descriptors);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

  // Calculate Euclidean distance between two descriptors
  const euclideanDistance = (desc1: Float32Array, desc2: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum);
  };

  // Search for matching faces
  const searchFaces = useCallback(async (referenceFile: File, threshold: number = 0.6) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      progress: 0, 
      matchedImages: [],
      error: null 
    }));

    try {
      // Load models first
      const loaded = await loadModels();
      if (!loaded) {
        throw new Error('ไม่สามารถโหลดโมเดลได้');
      }

      // Get reference face descriptors
      const referenceUrl = URL.createObjectURL(referenceFile);
      let referenceDescriptors: Float32Array[];
      try {
        referenceDescriptors = await loadImageAndGetDescriptors(referenceUrl);
        URL.revokeObjectURL(referenceUrl);
      } catch (error) {
        URL.revokeObjectURL(referenceUrl);
        throw new Error('ไม่พบใบหน้าในรูปที่อัปโหลด');
      }

      if (referenceDescriptors.length === 0) {
        throw new Error('ไม่พบใบหน้าในรูปที่อัปโหลด');
      }

      const matched: DeliveryImage[] = [];
      const total = images.length;

      // Process images in batches
      const batchSize = 5;
      for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (image) => {
            try {
              // Check cache first
              let imageDescriptors = descriptorsRef.current.get(image.id);
              
              if (!imageDescriptors) {
                imageDescriptors = await loadImageAndGetDescriptors(image.image_url);
                descriptorsRef.current.set(image.id, imageDescriptors);
              }

              // Compare with reference
              for (const refDesc of referenceDescriptors) {
                for (const imgDesc of imageDescriptors) {
                  const distance = euclideanDistance(refDesc, imgDesc);
                  if (distance < threshold) {
                    if (!matched.find(m => m.id === image.id)) {
                      matched.push(image);
                    }
                    break;
                  }
                }
              }
            } catch (error) {
              // Skip images that fail to process
              console.warn(`Failed to process image ${image.id}:`, error);
            }
          })
        );

        setState(prev => ({ 
          ...prev, 
          progress: Math.min(100, Math.round(((i + batch.length) / total) * 100)) 
        }));
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        matchedImages: matched,
        progress: 100 
      }));

      return matched;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: message 
      }));
      return [];
    }
  }, [images, loadModels]);

  // Reset search results
  const resetSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      matchedImages: [],
      progress: 0,
      error: null,
    }));
  }, []);

  // Clear descriptor cache
  const clearCache = useCallback(() => {
    descriptorsRef.current.clear();
  }, []);

  return {
    ...state,
    searchFaces,
    resetSearch,
    clearCache,
    loadModels,
  };
}
