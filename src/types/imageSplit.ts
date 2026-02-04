// Image Split Template Types - Based on PHP original

export interface Region {
  x: number; // 0.0 - 1.0 percentage
  y: number;
  w: number;
  h: number;
}

export interface SplitTemplate {
  id: string;
  name: string;
  frame_aspect: [number, number]; // [width ratio, height ratio]
  regions: Record<string, Region>;
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
  format: 'jpeg' | 'png' | 'webp';
}

// Template definitions - exact match from PHP get_templates()
export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    id: 'fb-5-panel',
    name: 'Facebook 5 Panel',
    frame_aspect: [1, 1],
    regions: {
      'A': { x: 0.0, y: 0.0, w: 0.5, h: 0.5 },
      'B': { x: 0.0, y: 0.5, w: 0.5, h: 0.5 },
      'C': { x: 0.5, y: 0.0, w: 0.5, h: 1.0 / 3.0 },
      'D': { x: 0.5, y: 1.0 / 3.0, w: 0.5, h: 1.0 / 3.0 },
      'E': { x: 0.5, y: 2.0 / 3.0, w: 0.5, h: 1.0 / 3.0 },
    },
  },
  {
    id: 'layout-abc',
    name: 'A top, B-C bottom',
    frame_aspect: [1, 1],
    regions: {
      'A': { x: 0.0, y: 0.0, w: 1.0, h: 0.5 },
      'B': { x: 0.0, y: 0.5, w: 0.5, h: 0.5 },
      'C': { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    },
  },
  {
    id: 'layout-abcd-vertical',
    name: 'A left, B-C-D right',
    frame_aspect: [1, 1],
    regions: {
      'A': { x: 0.0, y: 0.0, w: 0.7, h: 1.0 },
      'B': { x: 0.7, y: 0.0, w: 0.3, h: 1.0 / 3.0 },
      'C': { x: 0.7, y: 1.0 / 3.0, w: 0.3, h: 1.0 / 3.0 },
      'D': { x: 0.7, y: 2.0 / 3.0, w: 0.3, h: 1.0 / 3.0 },
    },
  },
  {
    id: 'layout-abcd-bottom',
    name: 'A top, B-C-D bottom',
    frame_aspect: [1, 1],
    regions: {
      'A': { x: 0.0, y: 0.0, w: 1.0, h: 0.6 },
      'B': { x: 0.0, y: 0.6, w: 1.0 / 3.0, h: 0.4 },
      'C': { x: 1.0 / 3.0, y: 0.6, w: 1.0 / 3.0, h: 0.4 },
      'D': { x: 2.0 / 3.0, y: 0.6, w: 1.0 / 3.0, h: 0.4 },
    },
  },
  {
    id: 'layout-abcde-bottom',
    name: 'A-B top / C-D-E bottom',
    frame_aspect: [1, 1],
    regions: {
      'A': { x: 0.0, y: 0.0, w: 0.5, h: 0.5 },
      'B': { x: 0.5, y: 0.0, w: 0.5, h: 0.5 },
      'C': { x: 0.0, y: 0.5, w: 1.0 / 3.0, h: 0.5 },
      'D': { x: 1.0 / 3.0, y: 0.5, w: 1.0 / 3.0, h: 0.5 },
      'E': { x: 2.0 / 3.0, y: 0.5, w: 1.0 / 3.0, h: 0.5 },
    },
  },
  {
    id: 'ig-4-square',
    name: '2x2 squares',
    frame_aspect: [1, 1],
    regions: {
      'A': { x: 0.0, y: 0.0, w: 0.5, h: 0.5 },
      'B': { x: 0.5, y: 0.0, w: 0.5, h: 0.5 },
      'C': { x: 0.0, y: 0.5, w: 0.5, h: 0.5 },
      'D': { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    },
  },
  {
    id: 'full-3-vertical',
    name: '3 strips',
    frame_aspect: [1, 1],
    regions: {
      'A': { x: 0.0, y: 0.0, w: 1.0, h: 1.0 / 3.0 },
      'B': { x: 0.0, y: 1.0 / 3.0, w: 1.0, h: 1.0 / 3.0 },
      'C': { x: 0.0, y: 2.0 / 3.0, w: 1.0, h: 1.0 / 3.0 },
    },
  },
];

export const WATERMARK_POSITIONS = [
  { value: 'center', label: 'กลาง' },
  { value: 'top-left', label: 'บนซ้าย' },
  { value: 'top-right', label: 'บนขวา' },
  { value: 'bottom-left', label: 'ล่างซ้าย' },
  { value: 'bottom-right', label: 'ล่างขวา' },
] as const;

// Helper to get region count
export function getRegionCount(template: SplitTemplate): number {
  return Object.keys(template.regions).length;
}

// Helper to get region labels in order
export function getRegionLabels(template: SplitTemplate): string[] {
  return Object.keys(template.regions).sort();
}
