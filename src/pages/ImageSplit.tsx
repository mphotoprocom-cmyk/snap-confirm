import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  Scissors,
  Settings2,
  FileArchive,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import {
  SPLIT_TEMPLATES,
  WATERMARK_POSITIONS,
  SplitTemplate,
  WatermarkSettings,
  CropState,
  OutputSettings,
} from '@/types/imageSplit';

export default function ImageSplit() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState('');

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<SplitTemplate>(SPLIT_TEMPLATES[0]);

  // Crop state
  const [cropState, setCropState] = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Watermark settings
  const [watermark, setWatermark] = useState<WatermarkSettings>({
    enabled: false,
    text: '',
    size: 48,
    opacity: 50,
    position: 'center',
  });

  // Output settings
  const [output, setOutput] = useState<OutputSettings>({
    quality: 90,
    prefix: 'split',
    format: 'jpeg',
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Draw canvas preview
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasSize = 500;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear canvas
    ctx.fillStyle = isDark ? '#1a1a1a' : '#f0f0f0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Calculate scale to fit template in canvas
    const scaleX = canvasSize / selectedTemplate.width;
    const scaleY = canvasSize / selectedTemplate.height;
    const displayScale = Math.min(scaleX, scaleY);

    const offsetX = (canvasSize - selectedTemplate.width * displayScale) / 2;
    const offsetY = (canvasSize - selectedTemplate.height * displayScale) / 2;

    // Draw image if loaded
    if (sourceImage) {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(displayScale, displayScale);

      // Calculate image draw position
      const imgScale = Math.max(
        selectedTemplate.width / sourceImage.width,
        selectedTemplate.height / sourceImage.height
      ) * cropState.scale;

      const imgW = sourceImage.width * imgScale;
      const imgH = sourceImage.height * imgScale;
      const imgX = (selectedTemplate.width - imgW) / 2 + cropState.x;
      const imgY = (selectedTemplate.height - imgH) / 2 + cropState.y;

      ctx.drawImage(sourceImage, imgX, imgY, imgW, imgH);
      ctx.restore();
    }

    // Draw panel outlines
    ctx.strokeStyle = isDark ? 'rgba(74, 222, 128, 0.8)' : 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    selectedTemplate.panels.forEach((panel, index) => {
      const px = offsetX + panel.x * displayScale;
      const py = offsetY + panel.y * displayScale;
      const pw = panel.w * displayScale;
      const ph = panel.h * displayScale;

      ctx.strokeRect(px, py, pw, ph);

      // Draw panel number
      ctx.fillStyle = isDark ? 'rgba(74, 222, 128, 0.9)' : 'rgba(16, 185, 129, 0.9)';
      ctx.font = 'bold 16px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${index + 1}`, px + pw / 2, py + ph / 2);
    });

    // Draw template border
    ctx.setLineDash([]);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    ctx.strokeRect(
      offsetX,
      offsetY,
      selectedTemplate.width * displayScale,
      selectedTemplate.height * displayScale
    );
  }, [sourceImage, selectedTemplate, cropState, isDark]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name.replace(/\.[^/.]+$/, ''));

    const img = new window.Image();
    img.onload = () => {
      setSourceImage(img);
      setCropState({ x: 0, y: 0, scale: 1 });
      toast.success('โหลดรูปภาพสำเร็จ');
    };
    img.onerror = () => {
      toast.error('ไม่สามารถโหลดรูปภาพได้');
    };
    img.src = URL.createObjectURL(file);
  };

  // Mouse handlers for drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sourceImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropState.x, y: e.clientY - cropState.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setCropState(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setCropState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta)),
    }));
  };

  const handleReset = () => {
    setCropState({ x: 0, y: 0, scale: 1 });
  };

  // Process and split image
  const processImage = async () => {
    if (!sourceImage) {
      toast.error('กรุณาเลือกรูปภาพก่อน');
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      const panelImages: string[] = [];

      for (let i = 0; i < selectedTemplate.panels.length; i++) {
        const panel = selectedTemplate.panels[i];

        // Create canvas for this panel
        const canvas = document.createElement('canvas');
        canvas.width = panel.w;
        canvas.height = panel.h;
        const ctx = canvas.getContext('2d')!;

        // Calculate image position
        const imgScale = Math.max(
          selectedTemplate.width / sourceImage.width,
          selectedTemplate.height / sourceImage.height
        ) * cropState.scale;

        const imgW = sourceImage.width * imgScale;
        const imgH = sourceImage.height * imgScale;
        const imgX = (selectedTemplate.width - imgW) / 2 + cropState.x - panel.x;
        const imgY = (selectedTemplate.height - imgH) / 2 + cropState.y - panel.y;

        // Draw image portion
        ctx.drawImage(sourceImage, imgX, imgY, imgW, imgH);

        // Add watermark if enabled
        if (watermark.enabled && watermark.text) {
          ctx.save();
          ctx.globalAlpha = watermark.opacity / 100;
          ctx.font = `${watermark.size}px Inter`;
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.lineWidth = 2;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let wx: number, wy: number;
          switch (watermark.position) {
            case 'top-left':
              wx = watermark.size;
              wy = watermark.size;
              ctx.textAlign = 'left';
              break;
            case 'top-right':
              wx = panel.w - watermark.size;
              wy = watermark.size;
              ctx.textAlign = 'right';
              break;
            case 'bottom-left':
              wx = watermark.size;
              wy = panel.h - watermark.size;
              ctx.textAlign = 'left';
              break;
            case 'bottom-right':
              wx = panel.w - watermark.size;
              wy = panel.h - watermark.size;
              ctx.textAlign = 'right';
              break;
            default:
              wx = panel.w / 2;
              wy = panel.h / 2;
          }

          ctx.strokeText(watermark.text, wx, wy);
          ctx.fillText(watermark.text, wx, wy);
          ctx.restore();
        }

        // Export panel
        const mimeType = output.format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = output.format === 'jpeg' ? output.quality / 100 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        panelImages.push(dataUrl);
      }

      setResults(panelImages);
      setShowResults(true);
      toast.success(`ตัดรูปภาพสำเร็จ ${panelImages.length} ชิ้น`);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการตัดรูปภาพ');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download all as ZIP
  const downloadAll = async () => {
    if (results.length === 0) return;

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const ext = output.format === 'png' ? 'png' : 'jpg';

      for (let i = 0; i < results.length; i++) {
        const dataUrl = results[i];
        const base64 = dataUrl.split(',')[1];
        const filename = `${output.prefix}_${imageName}_${(i + 1).toString().padStart(2, '0')}.${ext}`;
        zip.file(filename, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${output.prefix}_${imageName}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('ดาวน์โหลดไฟล์ ZIP สำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการสร้างไฟล์ ZIP');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download single image
  const downloadSingle = (index: number) => {
    const dataUrl = results[index];
    const ext = output.format === 'png' ? 'png' : 'jpg';
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${output.prefix}_${imageName}_${(index + 1).toString().padStart(2, '0')}.${ext}`;
    a.click();
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <Link to="/">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าหลัก
          </button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Auto Split Image
        </h1>
        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          ตัดรูปภาพอัตโนมัติสำหรับโพสต์ Facebook และแพลตฟอร์มอื่นๆ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Section */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-4">
              <Upload className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                อัปโหลดรูปภาพ
              </h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-colors ${
                isDark
                  ? 'border-white/20 hover:border-emerald-400/50'
                  : 'border-gray-300 hover:border-emerald-500/50'
              }`}
            >
              <ImageIcon className={`w-10 h-10 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
              <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                คลิกเพื่อเลือกรูปภาพ
              </span>
            </button>

            {imageName && (
              <p className={`mt-2 text-sm truncate ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {imageName}
              </p>
            )}
          </div>

          {/* Template Selection */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                รูปแบบการตัด
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SPLIT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedTemplate.id === template.id
                      ? 'bg-emerald-500/20 border-emerald-500'
                      : isDark
                        ? 'bg-white/5 hover:bg-white/10 border-white/10'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
                  } border`}
                >
                  <div className="text-lg mb-1">{template.icon}</div>
                  <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {template.name}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    {template.panels.length} ชิ้น
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Settings */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 rounded-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings2 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ลายน้ำ
                </h2>
              </div>
              <Switch
                checked={watermark.enabled}
                onCheckedChange={(v) => setWatermark({ ...watermark, enabled: v })}
              />
            </div>

            {watermark.enabled && (
              <div className="space-y-4">
                <div>
                  <Label className={isDark ? 'text-white/70' : 'text-gray-600'}>ข้อความ</Label>
                  <Input
                    value={watermark.text}
                    onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                    placeholder="ชื่อร้าน/ช่างภาพ"
                  />
                </div>

                <div>
                  <Label className={isDark ? 'text-white/70' : 'text-gray-600'}>
                    ขนาด: {watermark.size}px
                  </Label>
                  <Slider
                    value={[watermark.size]}
                    onValueChange={([v]) => setWatermark({ ...watermark, size: v })}
                    min={12}
                    max={120}
                    step={4}
                  />
                </div>

                <div>
                  <Label className={isDark ? 'text-white/70' : 'text-gray-600'}>
                    ความทึบ: {watermark.opacity}%
                  </Label>
                  <Slider
                    value={[watermark.opacity]}
                    onValueChange={([v]) => setWatermark({ ...watermark, opacity: v })}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <Label className={isDark ? 'text-white/70' : 'text-gray-600'}>ตำแหน่ง</Label>
                  <Select
                    value={watermark.position}
                    onValueChange={(v: any) => setWatermark({ ...watermark, position: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WATERMARK_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Output Settings */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-4">
              <Download className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ตั้งค่าไฟล์
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className={isDark ? 'text-white/70' : 'text-gray-600'}>ชื่อไฟล์</Label>
                <Input
                  value={output.prefix}
                  onChange={(e) => setOutput({ ...output, prefix: e.target.value })}
                  placeholder="prefix"
                />
              </div>

              <div>
                <Label className={isDark ? 'text-white/70' : 'text-gray-600'}>รูปแบบไฟล์</Label>
                <Select
                  value={output.format}
                  onValueChange={(v: any) => setOutput({ ...output, format: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {output.format === 'jpeg' && (
                <div>
                  <Label className={isDark ? 'text-white/70' : 'text-gray-600'}>
                    คุณภาพ: {output.quality}%
                  </Label>
                  <Slider
                    value={[output.quality]}
                    onValueChange={([v]) => setOutput({ ...output, quality: v })}
                    min={50}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Canvas Preview */}
        <div className="lg:col-span-2">
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 rounded-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ตัวอย่าง
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                  disabled={!sourceImage}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className={`text-sm min-w-[60px] text-center ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  {Math.round(cropState.scale * 100)}%
                </span>
                <button
                  onClick={() => handleZoom(0.1)}
                  className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                  disabled={!sourceImage}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                  disabled={!sourceImage}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <canvas
                ref={canvasRef}
                className={`rounded-xl cursor-move ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            <p className={`text-sm text-center mb-6 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              ลากรูปภาพเพื่อปรับตำแหน่ง • ใช้ปุ่มซูมเพื่อปรับขนาด
            </p>

            <button
              onClick={processImage}
              disabled={!sourceImage || isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  ตัดรูปภาพ ({selectedTemplate.panels.length} ชิ้น)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ผลลัพธ์การตัดรูปภาพ</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
            {results.map((dataUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={dataUrl}
                  alt={`Panel ${index + 1}`}
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <button
                    onClick={() => downloadSingle(index)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                  isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-900'
                }`}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={downloadAll}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังสร้างไฟล์ ZIP...
              </>
            ) : (
              <>
                <FileArchive className="w-4 h-4" />
                ดาวน์โหลดทั้งหมด (ZIP)
              </>
            )}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
