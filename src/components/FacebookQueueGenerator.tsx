import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Booking, JOB_TYPE_LABELS } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

interface FacebookQueueGeneratorProps {
  booking: Booking;
  onClose: () => void;
}

type TemplateTheme = 'elegant' | 'modern' | 'minimal';

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

export function FacebookQueueGenerator({ booking, onClose }: FacebookQueueGeneratorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<TemplateTheme>('elegant');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile } = useProfile();

  // Calculate output dimensions - height fixed at 2048, width based on original aspect ratio
  const outputHeight = 2048;
  const outputWidth = imageDimensions 
    ? Math.round((imageDimensions.width / imageDimensions.height) * outputHeight)
    : 1365; // fallback

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
    const year = date.getFullYear() + 543; // Buddhist year
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
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d')!;

      // Draw the uploaded image (full size, no crop)
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = uploadedImage;
      });

      // Draw image to fill canvas maintaining aspect ratio
      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

      // Calculate overlay dimensions - bottom left corner
      const padding = outputWidth * 0.03;
      const overlayWidth = outputWidth * 0.65;
      const overlayHeight = outputHeight * 0.28;
      const overlayX = padding;
      const overlayY = outputHeight - overlayHeight - padding;

      // Draw semi-transparent overlay background with rounded corners effect
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

      // Draw top decorative line
      ctx.fillStyle = theme.accent;
      ctx.fillRect(contentX, currentY - innerPadding * 0.5, overlayWidth - innerPadding * 2, 3);

      // "BOOKING" label
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `500 ${outputWidth * 0.018}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('— BOOKING —', contentX, currentY + innerPadding * 0.5);
      currentY += innerPadding * 1.5;

      // Job type (Thai - large) - from booking data
      ctx.fillStyle = theme.textPrimary;
      ctx.font = `700 ${outputWidth * 0.055}px Sarabun, sans-serif`;
      ctx.fillText(JOB_TYPE_LABELS_TH[booking.job_type] || JOB_TYPE_LABELS[booking.job_type], contentX, currentY);
      currentY += innerPadding * 1.8;

      // Location (from booking data)
      if (booking.location) {
        ctx.fillStyle = theme.accent;
        ctx.font = `600 ${outputWidth * 0.032}px Sarabun, sans-serif`;
        ctx.fillText(booking.location, contentX, currentY);
        currentY += innerPadding * 1.4;
      }

      // Studio name (from profile)
      const studioName = profile?.studio_name || '';
      if (studioName) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `italic 500 ${outputWidth * 0.022}px Georgia, serif`;
        ctx.fillText('รับถ่ายภาพราคามิตรภาพ', contentX, currentY);
        currentY += innerPadding * 0.9;
        
        ctx.font = `italic 600 ${outputWidth * 0.038}px Georgia, serif`;
        ctx.fillStyle = theme.accent;
        ctx.fillText(studioName, contentX, currentY);
        currentY += innerPadding * 1.6;
      }

      // Date section - from booking data
      // Day name
      ctx.fillStyle = theme.accentBg;
      const dayBoxWidth = outputWidth * 0.12;
      const dayBoxHeight = innerPadding * 0.9;
      ctx.fillRect(contentX, currentY - dayBoxHeight * 0.7, dayBoxWidth, dayBoxHeight);
      
      ctx.fillStyle = theme.textPrimary;
      ctx.font = `500 ${outputWidth * 0.018}px Sarabun, sans-serif`;
      ctx.fillText(`วัน${thaiDate.dayName}`, contentX + dayBoxWidth * 0.12, currentY);
      currentY += innerPadding * 0.3;

      // Large day number and month/year side by side
      const dayNumY = currentY + innerPadding * 1.8;
      
      // Large day number
      ctx.fillStyle = theme.accent;
      ctx.font = `700 ${outputWidth * 0.09}px Inter, sans-serif`;
      ctx.fillText(thaiDate.day.toString(), contentX, dayNumY);
      
      // Calculate where the day number ends
      const dayNumWidth = ctx.measureText(thaiDate.day.toString()).width;
      
      // Vertical line separator
      const lineX = contentX + dayNumWidth + innerPadding * 0.5;
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lineX, currentY + innerPadding * 0.3);
      ctx.lineTo(lineX, dayNumY + innerPadding * 0.2);
      ctx.stroke();

      // Month and Year/Time
      const monthX = lineX + innerPadding * 0.5;
      ctx.fillStyle = theme.textPrimary;
      ctx.font = `600 ${outputWidth * 0.028}px Sarabun, sans-serif`;
      ctx.fillText(thaiDate.monthName, monthX, currentY + innerPadding * 1);
      
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 ${outputWidth * 0.02}px Sarabun, sans-serif`;
      ctx.fillText(`${thaiDate.year}${timeSlot ? ` | ${timeSlot}` : ''}`, monthX, currentY + innerPadding * 1.7);

      currentY = dayNumY + innerPadding * 1;

      // Contact info (from profile)
      const phone = profile?.phone || '';
      if (phone) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 ${outputWidth * 0.016}px Sarabun, sans-serif`;
        ctx.fillText(`สอบถามรายละเอียดเพิ่มเติม ติดต่อ`, contentX, currentY);
        currentY += innerPadding * 0.6;
        
        ctx.fillStyle = theme.textPrimary;
        ctx.font = `600 ${outputWidth * 0.02}px Inter, sans-serif`;
        ctx.fillText(phone, contentX, currentY);
      }

      // Convert to blob and download
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-card">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between z-10">
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

        <div className="p-6 grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label>อัปโหลดรูปภาพ</Label>
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
                    className="w-full h-auto max-h-[300px] object-contain"
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
                  className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">คลิกเพื่ออัปโหลดรูป</span>
                  <span className="text-xs">รองรับ JPG, PNG (ไม่เกิน 15MB)</span>
                </button>
              )}
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <Label>เลือกธีม</Label>
              <RadioGroup
                value={selectedTheme}
                onValueChange={(v) => setSelectedTheme(v as TemplateTheme)}
                className="grid grid-cols-3 gap-3"
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
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 hover:bg-secondary/50 ${
                        selectedTheme === themeKey ? 'border-accent bg-accent/5' : 'border-border'
                      }`}
                    >
                      <div 
                        className="w-full h-8 rounded" 
                        style={{ backgroundColor: themeStyles[themeKey].overlayBg.includes('rgba') 
                          ? (themeKey === 'minimal' ? '#1a1a1a' : '#ffffff')
                          : themeStyles[themeKey].overlayBg 
                        }} 
                      />
                      <span className="text-xs font-medium">{themeStyles[themeKey].name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Booking Info Preview */}
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg">
              <Label className="text-sm font-medium">ข้อมูลที่จะแสดงในรูป</Label>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><span className="font-medium text-foreground">ประเภทงาน:</span> {JOB_TYPE_LABELS_TH[booking.job_type]}</p>
                {booking.location && <p><span className="font-medium text-foreground">สถานที่:</span> {booking.location}</p>}
                <p><span className="font-medium text-foreground">วันที่:</span> วัน{thaiDate?.dayName} {thaiDate?.day} {thaiDate?.monthName} {thaiDate?.year}</p>
                <p><span className="font-medium text-foreground">สตูดิโอ:</span> {profile?.studio_name || 'ยังไม่ได้ตั้งค่า'}</p>
                {profile?.phone && <p><span className="font-medium text-foreground">ติดต่อ:</span> {profile.phone}</p>}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                * ราคาและข้อมูลส่วนตัวจะไม่แสดงในรูป
              </p>
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

          {/* Preview */}
          <div className="space-y-3">
            <Label>ตัวอย่าง</Label>
            <div 
              ref={canvasContainerRef}
              className="bg-secondary/50 rounded-lg p-4 flex items-center justify-center overflow-hidden"
            >
              <div 
                className="relative rounded-lg overflow-hidden shadow-lg"
                style={{ 
                  width: '100%',
                  maxWidth: '280px',
                  aspectRatio: imageDimensions ? `${imageDimensions.width}/${imageDimensions.height}` : '2/3'
                }}
              >
                {/* Background Image */}
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay Section - Bottom Left Corner */}
                <div 
                  className="absolute bottom-2 left-2 p-2 rounded-lg"
                  style={{ 
                    backgroundColor: theme.overlayBg,
                    width: '65%',
                  }}
                >
                  {/* Top line */}
                  <div 
                    className="w-full h-[2px] mb-1"
                    style={{ backgroundColor: theme.accent }}
                  />
                  
                  <p 
                    className="text-[5px] tracking-wider mb-0.5"
                    style={{ color: theme.textSecondary }}
                  >
                    — BOOKING —
                  </p>

                  <h3 
                    className="font-bold text-[10px] leading-tight"
                    style={{ color: theme.textPrimary }}
                  >
                    {JOB_TYPE_LABELS_TH[booking.job_type]}
                  </h3>

                  {booking.location && (
                    <p 
                      className="text-[7px] mt-0.5"
                      style={{ color: theme.accent }}
                    >
                      {booking.location}
                    </p>
                  )}

                  {profile?.studio_name && (
                    <p 
                      className="text-[5px] italic mt-0.5"
                      style={{ color: theme.textSecondary }}
                    >
                      {profile.studio_name}
                    </p>
                  )}

                  {/* Date section */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div>
                      <p 
                        className="text-[4px]"
                        style={{ color: theme.textPrimary }}
                      >
                        วัน{thaiDate?.dayName}
                      </p>
                      <p 
                        className="text-[14px] font-bold leading-none"
                        style={{ color: theme.accent }}
                      >
                        {thaiDate?.day}
                      </p>
                    </div>
                    <div 
                      className="w-[1px] h-5"
                      style={{ backgroundColor: theme.borderColor }}
                    />
                    <div>
                      <p 
                        className="text-[6px] font-semibold"
                        style={{ color: theme.textPrimary }}
                      >
                        {thaiDate?.monthName}
                      </p>
                      <p 
                        className="text-[4px]"
                        style={{ color: theme.textSecondary }}
                      >
                        {thaiDate?.year} | {getTimeSlot() || 'ตลอดวัน'}
                      </p>
                    </div>
                  </div>

                  {profile?.phone && (
                    <p 
                      className="text-[4px] mt-1"
                      style={{ color: theme.textSecondary }}
                    >
                      ติดต่อ: {profile.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              * ตัวอย่างนี้ย่อจากขนาดจริง รูปที่ดาวน์โหลดจะมีความละเอียดสูง
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
