import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Aspect ratio class for skeleton placeholder, e.g. "aspect-[3/2]" */
  aspectClass?: string;
  /** Fill mode – when true the image fills its parent container */
  fill?: boolean;
}

/**
 * Lazy-loaded image with:
 * - IntersectionObserver (only loads when in viewport)
 * - Skeleton placeholder while loading
 * - Blur-up transition on load
 */
export function LazyImage({ src, alt, className, aspectClass, fill, style, ...rest }: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [didError, setDidError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px 0px' } // start loading 200px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', fill ? 'w-full h-full' : aspectClass, className)}
      style={style}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}

      {/* Actual image – only rendered when in viewport */}
      {isInView && !didError && (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setDidError(true);
            setIsLoaded(true);
          }}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
          )}
          {...rest}
        />
      )}

      {/* Error fallback */}
      {didError && (
        <img
          src="/placeholder.svg"
          alt={alt}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
