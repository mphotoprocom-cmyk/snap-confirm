import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GalleryLayout } from './GalleryLayoutSelector';
import type { DeliveryImage } from '@/hooks/useDeliveryGallery';
import { SafeImage } from '@/components/SafeImage';

interface PublicGalleryImageGridProps {
  images: DeliveryImage[];
  layout: GalleryLayout;
  onImageClick: (image: DeliveryImage) => void;
  onDownload: (image: DeliveryImage) => void;
}

export function PublicGalleryImageGrid({ images, layout, onImageClick, onDownload }: PublicGalleryImageGridProps) {
  const getGridClass = () => {
    switch (layout) {
      case 'grid-2':
        return 'grid-cols-2';
      case 'grid-3':
        return 'grid-cols-2 md:grid-cols-3';
      case 'grid-4':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 'grid-5':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case 'grid-6':
        return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      case 'story':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      default:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  const getItemClass = (index: number) => {
    switch (layout) {
      case 'masonry-2':
        return index === 0 ? 'row-span-2' : '';
      case 'masonry-3':
        if (index === 0) return 'row-span-2';
        if (index === 3) return 'col-span-2';
        return '';
      case 'masonry-4':
        return index === 0 ? 'col-span-2 row-span-2' : '';
      case 'featured-left':
        return index === 0 ? 'col-span-2 row-span-2' : '';
      case 'featured-right':
        if (index === 0) return '';
        if (index === 1) return 'col-span-2 row-span-2';
        return '';
      case 'featured-top':
        return index === 0 ? 'col-span-full' : '';
      case 'alternating':
        if (index % 4 === 0) return 'col-span-2';
        if (index % 4 === 3) return 'col-span-2';
        return '';
      case 'magazine':
        if (index === 0) return 'col-span-2 row-span-2';
        if (index === 1) return 'col-span-2';
        return '';
      case 'mosaic':
        if (index === 1) return 'col-span-2 row-span-2';
        if (index === 3) return 'row-span-2';
        if (index === 4) return 'row-span-2';
        return '';
      case 'filmstrip':
        return 'col-span-full';
      case 'collage':
        if (index === 0) return 'col-span-2';
        if (index === 1) return 'col-span-3 row-span-2';
        if (index === 2) return 'row-span-2';
        return '';
      case 'asymmetric':
        if (index === 0) return 'col-span-3 row-span-2';
        if (index === 1) return 'col-span-2';
        return '';
      case 'spotlight':
        if (index === 1) return 'col-span-2 row-span-2';
        return '';
      default:
        return '';
    }
  };

  const getGridContainerClass = () => {
    switch (layout) {
      case 'masonry-2':
        return 'grid-cols-2 auto-rows-[180px] md:auto-rows-[220px]';
      case 'masonry-3':
        return 'grid-cols-3 auto-rows-[150px] md:auto-rows-[180px]';
      case 'masonry-4':
        return 'grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[150px]';
      case 'featured-left':
      case 'featured-right':
        return 'grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[200px]';
      case 'featured-top':
        return 'grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[250px]';
      case 'alternating':
        return 'grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[180px]';
      case 'magazine':
        return 'grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[140px]';
      case 'mosaic':
        return 'grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[140px]';
      case 'filmstrip':
        return 'grid-cols-1 auto-rows-[250px] md:auto-rows-[350px]';
      case 'collage':
        return 'grid-cols-3 md:grid-cols-6 auto-rows-[150px] md:auto-rows-[180px]';
      case 'asymmetric':
        return 'grid-cols-3 md:grid-cols-5 auto-rows-[150px] md:auto-rows-[180px]';
      case 'pinterest':
        return 'columns-2 md:columns-3 gap-3 space-y-3';
      case 'spotlight':
        return 'grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[180px]';
      default:
        return getGridClass();
    }
  };

  const isPinterest = layout === 'pinterest';

  if (isPinterest) {
    return (
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {images.map((image) => (
          <div key={image.id} className="group relative break-inside-avoid mb-3">
            <button
              onClick={() => onImageClick(image)}
              className="w-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg overflow-hidden"
            >
              <SafeImage
                src={image.image_url}
                alt={image.filename}
                className="w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(image);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  const isSpecialLayout = [
    'masonry-2', 'masonry-3', 'masonry-4',
    'featured-left', 'featured-right', 'featured-top',
    'alternating', 'magazine', 'mosaic', 'filmstrip',
    'collage', 'asymmetric', 'spotlight'
  ].includes(layout);

  return (
    <div className={cn('grid gap-3', isSpecialLayout ? getGridContainerClass() : getGridClass())}>
      {images.map((image, index) => (
        <div 
          key={image.id} 
          className={cn('group relative', isSpecialLayout && getItemClass(index))}
        >
          <button
            onClick={() => onImageClick(image)}
            className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg overflow-hidden"
          >
            {isSpecialLayout ? (
              <div className="w-full h-full">
                <SafeImage
                  src={image.image_url}
                  alt={image.filename}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <AspectRatio ratio={1}>
                <SafeImage
                  src={image.image_url}
                  alt={image.filename}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>
            )}
          </button>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(image);
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
