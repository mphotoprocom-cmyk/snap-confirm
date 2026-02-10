import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GalleryLayout } from './GalleryLayoutSelector';
import type { DeliveryImage } from '@/hooks/useDeliveryGallery';

interface GalleryImageGridProps {
  images: DeliveryImage[];
  layout: GalleryLayout;
  onDeleteImage: (id: string) => void;
  formatFileSize: (bytes: number | null) => string;
}

export function GalleryImageGrid({ images, layout, onDeleteImage, formatFileSize }: GalleryImageGridProps) {
  const getGridClass = () => {
    switch (layout) {
      case 'grid-2':
        return 'grid-cols-2';
      case 'grid-3':
        return 'grid-cols-2 md:grid-cols-3';
      case 'grid-4':
        return 'grid-cols-2 md:grid-cols-4';
      case 'grid-5':
        return 'grid-cols-2 md:grid-cols-5';
      case 'grid-6':
        return 'grid-cols-3 md:grid-cols-6';
      case 'story':
        return 'grid-cols-2 md:grid-cols-5';
      default:
        return 'grid-cols-2 md:grid-cols-4';
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
        return 'grid-cols-2 auto-rows-[150px]';
      case 'masonry-3':
        return 'grid-cols-3 auto-rows-[120px]';
      case 'masonry-4':
        return 'grid-cols-4 auto-rows-[100px]';
      case 'featured-left':
      case 'featured-right':
        return 'grid-cols-3 auto-rows-[150px]';
      case 'featured-top':
        return 'grid-cols-3 auto-rows-[180px]';
      case 'alternating':
        return 'grid-cols-4 auto-rows-[120px]';
      case 'magazine':
        return 'grid-cols-4 auto-rows-[100px]';
      case 'mosaic':
        return 'grid-cols-4 auto-rows-[100px]';
      case 'filmstrip':
        return 'grid-cols-1 auto-rows-[200px]';
      case 'collage':
        return 'grid-cols-6 auto-rows-[120px]';
      case 'asymmetric':
        return 'grid-cols-5 auto-rows-[120px]';
      case 'pinterest':
        return 'columns-3 gap-4 space-y-4';
      case 'spotlight':
        return 'grid-cols-4 auto-rows-[120px]';
      default:
        return getGridClass();
    }
  };

  const isPinterest = layout === 'pinterest';

  if (isPinterest) {
    return (
      <div className="columns-2 md:columns-3 gap-0.5">
        {images.map((image) => (
          <div key={image.id} className="group relative break-inside-avoid mb-0.5">
            <img
              src={image.image_url}
              alt={image.filename}
              className="w-full h-auto object-cover"
            />
            <ImageOverlay 
              image={image} 
              onDelete={onDeleteImage}
              formatFileSize={formatFileSize}
            />
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
    <div className={cn('grid gap-0.5', isSpecialLayout ? getGridContainerClass() : getGridClass())}>
      {images.map((image, index) => (
        <div 
          key={image.id} 
          className={cn('group relative', isSpecialLayout && getItemClass(index))}
        >
          {isSpecialLayout ? (
            <div className="w-full h-full">
              <img
                src={image.image_url}
                alt={image.filename}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <AspectRatio ratio={3/2}>
              <img
                src={image.image_url}
                alt={image.filename}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          )}
          <ImageOverlay 
            image={image} 
            onDelete={onDeleteImage}
            formatFileSize={formatFileSize}
          />
        </div>
      ))}
    </div>
  );
}

interface ImageOverlayProps {
  image: DeliveryImage;
  onDelete: (id: string) => void;
  formatFileSize: (bytes: number | null) => string;
}

function ImageOverlay({ image, onDelete, formatFileSize }: ImageOverlayProps) {
  return (
    <>
      {/* Delete overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ลบรูปภาพ</AlertDialogTitle>
              <AlertDialogDescription>
                คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(image.id)}>
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* File info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
        <p className="text-white text-xs truncate">{image.filename}</p>
        {image.file_size && (
          <p className="text-white/70 text-xs">{formatFileSize(image.file_size)}</p>
        )}
      </div>
    </>
  );
}
