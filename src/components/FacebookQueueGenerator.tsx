import { useState, useRef, ChangeEvent } from 'react';
import { Booking, JOB_TYPE_LABELS } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Image as ImageIcon, Loader2, X, ZoomIn, Move } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

interface FacebookQueueGeneratorProps {
  booking: Booking;
  onClose: () => void;
}
type TemplateTheme = 'elegant' | 'modern' | 'minimal';
type TextPosition = 'left' | 'center' | 'right';
type TextSize = 'small' | 'medium' | 'large';

const textSizeConfig: Record<TextSize, { overlayWidth: number; overlayHeight: number; fontScale: number; name: string }> = {
  small: { overlayWidth: 0.50, overlayHeight: 0.32, fontScale: 0.8, name: 'เล็ก' },
  medium: { overlayWidth: 0.60, overlayHeight: 0.36, fontScale: 1, name: 'กลาง' },
  large: { overlayWidth: 0.70, overlayHeight: 0.42, fontScale: 1.2, name: 'ใหญ่' },
};

const themeStyles: Record<TemplateTheme, { 
  overlayBg: string; 
  textPrimary: string; 
  textSecondary: string;
  accent: string; 
  accentBg: string;
  name: string;
  borderColor: string;
}> = {
  elegant: {
    overlayBg: 'rgba(255, 255, 255, 0.95)',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    accent: '#c49b66',
    accentBg: '#f8f4ef',
    borderColor: '#e8ddd0',
    name: 'Elegant',
  },
  modern: {
    overlayBg: 'rgba(255, 255, 255, 0.98)',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#3b82f6',
    accentBg: '#eff6ff',
    borderColor: '#e2e8f0',
    name: 'Modern',
  },
  minimal: {
    overlayBg: 'rgba(0, 0, 0, 0.85)',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#ffffff',
    accentBg: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
    name: 'Minimal',
  },
};

const JOB_TYPE_LABELS_TH: Record<string, string> = {
  wedding: 'ถ่ายงานแต่ง',
  event: 'ถ่ายงานอีเว้นท์',
  corporate: 'ถ่ายงานองค์กร',
  portrait: 'ถ่ายภาพบุคคล',
  other: 'รับถ่ายภาพ',
};

const THAI_DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_MONTH_NAMES = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

interface CustomText {
  jobType: string;
  location: string;
  studioName: string;
  studioTagline: string;
  contact: string;
}

export function FacebookQueueGenerator({ booking, onClose }: FacebookQueueGeneratorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<TemplateTheme>('elegant');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile } = useProfile();

  // Image position controls
  const [zoom, setZoom] = useState(100);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  
  // Text box position and size
  const [textPosition, setTextPosition] = useState<TextPosition>('left');
  const [textSize, setTextSize] = useState<TextSize>('medium');

  // Custom text fields
  const [customText, setCustomText] = useState<CustomText>({
    jobType: JOB_TYPE_LABELS_TH[booking.job_type] || JOB_TYPE_LABELS[booking.job_type],
    location: booking.location || '',
    studioName: '',
    studioTagline: 'รับถ่ายภาพราคามิตรภาพ',
    contact: '',
  });

  // Initialize custom text from profile when it loads
  useState(() => {
    if (profile) {
      setCustomText(prev => ({
        ...prev,
        studioName: profile.studio_name || '',
        contact: profile.phone || '',
      }));
    }
  });

  // Update custom text when profile loads
  if (profile && !customText.studioName && profile.studio_name) {
    setCustomText(prev => ({
      ...prev,
      studioName: profile.studio_name || '',
      contact: profile.phone || '',
    }));
  }

  // Calculate output dimensions - height fixed at 2048, width based on original aspect ratio
  const outputHeight = 2048;
  const outputWidth = imageDimensions 
    ? Math.round((imageDimensions.width / imageDimensions.height) * outputHeight)
    : 1365;

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ไม่ควรเกิน 15MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setUploadedImage(event.target?.result as string);
          // Reset position on new image
          setZoom(100);
          setPosX(50);
          setPosY(50);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getTimeSlot = () => {
    if (!booking.time_start) return '';
    const hour = parseInt(booking.time_start.split(':')[0]);
    if (hour < 12) return 'เช้า';
    if (hour < 17) return 'เช้า-เที่ยง';
    return 'เย็น';
  };

  const formatThaiDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const dayName = THAI_DAY_NAMES[date.getDay()];
    const monthName = THAI_MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear() + 543;
    return { day, dayName, monthName, year };
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !imageDimensions) {
      toast.error('กรุณาอัปโหลดรูปภาพก่อน');
      return;
    }

    setIsGenerating(true);
    
    try {
      const theme = themeStyles[selectedTheme];
      const thaiDate = formatThaiDate(booking.event_date);
      const timeSlot = getTimeSlot();
      
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d')!;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = uploadedImage;
      });

      // Calculate zoomed dimensions
      const scale = zoom / 100;
      const scaledWidth = outputWidth * scale;
      const scaledHeight = outputHeight * scale;
      
      // Calculate position offset based on posX/posY (0-100 range)
      const maxOffsetX = scaledWidth - outputWidth;
      const maxOffsetY = scaledHeight - outputHeight;
      const offsetX = -(maxOffsetX * (posX / 100));
      const offsetY = -(maxOffsetY * (posY / 100));

      // Draw image with zoom and position
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Calculate overlay dimensions based on position and size
      const sizeConfig = textSizeConfig[textSize];
      const padding = outputWidth * 0.03;
      const overlayWidth = outputWidth * sizeConfig.overlayWidth;
      const overlayHeight = outputHeight * sizeConfig.overlayHeight;
      const fontScale = sizeConfig.fontScale;
      
      // Calculate X position based on textPosition
      let overlayX: number;
      if (textPosition === 'left') {
        overlayX = padding;
      } else if (textPosition === 'right') {
        overlayX = outputWidth - overlayWidth - padding;
      } else {
        overlayX = (outputWidth - overlayWidth) / 2;
      }
      const overlayY = outputHeight - overlayHeight - padding;

      // Draw overlay background with rounded corners
      ctx.fillStyle = theme.overlayBg;
      ctx.beginPath();
      const radius = 12;
      ctx.moveTo(overlayX + radius, overlayY);
      ctx.lineTo(overlayX + overlayWidth - radius, overlayY);
      ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + radius);
      ctx.lineTo(overlayX + overlayWidth, overlayY + overlayHeight - radius);
      ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX + overlayWidth - radius, overlayY + overlayHeight);
      ctx.lineTo(overlayX + radius, overlayY + overlayHeight);
      ctx.quadraticCurveTo(overlayX, overlayY + overlayHeight, overlayX, overlayY + overlayHeight - radius);
      ctx.lineTo(overlayX, overlayY + radius);
      ctx.quadraticCurveTo(overlayX, overlayY, overlayX + radius, overlayY);
      ctx.closePath();
      ctx.fill();

      const innerPadding = padding * 1.2;
      const contentX = overlayX + innerPadding;
      let currentY = overlayY + innerPadding * 1.5;

      // Decorative line
      ctx.fillStyle = theme.accent;
      ctx.fillRect(contentX, currentY - innerPadding * 0.5, overlayWidth - innerPadding * 2, 3);

      // "BOOKING" label
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `500 ${outputWidth * 0.018 * fontScale}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('— BOOKING —', contentX, currentY + innerPadding * 0.5);
      currentY += innerPadding * 1.5;

      // Job type (custom text)
      if (customText.jobType) {
        ctx.fillStyle = theme.textPrimary;
        ctx.font = `700 ${outputWidth * 0.055 * fontScale}px Sarabun, sans-serif`;
        ctx.fillText(customText.jobType, contentX, currentY);
        currentY += innerPadding * 1.8;
      }

      // Location (custom text)
      if (customText.location) {
        ctx.fillStyle = theme.accent;
        ctx.font = `600 ${outputWidth * 0.032 * fontScale}px Sarabun, sans-serif`;
        ctx.fillText(customText.location, contentX, currentY);
        currentY += innerPadding * 1.4;
      }

      // Studio tagline and name (custom text)
      if (customText.studioName) {
        if (customText.studioTagline) {
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `italic 500 ${outputWidth * 0.022 * fontScale}px Georgia, serif`;
          ctx.fillText(customText.studioTagline, contentX, currentY);
          currentY += innerPadding * 0.9;
        }
        
        ctx.font = `italic 600 ${outputWidth * 0.038 * fontScale}px Georgia, serif`;
        ctx.fillStyle = theme.accent;
        ctx.fillText(customText.studioName, contentX, currentY);
        currentY += innerPadding * 1.6;
      }

      // Date section
      ctx.fillStyle = theme.accentBg;
      const dayBoxWidth = outputWidth * 0.12 * fontScale;
      const dayBoxHeight = innerPadding * 0.9;
      ctx.fillRect(contentX, currentY - dayBoxHeight * 0.7, dayBoxWidth, dayBoxHeight);
      
      ctx.fillStyle = theme.textPrimary;
      ctx.font = `500 ${outputWidth * 0.018 * fontScale}px Sarabun, sans-serif`;
      ctx.fillText(`วัน${thaiDate.dayName}`, contentX + dayBoxWidth * 0.12, currentY);
      currentY += innerPadding * 0.3;

      const dayNumY = currentY + innerPadding * 1.8;
      
      ctx.fillStyle = theme.accent;
      ctx.font = `700 ${outputWidth * 0.09 * fontScale}px Inter, sans-serif`;
      ctx.fillText(thaiDate.day.toString(), contentX, dayNumY);
      
      const dayNumWidth = ctx.measureText(thaiDate.day.toString()).width;
      
      const lineX = contentX + dayNumWidth + innerPadding * 0.5;
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lineX, currentY + innerPadding * 0.3);
      ctx.lineTo(lineX, dayNumY + innerPadding * 0.2);
      ctx.stroke();

      const monthX = lineX + innerPadding * 0.5;
      ctx.fillStyle = theme.textPrimary;
      ctx.font = `600 ${outputWidth * 0.028 * fontScale}px Sarabun, sans-serif`;
      ctx.fillText(thaiDate.monthName, monthX, currentY + innerPadding * 1);
      
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 ${outputWidth * 0.02 * fontScale}px Sarabun, sans-serif`;
      ctx.fillText(`${thaiDate.year}${timeSlot ? ` | ${timeSlot}` : ''}`, monthX, currentY + innerPadding * 1.7);

      currentY = dayNumY + innerPadding * 1;

      // Contact (custom text)
      if (customText.contact) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 ${outputWidth * 0.016 * fontScale}px Sarabun, sans-serif`;
        ctx.fillText(`สอบถามรายละเอียดเพิ่มเติม ติดต่อ`, contentX, currentY);
        currentY += innerPadding * 0.6;
        
        ctx.fillStyle = theme.textPrimary;
        ctx.font = `600 ${outputWidth * 0.02 * fontScale}px Inter, sans-serif`;
        ctx.fillText(customText.contact, contentX, currentY);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `fb-queue-${booking.booking_number}-${outputWidth}x${outputHeight}.jpg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('ดาวน์โหลดรูปภาพสำเร็จ!');
        }
      }, 'image/jpeg', 0.95);

    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('ไม่สามารถสร้างรูปภาพได้');
    } finally {
      setIsGenerating(false);
    }
  };

  const theme = themeStyles[selectedTheme];
  const thaiDate = booking.event_date ? formatThaiDate(booking.event_date) : null;

  // Calculate preview image style
  const previewImageStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${posX}% ${posY}%`,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[95vh] flex flex-col bg-card">
        {/* Header */}
        <div className="flex-shrink-0 bg-card border-b p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-lg font-medium">สร้างรูปลงคิว Facebook</h2>
            <p className="text-sm text-muted-foreground">
              ขนาด: {imageDimensions ? `${outputWidth} x ${outputHeight} px` : 'อัปโหลดรูปเพื่อกำหนดขนาด'} (ความสูง 2048px)
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="overflow-y-auto pr-2 space-y-5">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="font-medium">อัปโหลดรูปภาพ</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="relative rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-auto max-h-[120px] object-contain"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageDimensions?.width} x {imageDimensions?.height} px
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    เปลี่ยนรูป
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">คลิกเพื่ออัปโหลดรูป</span>
                </button>
              )}
            </div>

            {/* Image Position Controls */}
            {uploadedImage && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <Label className="font-medium flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  ปรับตำแหน่งรูป
                </Label>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" /> ซูม
                      </span>
                      <span className="text-muted-foreground">{zoom}%</span>
                    </div>
                    <Slider
                      value={[zoom]}
                      onValueChange={(v) => setZoom(v[0])}
                      min={100}
                      max={200}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ตำแหน่งแนวนอน</span>
                      <span className="text-muted-foreground">{posX}%</span>
                    </div>
                    <Slider
                      value={[posX]}
                      onValueChange={(v) => setPosX(v[0])}
                      min={0}
                      max={100}
                      step={1}
                      disabled={zoom <= 100}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ตำแหน่งแนวตั้ง</span>
                      <span className="text-muted-foreground">{posY}%</span>
                    </div>
                    <Slider
                      value={[posY]}
                      onValueChange={(v) => setPosY(v[0])}
                      min={0}
                      max={100}
                      step={1}
                      disabled={zoom <= 100}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {/* Theme Selection */}
              <div className="space-y-2">
                <Label className="font-medium text-xs">ธีม</Label>
                <RadioGroup
                  value={selectedTheme}
                  onValueChange={(v) => setSelectedTheme(v as TemplateTheme)}
                  className="grid grid-cols-3 gap-1"
                >
                  {(Object.keys(themeStyles) as TemplateTheme[]).map((themeKey) => (
                    <div key={themeKey}>
                      <RadioGroupItem
                        value={themeKey}
                        id={themeKey}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={themeKey}
                        className={`flex flex-col items-center gap-0.5 rounded-lg border-2 p-1 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 hover:bg-secondary/50 ${
                          selectedTheme === themeKey ? 'border-accent bg-accent/5' : 'border-border'
                        }`}
                      >
                        <div 
                          className="w-full h-3 rounded" 
                          style={{ backgroundColor: themeKey === 'minimal' ? '#1a1a1a' : '#ffffff' }} 
                        />
                        <span className="text-[9px] font-medium">{themeStyles[themeKey].name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Text Position Selection */}
              <div className="space-y-2">
                <Label className="font-medium text-xs">ตำแหน่ง</Label>
                <RadioGroup
                  value={textPosition}
                  onValueChange={(v) => setTextPosition(v as TextPosition)}
                  className="grid grid-cols-3 gap-1"
                >
                  <div>
                    <RadioGroupItem value="left" id="pos-left" className="peer sr-only" />
                    <Label
                      htmlFor="pos-left"
                      className={`flex flex-col items-center gap-0.5 rounded-lg border-2 p-1 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 hover:bg-secondary/50 ${
                        textPosition === 'left' ? 'border-accent bg-accent/5' : 'border-border'
                      }`}
                    >
                      <div className="w-full h-3 bg-secondary rounded relative">
                        <div className="absolute bottom-0.5 left-0.5 w-2/5 h-1 bg-accent/50 rounded-sm" />
                      </div>
                      <span className="text-[9px] font-medium">ซ้าย</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="center" id="pos-center" className="peer sr-only" />
                    <Label
                      htmlFor="pos-center"
                      className={`flex flex-col items-center gap-0.5 rounded-lg border-2 p-1 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 hover:bg-secondary/50 ${
                        textPosition === 'center' ? 'border-accent bg-accent/5' : 'border-border'
                      }`}
                    >
                      <div className="w-full h-3 bg-secondary rounded relative">
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2/5 h-1 bg-accent/50 rounded-sm" />
                      </div>
                      <span className="text-[9px] font-medium">กลาง</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="right" id="pos-right" className="peer sr-only" />
                    <Label
                      htmlFor="pos-right"
                      className={`flex flex-col items-center gap-0.5 rounded-lg border-2 p-1 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 hover:bg-secondary/50 ${
                        textPosition === 'right' ? 'border-accent bg-accent/5' : 'border-border'
                      }`}
                    >
                      <div className="w-full h-3 bg-secondary rounded relative">
                        <div className="absolute bottom-0.5 right-0.5 w-2/5 h-1 bg-accent/50 rounded-sm" />
                      </div>
                      <span className="text-[9px] font-medium">ขวา</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Text Size Selection */}
              <div className="space-y-2">
                <Label className="font-medium text-xs">ขนาดกล่อง</Label>
                <RadioGroup
                  value={textSize}
                  onValueChange={(v) => setTextSize(v as TextSize)}
                  className="grid grid-cols-3 gap-1"
                >
                  {(Object.keys(textSizeConfig) as TextSize[]).map((sizeKey) => (
                    <div key={sizeKey}>
                      <RadioGroupItem
                        value={sizeKey}
                        id={`size-${sizeKey}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`size-${sizeKey}`}
                        className={`flex flex-col items-center gap-0.5 rounded-lg border-2 p-1 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 hover:bg-secondary/50 ${
                          textSize === sizeKey ? 'border-accent bg-accent/5' : 'border-border'
                        }`}
                      >
                        <div className="w-full h-3 bg-secondary rounded relative flex items-end justify-center pb-0.5">
                          <div 
                            className="bg-accent/50 rounded-sm h-1"
                            style={{ width: sizeKey === 'small' ? '30%' : sizeKey === 'medium' ? '50%' : '70%' }}
                          />
                        </div>
                        <span className="text-[9px] font-medium">{textSizeConfig[sizeKey].name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Custom Text */}
            <div className="space-y-3">
              <Label className="font-medium">ปรับแต่งข้อความ</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">ประเภทงาน</Label>
                  <Input
                    value={customText.jobType}
                    onChange={(e) => setCustomText(prev => ({ ...prev, jobType: e.target.value }))}
                    placeholder="เช่น ถ่ายงานแต่ง"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">สถานที่</Label>
                  <Input
                    value={customText.location}
                    onChange={(e) => setCustomText(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="เช่น อ.ลำปลายมาศ"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">แท็กไลน์</Label>
                  <Input
                    value={customText.studioTagline}
                    onChange={(e) => setCustomText(prev => ({ ...prev, studioTagline: e.target.value }))}
                    placeholder="เช่น รับถ่ายภาพราคามิตรภาพ"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">ชื่อสตูดิโอ</Label>
                  <Input
                    value={customText.studioName}
                    onChange={(e) => setCustomText(prev => ({ ...prev, studioName: e.target.value }))}
                    placeholder="เช่น MPhoto"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">เบอร์ติดต่อ / Line ID</Label>
                  <Input
                    value={customText.contact}
                    onChange={(e) => setCustomText(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="เช่น 083-7412931"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>วันที่:</strong> วัน{thaiDate?.dayName} {thaiDate?.day} {thaiDate?.monthName} {thaiDate?.year}
                  {getTimeSlot() && ` | ${getTimeSlot()}`}
                </p>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!uploadedImage || isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  ดาวน์โหลดรูปลงคิว
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Live Preview */}
          <div className="flex flex-col h-full min-h-0">
            <Label className="font-medium flex-shrink-0 mb-2 text-sm">ตัวอย่าง</Label>
            <div className="flex-1 bg-secondary/50 rounded-lg p-3 flex items-center justify-center overflow-hidden">
              <div 
                className="relative rounded-lg overflow-hidden shadow-lg"
                style={{ 
                  width: '100%',
                  maxWidth: '260px',
                  aspectRatio: imageDimensions ? `${imageDimensions.width}/${imageDimensions.height}` : '2/3'
                }}
              >
                {/* Background Image with zoom/position */}
                {uploadedImage ? (
                  <div className="w-full h-full overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={previewImageStyle}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                {/* Overlay Section - Match Canvas Rendering Exactly */}
                <div 
                  className="absolute rounded-lg"
                  style={{ 
                    backgroundColor: theme.overlayBg,
                    width: `${textSizeConfig[textSize].overlayWidth * 100}%`,
                    height: `${textSizeConfig[textSize].overlayHeight * 100}%`,
                    bottom: '3%',
                    left: textPosition === 'left' ? '3%' : textPosition === 'right' ? 'auto' : '50%',
                    right: textPosition === 'right' ? '3%' : 'auto',
                    transform: textPosition === 'center' ? 'translateX(-50%)' : 'none',
                    paddingTop: '3.6%',
                    paddingLeft: '3.6%',
                    paddingRight: '3.6%',
                    paddingBottom: '2%',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top line - matches canvas: overlayWidth - innerPadding * 2 */}
                  <div 
                    className="w-full mb-[2%]"
                    style={{ 
                      backgroundColor: theme.accent,
                      height: '1.5%',
                    }}
                  />
                  
                  {/* BOOKING label - matches canvas: 0.018 * fontScale */}
                  <p 
                    className="tracking-wider"
                    style={{ 
                      color: theme.textSecondary,
                      fontSize: `${1.8 * textSizeConfig[textSize].fontScale}%`,
                      marginBottom: '1%',
                    }}
                  >
                    — BOOKING —
                  </p>

                  {/* Job type - matches canvas: 0.055 * fontScale */}
                  {customText.jobType && (
                    <h3 
                      className="font-bold leading-tight"
                      style={{ 
                        color: theme.textPrimary,
                        fontSize: `${5.5 * textSizeConfig[textSize].fontScale}%`,
                        marginBottom: '2%',
                      }}
                    >
                      {customText.jobType}
                    </h3>
                  )}

                  {/* Location - matches canvas: 0.032 * fontScale */}
                  {customText.location && (
                    <p 
                      style={{ 
                        color: theme.accent,
                        fontSize: `${3.2 * textSizeConfig[textSize].fontScale}%`,
                        marginBottom: '1.5%',
                      }}
                    >
                      {customText.location}
                    </p>
                  )}

                  {/* Studio info - matches canvas: tagline 0.022, name 0.038 */}
                  {customText.studioName && (
                    <>
                      {customText.studioTagline && (
                        <p 
                          className="italic"
                          style={{ 
                            color: theme.textSecondary,
                            fontSize: `${2.2 * textSizeConfig[textSize].fontScale}%`,
                            marginBottom: '0.5%',
                          }}
                        >
                          {customText.studioTagline}
                        </p>
                      )}
                      <p 
                        className="italic font-semibold"
                        style={{ 
                          color: theme.accent,
                          fontSize: `${3.8 * textSizeConfig[textSize].fontScale}%`,
                          marginBottom: '2%',
                        }}
                      >
                        {customText.studioName}
                      </p>
                    </>
                  )}

                  {/* Date section - matches canvas ratios */}
                  <div className="flex items-center" style={{ gap: '2%', marginTop: '1%' }}>
                    <div>
                      <p 
                        style={{ 
                          color: theme.textPrimary,
                          fontSize: `${1.8 * textSizeConfig[textSize].fontScale}%`,
                        }}
                      >
                        วัน{thaiDate?.dayName}
                      </p>
                      <p 
                        className="font-bold leading-none"
                        style={{ 
                          color: theme.accent,
                          fontSize: `${9 * textSizeConfig[textSize].fontScale}%`,
                        }}
                      >
                        {thaiDate?.day}
                      </p>
                    </div>
                    <div 
                      style={{ 
                        backgroundColor: theme.borderColor,
                        width: '1px',
                        height: `${8 * textSizeConfig[textSize].fontScale}%`,
                        minHeight: '12px',
                      }}
                    />
                    <div>
                      <p 
                        className="font-semibold"
                        style={{ 
                          color: theme.textPrimary,
                          fontSize: `${2.8 * textSizeConfig[textSize].fontScale}%`,
                        }}
                      >
                        {thaiDate?.monthName}
                      </p>
                      <p 
                        style={{ 
                          color: theme.textSecondary,
                          fontSize: `${2 * textSizeConfig[textSize].fontScale}%`,
                        }}
                      >
                        {thaiDate?.year} | {getTimeSlot() || 'ตลอดวัน'}
                      </p>
                    </div>
                  </div>

                  {/* Contact - matches canvas: 0.016, 0.02 */}
                  {customText.contact && (
                    <div style={{ marginTop: '2%' }}>
                      <p 
                        style={{ 
                          color: theme.textSecondary,
                          fontSize: `${1.6 * textSizeConfig[textSize].fontScale}%`,
                        }}
                      >
                        สอบถามรายละเอียดเพิ่มเติม ติดต่อ
                      </p>
                      <p 
                        className="font-semibold"
                        style={{ 
                          color: theme.textPrimary,
                          fontSize: `${2 * textSizeConfig[textSize].fontScale}%`,
                        }}
                      >
                        {customText.contact}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              * ขนาดจริง {imageDimensions ? `${outputWidth}x${outputHeight}` : '?'}px
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
