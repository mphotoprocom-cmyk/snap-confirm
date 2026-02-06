export type TemplateType = 'classic' | 'modern' | 'floral' | 'minimal' | 'luxury' | 'watercolor' | 'artdeco' | 'tropical' | 'rustic' | 'bohemian' | 'vintage' | 'celestial' | 'botanical' | 'marble' | 'neon';

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  preview: string;
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'classic',
    name: 'Classic Elegance',
    description: 'ดีไซน์คลาสสิก หรูหรา ด้วยลวดลายทองอมเขียว',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Cormorant Garamond, serif',
    },
    colors: {
      primary: '#1a1a2e',
      secondary: '#c9a227',
      accent: '#d4af37',
      background: '#faf9f6',
      text: '#2d2d2d',
    },
  },
  {
    id: 'modern',
    name: 'Modern Luxe',
    description: 'ทันสมัย เรียบหรู ด้วยโทนสีขาวดำทอง',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Italiana, serif',
      body: 'Montserrat, sans-serif',
    },
    colors: {
      primary: '#000000',
      secondary: '#b8860b',
      accent: '#d4a574',
      background: '#ffffff',
      text: '#1a1a1a',
    },
  },
  {
    id: 'floral',
    name: 'Garden Romance',
    description: 'โรแมนติก ด้วยลายดอกไม้และโทนสีพาสเทล',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Great Vibes, cursive',
      body: 'Lato, sans-serif',
    },
    colors: {
      primary: '#8b5a5a',
      secondary: '#d4a5a5',
      accent: '#e8c4c4',
      background: '#fdf8f8',
      text: '#4a3f3f',
    },
  },
  {
    id: 'minimal',
    name: 'Pure Minimalist',
    description: 'เรียบง่าย สะอาดตา ด้วยโทนขาวเทา',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Bodoni Moda, serif',
      body: 'Inter, sans-serif',
    },
    colors: {
      primary: '#2c2c2c',
      secondary: '#666666',
      accent: '#999999',
      background: '#ffffff',
      text: '#333333',
    },
  },
  {
    id: 'luxury',
    name: 'Royal Opulence',
    description: 'หรูหราอลังการ ด้วยโทนสีน้ำเงินเข้มและทอง',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Cinzel, serif',
      body: 'EB Garamond, serif',
    },
    colors: {
      primary: '#1a1a3e',
      secondary: '#ffd700',
      accent: '#c9a227',
      background: '#0d0d1a',
      text: '#f5f5f5',
    },
  },
  {
    id: 'watercolor',
    name: 'Watercolor Dream',
    description: 'นุ่มนวล โรแมนติก ด้วยลายสีน้ำพาสเทล',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Cormorant Garamond, serif',
      body: 'Quicksand, sans-serif',
    },
    colors: {
      primary: '#7c9885',
      secondary: '#e8b4b8',
      accent: '#a8d5e2',
      background: '#fef9f3',
      text: '#4a5568',
    },
  },
  {
    id: 'artdeco',
    name: 'Art Deco Glamour',
    description: 'หรูหราสไตล์ยุค 1920s ด้วยลายเรขาคณิต',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Poiret One, cursive',
      body: 'Josefin Sans, sans-serif',
    },
    colors: {
      primary: '#1a1a1a',
      secondary: '#d4af37',
      accent: '#8b7355',
      background: '#f5f0e8',
      text: '#2d2d2d',
    },
  },
  {
    id: 'tropical',
    name: 'Tropical Paradise',
    description: 'สดใส ร่าเริง ด้วยใบไม้เขตร้อน',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Pacifico, cursive',
      body: 'Poppins, sans-serif',
    },
    colors: {
      primary: '#2d5a27',
      secondary: '#ff6b6b',
      accent: '#ffd93d',
      background: '#f0fff4',
      text: '#1a472a',
    },
  },
  {
    id: 'rustic',
    name: 'Rustic Charm',
    description: 'เรียบง่าย อบอุ่น สไตล์ชนบท',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Amatic SC, cursive',
      body: 'Cabin, sans-serif',
    },
    colors: {
      primary: '#8b4513',
      secondary: '#d2691e',
      accent: '#daa520',
      background: '#faf0e6',
      text: '#5d4037',
    },
  },
  {
    id: 'bohemian',
    name: 'Boho Chic',
    description: 'อิสระ ศิลปะ ด้วยลวดลายโบฮีเมียน',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Sacramento, cursive',
      body: 'Nunito, sans-serif',
    },
    colors: {
      primary: '#9c6644',
      secondary: '#e07b53',
      accent: '#dda15e',
      background: '#fefae0',
      text: '#6b4423',
    },
  },
  {
    id: 'vintage',
    name: 'Vintage Romance',
    description: 'คลาสสิก ย้อนยุค สไตล์วินเทจ',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Libre Baskerville, serif',
      body: 'Source Serif Pro, serif',
    },
    colors: {
      primary: '#704214',
      secondary: '#a67c52',
      accent: '#c9a66b',
      background: '#f5ebe0',
      text: '#4a3728',
    },
  },
  {
    id: 'celestial',
    name: 'Celestial Magic',
    description: 'ลึกลับ มหัศจรรย์ ด้วยธีมดวงดาว',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Cinzel Decorative, cursive',
      body: 'Raleway, sans-serif',
    },
    colors: {
      primary: '#1e3a5f',
      secondary: '#ffd700',
      accent: '#c0c0c0',
      background: '#0a1628',
      text: '#e8e8e8',
    },
  },
  {
    id: 'botanical',
    name: 'Botanical Garden',
    description: 'ธรรมชาติ สดชื่น ด้วยใบไม้สีเขียว',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Open Sans, sans-serif',
    },
    colors: {
      primary: '#2d5016',
      secondary: '#7cb342',
      accent: '#aed581',
      background: '#f1f8e9',
      text: '#33691e',
    },
  },
  {
    id: 'marble',
    name: 'Marble Elegance',
    description: 'หรูหรา เรียบง่าย ด้วยลายหินอ่อน',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Didot, serif',
      body: 'Lato, sans-serif',
    },
    colors: {
      primary: '#2c3e50',
      secondary: '#95a5a6',
      accent: '#bdc3c7',
      background: '#ecf0f1',
      text: '#34495e',
    },
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'ทันสมัย กล้าหาญ ด้วยสีนีออนสะดุดตา',
    preview: '/placeholder.svg',
    fonts: {
      heading: 'Bebas Neue, cursive',
      body: 'Roboto, sans-serif',
    },
    colors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: '#0a0a0a',
      text: '#ffffff',
    },
  },
];

export const getTemplateConfig = (templateId: TemplateType): TemplateConfig => {
  return TEMPLATE_CONFIGS.find(t => t.id === templateId) || TEMPLATE_CONFIGS[0];
};
