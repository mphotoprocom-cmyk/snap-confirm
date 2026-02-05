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
  getRegionCount,
  getRegionLabels,
} from '@/types/imageSplit';

// Frame size for output (1080px is good for social media)
const FRAME_SIZE = 1080;

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
  const [results, setResults] = useState<{ label: string; dataUrl: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Calculate frame dimensions based on template aspect ratio
  const getFrameDimensions = useCallback(() => {
    const [aspectW, aspectH] = selectedTemplate.frame_aspect;
    if (aspectW >= aspectH) {
      return { width: FRAME_SIZE, height: Math.round(FRAME_SIZE * (aspectH / aspectW)) };
    } else {
      return { width: Math.round(FRAME_SIZE * (aspectW / aspectH)), height: FRAME_SIZE };
    }
  }, [selectedTemplate]);

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

    // Calculate frame dimensions
    const frameDim = getFrameDimensions();
    const scaleX = canvasSize / frameDim.width;
    const scaleY = canvasSize / frameDim.height;
    const displayScale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave margin

    const frameW = frameDim.width * displayScale;
    const frameH = frameDim.height * displayScale;
    const offsetX = (canvasSize - frameW) / 2;
    const offsetY = (canvasSize - frameH) / 2;

    // Draw image if loaded
    if (sourceImage) {
      ctx.save();

      // Clip to frame area
      ctx.beginPath();
      ctx.rect(offsetX, offsetY, frameW, frameH);
      ctx.clip();

      // Calculate image draw position (cover the frame)
      const imgScale = Math.max(
        frameDim.width / sourceImage.width,
        frameDim.height / sourceImage.height
      ) * cropState.scale;

      const imgW = sourceImage.width * imgScale * displayScale;
      const imgH = sourceImage.height * imgScale * displayScale;
      const imgX = offsetX + (frameW - imgW) / 2 + cropState.x * displayScale;
      const imgY = offsetY + (frameH - imgH) / 2 + cropState.y * displayScale;

      ctx.drawImage(sourceImage, imgX, imgY, imgW, imgH);
      ctx.restore();
    }

    // Draw region outlines and labels
    ctx.strokeStyle = isDark ? 'rgba(74, 222, 128, 0.8)' : 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const regionLabels = getRegionLabels(selectedTemplate);
    regionLabels.forEach((label) => {
      const region = selectedTemplate.regions[label];
      const rx = offsetX + region.x * frameW;
      const ry = offsetY + region.y * frameH;
      const rw = region.w * frameW;
      const rh = region.h * frameH;

      ctx.strokeRect(rx, ry, rw, rh);

      // Draw region label
      ctx.fillStyle = isDark ? 'rgba(74, 222, 128, 0.9)' : 'rgba(16, 185, 129, 0.9)';
      ctx.font = 'bold 20px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, rx + rw / 2, ry + rh / 2);
    });

    // Draw frame border
    ctx.setLineDash([]);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, frameW, frameH);
  }, [sourceImage, selectedTemplate, cropState, isDark, getFrameDimensions]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('รองรับเฉพาะ JPG/PNG/WebP');
      return;
    }

    // Validate file size (40MB limit like PHP)
    if (file.size > 40 * 1024 * 1024) {
      toast.error('ไฟล์ใหญ่เกินไป (จำกัด ~40MB)');
      return;
    }

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

  // Apply watermark to canvas
  const applyWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!watermark.enabled || !watermark.text) return;

    ctx.save();
    ctx.globalAlpha = watermark.opacity / 100;
    ctx.font = `${watermark.size}px Inter, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;

    let wx: number, wy: number;
    const padding = watermark.size;

    switch (watermark.position) {
      case 'top-left':
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        wx = padding;
        wy = padding;
        break;
      case 'top-right':
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        wx = width - padding;
        wy = padding;
        break;
      case 'bottom-left':
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        wx = padding;
        wy = height - padding;
        break;
      case 'bottom-right':
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        wx = width - padding;
        wy = height - padding;
        break;
      default: // center
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        wx = width / 2;
        wy = height / 2;
    }

    ctx.strokeText(watermark.text, wx, wy);
    ctx.fillText(watermark.text, wx, wy);
    ctx.restore();
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
      const frameDim = getFrameDimensions();
      const regionLabels = getRegionLabels(selectedTemplate);
      const panelImages: { label: string; dataUrl: string }[] = [];

      // Calculate image positioning (same as preview)
      const imgScale = Math.max(
        frameDim.width / sourceImage.width,
        frameDim.height / sourceImage.height
      ) * cropState.scale;

      const imgW = sourceImage.width * imgScale;
      const imgH = sourceImage.height * imgScale;
      const imgX = (frameDim.width - imgW) / 2 + cropState.x;
      const imgY = (frameDim.height - imgH) / 2 + cropState.y;

      for (const label of regionLabels) {
        const region = selectedTemplate.regions[label];

        // Calculate region dimensions in pixels
        const regionX = region.x * frameDim.width;
        const regionY = region.y * frameDim.height;
        const regionW = region.w * frameDim.width;
        const regionH = region.h * frameDim.height;

        // Create canvas for this region
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(regionW);
        canvas.height = Math.round(regionH);
        const ctx = canvas.getContext('2d')!;

        // Fill with white background (for transparency)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the portion of the image that falls within this region
        ctx.drawImage(
          sourceImage,
          imgX - regionX,
          imgY - regionY,
          imgW,
          imgH
        );

        // Apply watermark
        applyWatermark(ctx, canvas.width, canvas.height);

        // Export
        const mimeType = output.format === 'png' ? 'image/png' :
                        output.format === 'webp' ? 'image/webp' : 'image/jpeg';
        const quality = output.format === 'jpeg' || output.format === 'webp'
                        ? output.quality / 100 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        panelImages.push({ label, dataUrl });
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
      const ext = output.format === 'png' ? 'png' : output.format === 'webp' ? 'webp' : 'jpg';

      for (const result of results) {
        const base64 = result.dataUrl.split(',')[1];
        const filename = `${output.prefix}_${imageName}_${result.label}.${ext}`;
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
  const downloadSingle = (result: { label: string; dataUrl: string }) => {
    const ext = output.format === 'png' ? 'png' : output.format === 'webp' ? 'webp' : 'jpg';
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = `${output.prefix}_${imageName}_${result.label}.${ext}`;
    a.click();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dashboard-bg' : 'light-dashboard-bg'} p-4 lg:p-6`}>
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
              accept="image/jpeg,image/png,image/webp"
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
                คลิกเพื่อเลือกรูปภาพ (JPG/PNG/WebP)
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

            <div className="space-y-2">
              {SPLIT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${
                    selectedTemplate.id === template.id
                      ? 'bg-emerald-500/20 border-emerald-500'
                      : isDark
                        ? 'bg-white/5 hover:bg-white/10 border-white/10'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
                  } border`}
                >
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      {getRegionCount(template)} ชิ้น ({getRegionLabels(template).join(', ')})
                    </div>
                  </div>
                  {selectedTemplate.id === template.id && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
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
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(output.format === 'jpeg' || output.format === 'webp') && (
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
                  ตัดรูปภาพ ({getRegionCount(selectedTemplate)} ชิ้น: {getRegionLabels(selectedTemplate).join(', ')})
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
            {results.map((result) => (
              <div key={result.label} className="relative group">
                <img
                  src={result.dataUrl}
                  alt={`Panel ${result.label}`}
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <button
                    onClick={() => downloadSingle(result)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                  isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-900'
                }`}>
                  {result.label}
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
    </div>
  );
}
