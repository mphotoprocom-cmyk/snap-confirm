// Collage Builder Types & Presets - Based on PHP original

// --- Types ---
export interface CollageSlot {
  x: number; // 0.0 - 1.0 percentage
  y: number;
  w: number;
  h: number;
}

export interface CollageLayoutDefaults {
  gutter?: number;
  radius?: number;
  bg?: string;
}

export interface CollageLayout {
  id: string;
  name: string;
  slots: CollageSlot[];
  defaults?: CollageLayoutDefaults;
}

export interface CollageLayoutsData {
  meta: { version: number };
  presets: CollageLayout[];
}

export interface ResolutionPreset {
  id: string;
  name: string;
  w: number;
  h: number;
}

export interface WatermarkFont {
  value: string;
  label: string;
}

export interface CollageImageObj {
  img: HTMLImageElement;
  slotIndex: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  mode: 'fill' | 'fit';
}

export interface CollageWatermark {
  enabled: boolean;
  text: string;
  size: number;
  opacity: number;
  margin: number;
  position: string;
  fontFamily: string;
  weight: number;
  color: string;
}

// --- Resolution Presets ---
export const RES_PRESETS: ResolutionPreset[] = [
  // Popular mobile
  { id: 'fb2048x1366',    name: '2048\u00d71366 (Facebook Post)',    w: 2048, h: 1366 },
  { id: 'story1080x1920', name: '1080\u00d71920 (Story/Reels/TikTok)', w: 1080, h: 1920 },
  { id: 'ig1080x1350',    name: '1080\u00d71350 (IG Portrait)',        w: 1080, h: 1350 },
  { id: 'sq1080',         name: '1080\u00d71080 (Square \u2013 All)',       w: 1080, h: 1080 },

  // Landscape posts
  { id: 'fb1200x630',     name: '1200\u00d7630 (Facebook Landscape)',  w: 1200, h: 630 },
  { id: 'x1600x900',      name: '1600\u00d7900 (X/Twitter Post 16:9)', w: 1600, h: 900 },
  { id: 'x1200x675',      name: '1200\u00d7675 (X/Twitter Post Alt)',  w: 1200, h: 675 },
  { id: 'story1920x1080', name: '1920\u00d71080 (Story/FHD 16:9)',     w: 1920, h: 1080 },

  // Facebook covers
  { id: 'fbcover820x312', name: '820\u00d7312 (Facebook Cover \u2013 Desktop)', w: 820,  h: 312 },
  { id: 'fbcover640x360', name: '640\u00d7360 (Facebook Cover \u2013 Mobile)',  w: 640,  h: 360 },

  // Instagram
  { id: 'ig1080x566',     name: '1080\u00d7566 (IG Landscape)',        w: 1080, h: 566 },

  // X/Twitter
  { id: 'xheader1500x500', name: '1500\u00d7500 (X/Twitter Header)',   w: 1500, h: 500 },

  // LINE OA
  { id: 'line1040x1040',  name: '1040\u00d71040 (LINE OA Post)',       w: 1040, h: 1040 },
  { id: 'linecover1080x878', name: '1080\u00d7878 (LINE OA Cover)',    w: 1080, h: 878 },

  // Profile avatars
  { id: 'ytprofile800',   name: '800\u00d7800 (YouTube Profile)',      w: 800,  h: 800 },
  { id: 'lineprofile640', name: '640\u00d7640 (LINE OA Profile)',      w: 640,  h: 640 },
  { id: 'fbprofile400',   name: '400\u00d7400 (Profile Facebook/X)',   w: 400,  h: 400 },
  { id: 'igprofile320',   name: '320\u00d7320 (IG Profile)',           w: 320,  h: 320 },
  { id: 'tiktokprofile200', name: '200\u00d7200 (TikTok Profile)',     w: 200,  h: 200 },

  // Video/YouTube
  { id: 'hd1280x720',     name: '1280\u00d7720 (HD 16:9 / YouTube Thumbnail)', w: 1280, h: 720 },
  { id: 'qhd2560x1440',   name: '2560\u00d71440 (YouTube Channel Art / 2K QHD)', w: 2560, h: 1440 },
  { id: 'uhd3840x2160',   name: '3840\u00d72160 (4K UHD)',              w: 3840, h: 2160 },
];

// --- Watermark Positions ---
export const WATERMARK_POSITIONS = [
  { value: 'BL', label: '\u0e0b\u0e49\u0e32\u0e22\u0e25\u0e48\u0e32\u0e07' },
  { value: 'BR', label: '\u0e02\u0e27\u0e32\u0e25\u0e48\u0e32\u0e07' },
  { value: 'TL', label: '\u0e0b\u0e49\u0e32\u0e22\u0e1a\u0e19' },
  { value: 'TR', label: '\u0e02\u0e27\u0e32\u0e1a\u0e19' },
  { value: 'BC', label: '\u0e01\u0e25\u0e32\u0e07\u0e25\u0e48\u0e32\u0e07' },
  { value: 'TC', label: '\u0e01\u0e25\u0e32\u0e07\u0e1a\u0e19' },
  { value: 'CL', label: '\u0e01\u0e25\u0e32\u0e07\u0e0b\u0e49\u0e32\u0e22' },
  { value: 'CR', label: '\u0e01\u0e25\u0e32\u0e07\u0e02\u0e27\u0e32' },
  { value: 'C',  label: '\u0e01\u0e36\u0e48\u0e07\u0e01\u0e25\u0e32\u0e07' },
] as const;

// --- Watermark Fonts ---
export const WATERMARK_FONTS: WatermarkFont[] = [
  // Thai fonts
  { value: "'Prompt', system-ui, sans-serif", label: 'Prompt' },
  { value: "'Kanit', system-ui, sans-serif", label: 'Kanit' },
  { value: "'Sarabun', system-ui, sans-serif", label: 'Sarabun' },
  { value: "'Noto Sans Thai', system-ui, sans-serif", label: 'Noto Sans Thai' },
  { value: "'Noto Serif Thai', system-ui, sans-serif", label: 'Noto Serif Thai' },
  { value: "'IBM Plex Sans Thai', system-ui, sans-serif", label: 'IBM Plex Sans Thai' },
  { value: "'Bai Jamjuree', system-ui, sans-serif", label: 'Bai Jamjuree' },
  { value: "'Mitr', system-ui, sans-serif", label: 'Mitr' },
  { value: "'Pridi', system-ui, sans-serif", label: 'Pridi' },
  { value: "'Chakra Petch', system-ui, sans-serif", label: 'Chakra Petch' },
  { value: "'Pattaya', system-ui, sans-serif", label: 'Pattaya' },
  { value: "'Itim', system-ui, sans-serif", label: 'Itim' },
  { value: "'Mali', system-ui, sans-serif", label: 'Mali' },
  { value: "'Kodchasan', system-ui, sans-serif", label: 'Kodchasan' },
  { value: "'K2D', system-ui, sans-serif", label: 'K2D' },
  { value: "'Krub', system-ui, sans-serif", label: 'Krub' },
  { value: "'Athiti', system-ui, sans-serif", label: 'Athiti' },
  { value: "'Thasadith', system-ui, sans-serif", label: 'Thasadith' },
  { value: "'KoHo', system-ui, sans-serif", label: 'KoHo' },
  { value: "'Sriracha', system-ui, sans-serif", label: 'Sriracha' },
  { value: "'Taviraj', system-ui, sans-serif", label: 'Taviraj' },
  { value: "'Maitree', system-ui, sans-serif", label: 'Maitree' },
  { value: "'Srisakdi', system-ui, sans-serif", label: 'Srisakdi' },
  { value: "'Charmonman', system-ui, sans-serif", label: 'Charmonman' },
  { value: "'Chonburi', system-ui, sans-serif", label: 'Chonburi' },
  { value: "'Charm', system-ui, sans-serif", label: 'Charm' },
  { value: "'Fahkwang', system-ui, sans-serif", label: 'Fahkwang' },
  { value: "'Noto Sans Thai Looped', system-ui, sans-serif", label: 'Noto Sans Thai Looped' },
  // Handwriting / cursive fonts
  { value: "'Pacifico', cursive", label: 'Pacifico (Hand)' },
  { value: "'Shadows Into Light', cursive", label: 'Shadows Into Light (Hand)' },
  { value: "'Caveat', cursive", label: 'Caveat (Hand)' },
  { value: "'Dancing Script', cursive", label: 'Dancing Script (Hand)' },
  { value: "'Satisfy', cursive", label: 'Satisfy (Hand)' },
  { value: "'Indie Flower', cursive", label: 'Indie Flower (Hand)' },
  { value: "'Amatic SC', cursive", label: 'Amatic SC (Hand)' },
  { value: "'Gloria Hallelujah', cursive", label: 'Gloria Hallelujah (Hand)' },
  { value: "'Patrick Hand', cursive", label: 'Patrick Hand (Hand)' },
  { value: "'Handlee', cursive", label: 'Handlee (Hand)' },
  { value: "'Sacramento', cursive", label: 'Sacramento (Hand)' },
  { value: "'Great Vibes', cursive", label: 'Great Vibes (Hand)' },
  { value: "'Allura', cursive", label: 'Allura (Hand)' },
  { value: "'Kaushan Script', cursive", label: 'Kaushan Script (Hand)' },
  { value: "'Courgette', cursive", label: 'Courgette (Hand)' },
  { value: "'Yellowtail', cursive", label: 'Yellowtail (Hand)' },
  { value: "'Alex Brush', cursive", label: 'Alex Brush (Hand)' },
  { value: "'Homemade Apple', cursive", label: 'Homemade Apple (Hand)' },
  { value: "'Nothing You Could Do', cursive", label: 'Nothing You Could Do (Hand)' },
  { value: "'Reenie Beanie', cursive", label: 'Reenie Beanie (Hand)' },
];

// --- Default watermark state ---
export const DEFAULT_WATERMARK: CollageWatermark = {
  enabled: false,
  text: '',
  size: 48,
  opacity: 0.15,
  margin: 64,
  position: 'BR',
  fontFamily: "'Prompt', system-ui, sans-serif",
  weight: 700,
  color: '#000000',
};
