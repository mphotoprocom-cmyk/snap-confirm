import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GalleryLayout } from './GalleryLayoutSelector';
import type { DeliveryImage } from '@/hooks/useDeliveryGallery';
import { LazyImage } from '@/components/LazyImage';
import { useInfiniteGallery } from '@/hooks/useInfiniteGallery';

interface PublicGalleryImageGridProps {
  images: DeliveryImage[];
  layout: GalleryLayout;
  onImageClick: (image: DeliveryImage) => void;
  onDownload: (image: DeliveryImage) => void;
}

export function PublicGalleryImageGrid({ images, layout, onImageClick, onDownload }: PublicGalleryImageGridProps) {
  const { visibleItems, hasMore, sentinelRef, visibleCount, totalCount } = useInfiniteGallery(images);

  const getGridClass = () => {
    switch (layout) {
      case 'grid-2': return 'grid-cols-2';
      case 'grid-3': return 'grid-cols-2 md:grid-cols-3';
      case 'grid-4': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 'grid-5': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case 'grid-6': return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      case 'story': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      default: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  const getItemClass = (index: number) => {
    switch (layout) {
      case 'masonry-2': return index === 0 ? 'row-span-2' : '';
      case 'masonry-3':
        if (index === 0) return 'row-span-2';
        if (index === 3) return 'col-span-2';
        return '';
      case 'masonry-4': return index === 0 ? 'col-span-2 row-span-2' : '';
      case 'featured-left': return index === 0 ? 'col-span-2 row-span-2' : '';
      case 'featured-right':
        if (index === 0) return '';
        if (index === 1) return 'col-span-2 row-span-2';
        return '';
      case 'featured-top': return index === 0 ? 'col-span-full' : '';
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
      case 'filmstrip': return 'col-span-full';
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
      default: return '';
    }
  };

  const getGridContainerClass = () => {
    switch (layout) {
      case 'masonry-2': return 'grid-cols-2 auto-rows-[180px] md:auto-rows-[220px]';
      case 'masonry-3': return 'grid-cols-3 auto-rows-[150px] md:auto-rows-[180px]';
      case 'masonry-4': return 'grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[150px]';
      case 'featured-left':
      case 'featured-right': return 'grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[200px]';
      case 'featured-top': return 'grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[250px]';
      case 'alternating': return 'grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[180px]';
      case 'magazine': return 'grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[140px]';
      case 'mosaic': return 'grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[140px]';
      case 'filmstrip': return 'grid-cols-1 auto-rows-[250px] md:auto-rows-[350px]';
      case 'collage': return 'grid-cols-3 md:grid-cols-6 auto-rows-[150px] md:auto-rows-[180px]';
      case 'asymmetric': return 'grid-cols-3 md:grid-cols-5 auto-rows-[150px] md:auto-rows-[180px]';
      case 'pinterest': return 'columns-2 md:columns-3 gap-3 space-y-3';
      case 'spotlight': return 'grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[180px]';
      default: return getGridClass();
    }
  };

  const isPinterest = layout === 'pinterest';
  const isSpecialLayout = [
    'masonry-2', 'masonry-3', 'masonry-4',
    'featured-left', 'featured-right', 'featured-top',
    'alternating', 'magazine', 'mosaic', 'filmstrip',
    'collage', 'asymmetric', 'spotlight'
  ].includes(layout);

  const renderDownloadButton = (image: DeliveryImage) => (
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
  );

  const content = isPinterest ? (
    <div className="columns-2 md:columns-3 gap-3 space-y-3">
      {visibleItems.map((image) => (
        <div key={image.id} className="group relative break-inside-avoid mb-3">
          <button
            onClick={() => onImageClick(image)}
            className="w-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg overflow-hidden"
          >
            <LazyImage
              src={image.thumbnail_url || image.image_url}
              alt={image.filename}
              className="w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
              aspectClass="aspect-auto"
            />
          </button>
          {renderDownloadButton(image)}
        </div>
      ))}
    </div>
  ) : (
    <div className={cn('grid gap-3', isSpecialLayout ? getGridContainerClass() : getGridClass())}>
      {visibleItems.map((image, index) => (
        <div
          key={image.id}
          className={cn('group relative', isSpecialLayout && getItemClass(index))}
        >
          <button
            onClick={() => onImageClick(image)}
            className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg overflow-hidden"
          >
            <LazyImage
              src={image.thumbnail_url || image.image_url}
              alt={image.filename}
              fill={isSpecialLayout}
              aspectClass={isSpecialLayout ? undefined : 'aspect-square'}
              className="rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
          </button>
          {renderDownloadButton(image)}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {content}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="w-full py-4">
        {hasMore && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>กำลังโหลดรูปภาพ... ({visibleCount}/{totalCount})</span>
          </div>
        )}
      </div>
    </div>
  );
}
