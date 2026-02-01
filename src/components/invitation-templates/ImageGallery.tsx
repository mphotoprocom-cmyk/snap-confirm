import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface InvitationImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

interface ImageGalleryProps {
  images: InvitationImage[];
  themeColor?: string;
  variant?: 'classic' | 'modern' | 'floral' | 'minimal' | 'luxury';
}

export function ImageGallery({ images, themeColor = '#d4af37', variant = 'classic' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedIndex(null);
  };

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext]);

  if (images.length === 0) return null;

  // Get variant-specific styles
  const getContainerStyles = () => {
    switch (variant) {
      case 'luxury':
        return 'bg-[#0d0d1a] py-16 px-4';
      case 'modern':
        return 'bg-gray-50 py-20 px-4';
      case 'floral':
        return 'bg-pink-50/50 py-16 px-4';
      case 'minimal':
        return 'py-16 px-4';
      default:
        return 'py-16 px-4';
    }
  };

  const getTitleStyles = () => {
    switch (variant) {
      case 'luxury':
        return {
          className: 'text-center text-xs tracking-[0.4em] mb-12',
          style: { color: themeColor },
          text: '✦ OUR MOMENTS ✦',
        };
      case 'modern':
        return {
          className: 'text-3xl text-center mb-12 tracking-wider',
          style: { fontFamily: 'Italiana, serif', color: '#1a1a1a' },
          text: 'Our Gallery',
        };
      case 'floral':
        return {
          className: 'text-2xl text-center mb-8',
          style: { fontFamily: 'Cormorant Garamond, serif', color: '#6b4f4f' },
          text: '❀ ช่วงเวลาแห่งความทรงจำ ❀',
        };
      case 'minimal':
        return {
          className: 'text-xs tracking-[0.3em] text-center mb-8 text-gray-400 uppercase',
          style: {},
          text: 'Gallery',
        };
      default:
        return {
          className: 'text-center text-2xl mb-8 tracking-wider',
          style: { fontFamily: 'Playfair Display, serif', color: '#1a1a2e' },
          text: 'Our Story',
        };
    }
  };

  const titleConfig = getTitleStyles();

  // Masonry-like grid for many images
  const renderMasonryGrid = () => {
    const getGridClass = () => {
      if (images.length === 1) return 'grid-cols-1 max-w-2xl mx-auto';
      if (images.length === 2) return 'grid-cols-2 max-w-4xl mx-auto';
      if (images.length === 3) return 'grid-cols-3 max-w-5xl mx-auto';
      if (images.length === 4) return 'grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto';
      return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto';
    };

    return (
      <div className={`grid gap-3 ${getGridClass()}`}>
        {images.map((img, index) => {
          // Create visual interest with varying sizes
          const isFeature = index === 0 && images.length > 4;
          const spanClass = isFeature ? 'md:col-span-2 md:row-span-2' : '';

          return (
            <div
              key={img.id}
              className={`relative group cursor-pointer overflow-hidden ${spanClass}`}
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={img.image_url}
                  alt={img.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Caption on hover */}
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm text-center">{img.caption}</p>
                </div>
              )}

              {/* Luxury variant border effect */}
              {variant === 'luxury' && (
                <div
                  className="absolute inset-0 border-2 border-transparent group-hover:border-[#ffd700] transition-colors pointer-events-none"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Carousel for scrolling through images
  const renderCarousel = () => (
    <div className="max-w-4xl mx-auto">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((img, index) => (
            <CarouselItem
              key={img.id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3"
            >
              <div
                className="relative group cursor-pointer overflow-hidden"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-[4/5] overflow-hidden rounded-lg">
                  <img
                    src={img.image_url}
                    alt={img.caption || `Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12" />
        <CarouselNext className="hidden md:flex -right-12" />
      </Carousel>

      {/* Thumbnail indicators for mobile */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {images.slice(0, 5).map((_, idx) => (
          <div
            key={idx}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: idx === 0 ? themeColor : '#ccc' }}
          />
        ))}
        {images.length > 5 && <span className="text-xs text-gray-400">+{images.length - 5}</span>}
      </div>
    </div>
  );

  return (
    <div className={getContainerStyles()}>
      {/* Title */}
      <div className={titleConfig.className} style={titleConfig.style}>
        {titleConfig.text}
      </div>

      {/* Choose layout based on image count */}
      {images.length <= 6 ? renderMasonryGrid() : renderCarousel()}

      {/* View all button for many images */}
      {images.length > 6 && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => openLightbox(0)}
            className="gap-2"
            style={{ borderColor: themeColor, color: variant === 'luxury' ? 'white' : themeColor }}
          >
            View All {images.length} Photos
          </Button>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl p-0 bg-black/95 border-none">
          <div className="relative min-h-[50vh] md:min-h-[80vh] flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation buttons */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {selectedIndex !== null && selectedIndex < images.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Main image */}
            {selectedIndex !== null && (
              <div className="flex flex-col items-center justify-center p-4 max-h-[90vh]">
                <img
                  src={images[selectedIndex].image_url}
                  alt={images[selectedIndex].caption || ''}
                  className="max-w-full max-h-[75vh] object-contain"
                />

                {/* Caption */}
                {images[selectedIndex].caption && (
                  <p className="text-white text-center mt-4 max-w-xl">
                    {images[selectedIndex].caption}
                  </p>
                )}

                {/* Counter */}
                <p className="text-white/60 text-sm mt-2">
                  {selectedIndex + 1} / {images.length}
                </p>
              </div>
            )}

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <div className="flex gap-2 justify-center overflow-x-auto py-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded overflow-hidden transition-all ${
                      idx === selectedIndex
                        ? 'ring-2 ring-white opacity-100'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
