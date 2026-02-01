export type TemplateType = 'classic' | 'modern' | 'floral' | 'minimal' | 'luxury';

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
];

export const getTemplateConfig = (templateId: TemplateType): TemplateConfig => {
  return TEMPLATE_CONFIGS.find(t => t.id === templateId) || TEMPLATE_CONFIGS[0];
};
