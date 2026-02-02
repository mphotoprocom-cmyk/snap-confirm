import { useState } from 'react';
import { cn } from '@/lib/utils';

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Pass through to <img loading>. Defaults to lazy. */
  loading?: 'lazy' | 'eager';
  /** When true, uses /placeholder.svg as a one-time fallback on error. Defaults to true. */
  fallbackToPlaceholder?: boolean;
};

/**
 * A resilient <img> wrapper for cross-domain images.
 * - referrerPolicy="no-referrer" helps when storage blocks Referer
 * - one-time fallback prevents infinite error loops
 */
export function SafeImage({
  src,
  alt,
  className,
  loading = 'lazy',
  fallbackToPlaceholder = true,
}: SafeImageProps) {
  const [didFallback, setDidFallback] = useState(false);

  return (
    <img
      src={didFallback ? '/placeholder.svg' : src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      className={cn(className)}
      onError={() => {
        if (!fallbackToPlaceholder) return;
        setDidFallback(true);
      }}
    />
  );
}
