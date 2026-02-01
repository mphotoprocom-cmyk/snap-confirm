import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

export type GalleryLayout = 
  | 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' | 'grid-6'
  | 'masonry-2' | 'masonry-3' | 'masonry-4'
  | 'featured-left' | 'featured-right' | 'featured-top'
  | 'alternating' | 'magazine' | 'mosaic'
  | 'filmstrip' | 'story' | 'collage'
  | 'asymmetric' | 'pinterest' | 'spotlight';

interface LayoutOption {
  id: GalleryLayout;
  name: string;
  preview: React.ReactNode;
}

const layoutOptions: LayoutOption[] = [
  {
    id: 'grid-2',
    name: '2 คอลัมน์',
    preview: (
      <div className="grid grid-cols-2 gap-0.5 w-full h-full p-0.5">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-muted-foreground/30 rounded-sm" />)}
      </div>
    ),
  },
  {
    id: 'grid-3',
    name: '3 คอลัมน์',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
        {[...Array(6)].map((_, i) => <div key={i} className="bg-muted-foreground/30 rounded-sm" />)}
      </div>
    ),
  },
  {
    id: 'grid-4',
    name: '4 คอลัมน์',
    preview: (
      <div className="grid grid-cols-4 gap-0.5 w-full h-full p-0.5">
        {[...Array(8)].map((_, i) => <div key={i} className="bg-muted-foreground/30 rounded-sm" />)}
      </div>
    ),
  },
  {
    id: 'grid-5',
    name: '5 คอลัมน์',
    preview: (
      <div className="grid grid-cols-5 gap-0.5 w-full h-full p-0.5">
        {[...Array(10)].map((_, i) => <div key={i} className="bg-muted-foreground/30 rounded-sm" />)}
      </div>
    ),
  },
  {
    id: 'grid-6',
    name: '6 คอลัมน์',
    preview: (
      <div className="grid grid-cols-6 gap-0.5 w-full h-full p-0.5">
        {[...Array(12)].map((_, i) => <div key={i} className="bg-muted-foreground/30 rounded-sm" />)}
      </div>
    ),
  },
  {
    id: 'masonry-2',
    name: 'Masonry 2',
    preview: (
      <div className="grid grid-cols-2 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'masonry-3',
    name: 'Masonry 3',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-2" />
      </div>
    ),
  },
  {
    id: 'masonry-4',
    name: 'Masonry 4',
    preview: (
      <div className="grid grid-cols-4 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm col-span-2 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'featured-left',
    name: 'เด่นซ้าย',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm col-span-2 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'featured-right',
    name: 'เด่นขวา',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-2 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'featured-top',
    name: 'เด่นบน',
    preview: (
      <div className="grid grid-cols-3 grid-rows-2 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm col-span-3" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'alternating',
    name: 'สลับขนาด',
    preview: (
      <div className="grid grid-cols-4 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm col-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-2" />
      </div>
    ),
  },
  {
    id: 'magazine',
    name: 'แมกกาซีน',
    preview: (
      <div className="grid grid-cols-4 grid-rows-3 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm col-span-2 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'mosaic',
    name: 'โมเสก',
    preview: (
      <div className="grid grid-cols-4 grid-rows-3 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-2 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'filmstrip',
    name: 'ฟิล์มสตริป',
    preview: (
      <div className="flex flex-col gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm flex-1" />
        <div className="bg-muted-foreground/30 rounded-sm flex-1" />
        <div className="bg-muted-foreground/30 rounded-sm flex-1" />
      </div>
    ),
  },
  {
    id: 'story',
    name: 'สตอรี่',
    preview: (
      <div className="grid grid-cols-5 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'collage',
    name: 'คอลลาจ',
    preview: (
      <div className="grid grid-cols-6 grid-rows-2 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm col-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-3 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'asymmetric',
    name: 'อสมมาตร',
    preview: (
      <div className="grid grid-cols-5 grid-rows-2 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm col-span-3 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm" style={{ height: '60%' }} />
        <div className="bg-muted-foreground/30 rounded-sm" style={{ height: '80%' }} />
        <div className="bg-muted-foreground/30 rounded-sm" style={{ height: '50%' }} />
      </div>
    ),
  },
  {
    id: 'spotlight',
    name: 'สปอตไลท์',
    preview: (
      <div className="grid grid-cols-4 grid-rows-2 gap-0.5 w-full h-full p-0.5">
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm col-span-2 row-span-2" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
        <div className="bg-muted-foreground/30 rounded-sm" />
      </div>
    ),
  },
];

interface GalleryLayoutSelectorProps {
  value: GalleryLayout;
  onChange: (layout: GalleryLayout) => void;
}

export function GalleryLayoutSelector({ value, onChange }: GalleryLayoutSelectorProps) {
  return (
    <div className="space-y-3">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as GalleryLayout)}
        className="flex flex-wrap gap-2 justify-start"
      >
        {layoutOptions.map((layout) => (
          <ToggleGroupItem
            key={layout.id}
            value={layout.id}
            aria-label={layout.name}
            className={cn(
              "flex flex-col items-center gap-1 p-2 h-auto w-20 border rounded-lg",
              "data-[state=on]:border-primary data-[state=on]:bg-primary/10"
            )}
          >
            <div className="w-12 h-10 rounded overflow-hidden bg-muted">
              {layout.preview}
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
              {layout.name}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export { layoutOptions };
