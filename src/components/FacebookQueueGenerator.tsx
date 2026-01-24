import { useState, useRef, ChangeEvent } from 'react';
import { Booking, JOB_TYPE_LABELS } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface FacebookQueueGeneratorProps {
  booking: Booking;
  onClose: () => void;
}

type TemplateTheme = 'elegant' | 'modern' | 'minimal';

const themeStyles: Record<TemplateTheme, { bg: string; text: string; accent: string; name: string }> = {
  elegant: {
    bg: 'bg-gradient-to-b from-stone-900 to-stone-800',
    text: 'text-stone-100',
    accent: 'text-amber-400',
    name: 'Elegant Dark',
  },
  modern: {
    bg: 'bg-gradient-to-b from-slate-50 to-white',
    text: 'text-slate-900',
    accent: 'text-blue-600',
    name: 'Modern Light',
  },
  minimal: {
    bg: 'bg-black',
    text: 'text-white',
    accent: 'text-white/70',
    name: 'Minimal Black',
  },
};

export function FacebookQueueGenerator({ booking, onClose }: FacebookQueueGeneratorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<TemplateTheme>('elegant');
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !previewRef.current) {
      toast.error('Please upload a photo first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a temporary container for full-size rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1365px';
      tempContainer.style.height = '2048px';
      document.body.appendChild(tempContainer);

      // Clone the preview and scale it
      const clone = previewRef.current.cloneNode(true) as HTMLElement;
      clone.style.width = '1365px';
      clone.style.height = '2048px';
      clone.style.transform = 'none';
      tempContainer.appendChild(clone);

      const canvas = await html2canvas(tempContainer, {
        width: 1365,
        height: 2048,
        scale: 1,
        backgroundColor: null,
        useCORS: true,
      });

      document.body.removeChild(tempContainer);

      const link = document.createElement('a');
      link.download = `fb-queue-${booking.booking_number}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();

      toast.success('Facebook Queue image downloaded!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const theme = themeStyles[selectedTheme];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-lg font-medium">Create Facebook Queue Image</h2>
            <p className="text-sm text-muted-foreground">Size: 1365 x 2048 px (Long 2048)</p>
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
              <Label>Upload Photo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Click to upload photo</span>
                </button>
              )}
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <Label>Template Theme</Label>
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
                      <div className={`w-full h-8 rounded ${themeStyles[themeKey].bg}`} />
                      <span className="text-xs font-medium">{themeStyles[themeKey].name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
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
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Download Queue Image
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Price and sensitive data will be excluded from the image.
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-center">
              <div
                ref={previewRef}
                className={`w-full aspect-[1365/2048] max-h-[500px] rounded-lg overflow-hidden ${theme.bg} flex flex-col`}
                style={{ aspectRatio: '1365/2048' }}
              >
                {/* Photo Section - Top 60% */}
                <div className="flex-[6] relative overflow-hidden bg-black/20">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className={`w-12 h-12 ${theme.accent} opacity-30`} />
                    </div>
                  )}
                </div>

                {/* Booking Summary Section - Bottom 40% */}
                <div className={`flex-[4] p-6 flex flex-col justify-center ${theme.text}`}>
                  <div className="space-y-4">
                    {/* Job Type Badge */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      selectedTheme === 'modern' ? 'bg-blue-100 text-blue-700' : 'bg-white/10'
                    }`}>
                      {JOB_TYPE_LABELS[booking.job_type]}
                    </div>

                    {/* Client Name */}
                    <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {booking.client_name}
                    </h3>

                    {/* Date & Time */}
                    <div className="space-y-1">
                      <p className={`text-lg font-medium ${theme.accent}`}>
                        {format(new Date(booking.event_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {(booking.time_start || booking.time_end) && (
                        <p className="text-sm opacity-80">
                          {formatTime(booking.time_start)}
                          {booking.time_end && ` - ${formatTime(booking.time_end)}`}
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    {booking.location && (
                      <p className="text-sm opacity-70 leading-relaxed">
                        📍 {booking.location}
                      </p>
                    )}

                    {/* Booking Reference */}
                    <p className={`text-xs font-mono mt-4 opacity-50`}>
                      {booking.booking_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
