// Image Split Template Types

export interface SplitPanel {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SplitTemplate {
  id: string;
  name: string;
  icon: string;
  panels: SplitPanel[];
  width: number;
  height: number;
}

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  size: number;
  opacity: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface CropState {
  x: number;
  y: number;
  scale: number;
}

export interface OutputSettings {
  quality: number;
  prefix: string;
  format: 'jpeg' | 'png';
}

// Template definitions based on the PHP code
export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    id: 'fb-5-panel',
    name: 'Facebook 5 Panel',
    icon: '📱',
    width: 2048,
    height: 2048,
    panels: [
      { x: 0, y: 0, w: 1365, h: 1024 },
      { x: 1365, y: 0, w: 683, h: 1024 },
      { x: 0, y: 1024, w: 683, h: 1024 },
      { x: 683, y: 1024, w: 683, h: 1024 },
      { x: 1366, y: 1024, w: 682, h: 1024 },
    ],
  },
  {
    id: 'layout-abc',
    name: 'Layout ABC',
    icon: '🔳',
    width: 2048,
    height: 2048,
    panels: [
      { x: 0, y: 0, w: 1024, h: 2048 },
      { x: 1024, y: 0, w: 1024, h: 1024 },
      { x: 1024, y: 1024, w: 1024, h: 1024 },
    ],
  },
  {
    id: 'grid-2x2',
    name: 'Grid 2x2',
    icon: '⊞',
    width: 2048,
    height: 2048,
    panels: [
      { x: 0, y: 0, w: 1024, h: 1024 },
      { x: 1024, y: 0, w: 1024, h: 1024 },
      { x: 0, y: 1024, w: 1024, h: 1024 },
      { x: 1024, y: 1024, w: 1024, h: 1024 },
    ],
  },
  {
    id: 'grid-3x3',
    name: 'Grid 3x3',
    icon: '⊞',
    width: 2048,
    height: 2048,
    panels: [
      { x: 0, y: 0, w: 683, h: 683 },
      { x: 683, y: 0, w: 682, h: 683 },
      { x: 1365, y: 0, w: 683, h: 683 },
      { x: 0, y: 683, w: 683, h: 682 },
      { x: 683, y: 683, w: 682, h: 682 },
      { x: 1365, y: 683, w: 683, h: 682 },
      { x: 0, y: 1365, w: 683, h: 683 },
      { x: 683, y: 1365, w: 682, h: 683 },
      { x: 1365, y: 1365, w: 683, h: 683 },
    ],
  },
  {
    id: 'vertical-3',
    name: 'Vertical 3 Panel',
    icon: '▥',
    width: 2048,
    height: 2048,
    panels: [
      { x: 0, y: 0, w: 683, h: 2048 },
      { x: 683, y: 0, w: 682, h: 2048 },
      { x: 1365, y: 0, w: 683, h: 2048 },
    ],
  },
  {
    id: 'horizontal-3',
    name: 'Horizontal 3 Panel',
    icon: '▤',
    width: 2048,
    height: 2048,
    panels: [
      { x: 0, y: 0, w: 2048, h: 683 },
      { x: 0, y: 683, w: 2048, h: 682 },
      { x: 0, y: 1365, w: 2048, h: 683 },
    ],
  },
  {
    id: 'panorama-5',
    name: 'Panorama 5 Panel',
    icon: '🖼️',
    width: 5120,
    height: 1024,
    panels: [
      { x: 0, y: 0, w: 1024, h: 1024 },
      { x: 1024, y: 0, w: 1024, h: 1024 },
      { x: 2048, y: 0, w: 1024, h: 1024 },
      { x: 3072, y: 0, w: 1024, h: 1024 },
      { x: 4096, y: 0, w: 1024, h: 1024 },
    ],
  },
  {
    id: 'carousel-10',
    name: 'Carousel 10 Panel',
    icon: '🎠',
    width: 10240,
    height: 1024,
    panels: Array.from({ length: 10 }, (_, i) => ({
      x: i * 1024,
      y: 0,
      w: 1024,
      h: 1024,
    })),
  },
];

export const WATERMARK_POSITIONS = [
  { value: 'center', label: 'กลาง' },
  { value: 'top-left', label: 'บนซ้าย' },
  { value: 'top-right', label: 'บนขวา' },
  { value: 'bottom-left', label: 'ล่างซ้าย' },
  { value: 'bottom-right', label: 'ล่างขวา' },
] as const;
