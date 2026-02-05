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
  ArrowLeft,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Image as ImageIcon,
  Layers,
  Settings2,
  Trash2,
  Move,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  ChevronUp,
  ChevronDown,
  Copy,
  Crosshair,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RES_PRESETS,
  WATERMARK_POSITIONS,
  WATERMARK_FONTS,
  DEFAULT_WATERMARK,
  BLEND_MODES,
  CollageLayout,
  CollageLayoutsData,
  CollageImageObj,
  CollageWatermark,
  OverlayItem,
} from '@/data/collagePresets';
import layoutsData from '@/data/collageLayouts.json';

// Load presets from JSON
const ALL_PRESETS: CollageLayout[] = (layoutsData as CollageLayoutsData).presets;

// --- Canvas drawing helpers ---
function clipRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.clip();
}

function drawImageInRect(
  ctx: CanvasRenderingContext2D,
  imgObj: CollageImageObj,
  r: { x: number; y: number; w: number; h: number },
  radius: number
) {
  const { img, scale = 1, offsetX = 0, offsetY = 0, mode = 'fill', rotation = 0 } = imgObj;
  const sX = r.w / img.width;
  const sY = r.h / img.height;
  const base = mode === 'fill' ? Math.max(sX, sY) : Math.min(sX, sY);
  const s = base * scale;

  const drawW = img.width * s;
  const drawH = img.height * s;
  const cx = r.x + r.w / 2 + offsetX;
  const cy = r.y + r.h / 2 + offsetY;

  ctx.save();
  clipRoundedRect(ctx, r.x, r.y, r.w, r.h, radius);
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

function drawSwapHandle(
  ctx: CanvasRenderingContext2D,
  r: { x: number; y: number; w: number; h: number }
) {
  const size = Math.max(18, Math.min(28, Math.min(r.w, r.h) * 0.12));
  const pad = 8;
  const x = r.x + r.w - pad - size;
  const y = r.y + pad;
  ctx.save();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 2;
  const rr = 6;
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + size, y, x + size, y + size, rr);
  ctx.arcTo(x + size, y + size, x, y + size, rr);
  ctx.arcTo(x, y + size, x, y, rr);
  ctx.arcTo(x, y, x + size, y, rr);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const cx2 = x + size / 2;
  const cy2 = y + size / 2;
  ctx.beginPath();
  ctx.moveTo(cx2 - 6, cy2 - 3);
  ctx.lineTo(cx2 + 6, cy2 - 3);
  ctx.moveTo(cx2 + 3, cy2 - 6);
  ctx.lineTo(cx2 + 6, cy2 - 3);
  ctx.lineTo(cx2 + 3, cy2);
  ctx.moveTo(cx2 + 6, cy2 + 3);
  ctx.lineTo(cx2 - 6, cy2 + 3);
  ctx.moveTo(cx2 - 3, cy2);
  ctx.lineTo(cx2 - 6, cy2 + 3);
  ctx.lineTo(cx2 - 3, cy2 + 6);
  ctx.stroke();
  ctx.restore();
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  wm: CollageWatermark,
  W: number,
  H: number
) {
  if (!wm.enabled || !wm.text) return;
  ctx.save();
  ctx.globalAlpha = wm.opacity ?? 0.15;
  ctx.fillStyle = wm.color || '#000000';
  const wmW = wm.weight || 700;
  const wmF = wm.fontFamily || "system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
  ctx.font = `${wmW} ${wm.size || 48}px ${wmF}`;

  const margin = Math.max(0, wm.margin || 0);
  const pos = (wm.position || 'BR').toUpperCase();
  let x = margin;
  let y = H - margin;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';

  if (pos === 'BR') { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; x = W - margin; y = H - margin; }
  else if (pos === 'BL') { ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; x = margin; y = H - margin; }
  else if (pos === 'TR') { ctx.textAlign = 'right'; ctx.textBaseline = 'top'; x = W - margin; y = margin; }
  else if (pos === 'TL') { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; x = margin; y = margin; }
  else if (pos === 'BC') { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; x = W / 2; y = H - margin; }
  else if (pos === 'TC') { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; x = W / 2; y = margin; }
  else if (pos === 'CL') { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; x = margin; y = H / 2; }
  else if (pos === 'CR') { ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; x = W - margin; y = H / 2; }
  else if (pos === 'C') { ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; x = W / 2; y = H / 2; }

  ctx.fillText(wm.text, x, y);
  ctx.restore();
}

// --- Overlay drawing ---
function drawOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: OverlayItem[],
  W: number,
  H: number,
  selectedOverlayIdx: number,
  editMode: boolean
) {
  overlays.forEach((ov, i) => {
    if (!ov.img || !ov.img.complete) return;
    ctx.save();
    ctx.globalAlpha = ov.opacity ?? 1;
    ctx.globalCompositeOperation = ov.blend || 'source-over';

    const cx = W / 2 + (ov.x || 0);
    const cy = H / 2 + (ov.y || 0);
    const s = ov.scale || 1;

    ctx.translate(cx, cy);
    ctx.rotate((ov.rotation || 0) * Math.PI / 180);
    const dw = ov.img.width * s;
    const dh = ov.img.height * s;
    ctx.drawImage(ov.img, -dw / 2, -dh / 2, dw, dh);

    // Draw selection border in edit mode
    if (editMode && i === selectedOverlayIdx) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(-dw / 2 - 4, -dh / 2 - 4, dw + 8, dh + 8);
    }

    ctx.restore();
  });
}

// --- Layout thumbnail renderer ---
function drawLayoutThumbnail(
  canvas: HTMLCanvasElement,
  layout: CollageLayout,
  isDark: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = 60;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = isDark ? '#1f2937' : '#f3f4f6';
  ctx.fillRect(0, 0, size, size);

  const gap = 1.5;
  layout.slots.forEach((slot) => {
    const x = slot.x * size + gap;
    const y = slot.y * size + gap;
    const w = slot.w * size - gap * 2;
    const h = slot.h * size - gap * 2;
    ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.6)' : 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  });
}

export default function CollageBuilder() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);

  // Core state
  const [orient, setOrient] = useState<'landscape' | 'portrait'>('landscape');
  const [resPreset, setResPreset] = useState('fb2048x1366');
  const [currentLayout, setCurrentLayout] = useState<CollageLayout>(ALL_PRESETS[0]);
  const [images, setImages] = useState<CollageImageObj[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(-1);
  const [gutter, setGutter] = useState(16);
  const [radius, setRadius] = useState(24);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [watermark, setWatermark] = useState<CollageWatermark>({ ...DEFAULT_WATERMARK });

  // Overlay state
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState(-1);
  const [overlayEditMode, setOverlayEditMode] = useState(true);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);

  // Layout search/filter
  const [layoutSearch, setLayoutSearch] = useState('');

  // Interaction state (not in React state for performance - use refs)
  const isPanningRef = useRef(false);
  const panSlotRef = useRef(-1);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const draggingSwapRef = useRef(false);
  const dragStartSlotRef = useRef(-1);
  const isPanningOverlayRef = useRef(false);
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const overlaysRef = useRef(overlays);
  overlaysRef.current = overlays;
  const selectedOverlayRef = useRef(selectedOverlay);
  selectedOverlayRef.current = selectedOverlay;
  const overlayEditModeRef = useRef(overlayEditMode);
  overlayEditModeRef.current = overlayEditMode;
  const overlayEnabledRef = useRef(overlayEnabled);
  overlayEnabledRef.current = overlayEnabled;
  const selectedSlotRef = useRef(selectedSlot);
  selectedSlotRef.current = selectedSlot;

  // Get canvas W/H based on resolution preset and orientation
  const getCanvasWH = useCallback(() => {
    const p = RES_PRESETS.find((x) => x.id === resPreset) || RES_PRESETS[0];
    if (orient === 'landscape') return { W: p.w, H: p.h };
    return { W: p.h, H: p.w };
  }, [resPreset, orient]);

  // Compute slot rects in pixel space
  const getSlotRect = useCallback(
    (slot: { x: number; y: number; w: number; h: number }) => {
      const { W, H } = getCanvasWH();
      return { x: slot.x * W, y: slot.y * H, w: slot.w * W, h: slot.h * H };
    },
    [getCanvasWH]
  );

  const applyGutter = useCallback(
    (r: { x: number; y: number; w: number; h: number }) => {
      const g = gutter / 2;
      return { x: r.x + g, y: r.y + g, w: r.w - 2 * g, h: r.h - 2 * g };
    },
    [gutter]
  );

  const getAllRects = useCallback(() => {
    if (!currentLayout) return [];
    return currentLayout.slots.map((s) => applyGutter(getSlotRect(s)));
  }, [currentLayout, applyGutter, getSlotRect]);

  // Find slot at point
  const slotAtPoint = useCallback(
    (x: number, y: number) => {
      const rects = getAllRects();
      for (let i = 0; i < rects.length; i++) {
        const r = rects[i];
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
      }
      return -1;
    },
    [getAllRects]
  );

  const isOnSwapHandle = useCallback(
    (x: number, y: number, slotIndex: number) => {
      if (slotIndex < 0) return false;
      const rects = getAllRects();
      const r = rects[slotIndex];
      if (!r) return false;
      const size = Math.max(18, Math.min(28, Math.min(r.w, r.h) * 0.12));
      const pad = 8;
      const hx = r.x + r.w - pad - size;
      const hy = r.y + pad;
      return x >= hx && x <= hx + size && y >= hy && y <= hy + size;
    },
    [getAllRects]
  );

  // --- Draw the scene ---
  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, withOverlays = true) => {
      const { W, H } = getCanvasWH();
      ctx.canvas.width = W;
      ctx.canvas.height = H;

      ctx.fillStyle = bgColor || '#fff';
      ctx.fillRect(0, 0, W, H);

      const rects = getAllRects();

      rects.forEach((r, i) => {
        const imgObj = imagesRef.current.find((it) => it.slotIndex === i);
        if (imgObj && imgObj.img && imgObj.img.complete) {
          drawImageInRect(ctx, imgObj, r, radius);
          if (withOverlays) drawSwapHandle(ctx, r);
        } else {
          ctx.save();
          clipRoundedRect(ctx, r.x, r.y, r.w, r.h, radius);
          ctx.fillStyle = isDark ? '#374151' : '#e9ecef';
          ctx.fillRect(r.x, r.y, r.w, r.h);
          // Draw X cross
          ctx.strokeStyle = isDark ? '#6b7280' : '#c9ced6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(r.x + 8, r.y + 8);
          ctx.lineTo(r.x + r.w - 8, r.y + r.h - 8);
          ctx.moveTo(r.x + r.w - 8, r.y + 8);
          ctx.lineTo(r.x + 8, r.y + r.h - 8);
          ctx.stroke();
          // Slot number
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
          ctx.font = `bold ${Math.min(r.w, r.h) * 0.3}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${i + 1}`, r.x + r.w / 2, r.y + r.h / 2);
          ctx.restore();
        }
      });

      // Overlays (drawn on both preview and export when enabled)
      if (overlayEnabledRef.current && overlaysRef.current.length > 0) {
        drawOverlays(
          ctx,
          overlaysRef.current,
          W,
          H,
          withOverlays ? selectedOverlayRef.current : -1,
          withOverlays && overlayEditModeRef.current
        );
      }

      // Watermark
      drawWatermark(ctx, watermark, W, H);

      // Selection highlight (slot)
      if (withOverlays && selectedSlotRef.current >= 0 && rects[selectedSlotRef.current]) {
        const r = rects[selectedSlotRef.current];
        const stroke = draggingSwapRef.current
          ? '#dc3545'
          : isPanningRef.current
          ? '#10b981'
          : '#0d6efd';
        ctx.save();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
        ctx.restore();
      }
    },
    [getCanvasWH, getAllRects, bgColor, radius, isDark, watermark]
  );

  // Render to visible canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    drawScene(ctx, true);
  }, [drawScene]);

  useEffect(() => {
    render();
  }, [render, images, selectedSlot, gutter, radius, bgColor, watermark, currentLayout, orient, resPreset, overlays, overlayEnabled, selectedOverlay, overlayEditMode]);

  // --- Set preset layout ---
  const handleSetLayout = useCallback(
    (layout: CollageLayout) => {
      setCurrentLayout(layout);
      setImages((prev) => prev.filter((it) => it.slotIndex < layout.slots.length));
      const d = layout.defaults || {};
      if (typeof d.gutter === 'number') setGutter(d.gutter);
      if (typeof d.radius === 'number') setRadius(d.radius);
      if (d.bg) setBgColor(d.bg);
      setSelectedSlot(-1);
    },
    []
  );

  // --- File handling ---
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (!currentLayout) return;
      const slots = currentLayout.slots.length;
      const occupied = new Set(imagesRef.current.map((it) => it.slotIndex));
      let nextSlot = 0;
      while (occupied.has(nextSlot) && nextSlot < slots) nextSlot++;

      const newImages: CollageImageObj[] = [];
      let processed = 0;

      Array.from(files).forEach((f) => {
        const url = URL.createObjectURL(f);
        const img = new window.Image();
        img.onload = () => {
          processed++;
          if (processed === files.length) {
            // Force re-render after all images loaded
            setImages((prev) => [...prev]);
          }
        };
        img.src = url;
        newImages.push({
          img,
          slotIndex: nextSlot % slots,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
          mode: 'fill',
        });
        occupied.add(nextSlot % slots);
        nextSlot++;
        while (occupied.has(nextSlot % slots) && nextSlot < slots * 2) nextSlot++;
      });

      setImages((prev) => [...prev, ...newImages]);
    },
    [currentLayout]
  );

  const assignFileToSlot = useCallback(
    (file: File, slotIndex: number) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => setImages((prev) => [...prev]);
      img.src = url;
      const newObj: CollageImageObj = {
        img,
        slotIndex,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        mode: 'fill',
      };
      setImages((prev) => {
        const filtered = prev.filter((it) => it.slotIndex !== slotIndex);
        return [...filtered, newObj];
      });
    },
    []
  );

  // --- Canvas event handlers ---
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
      const y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
      return { x, y };
    },
    []
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);

      // If overlay edit mode is active, handle overlay interaction
      if (overlayEnabledRef.current && overlayEditModeRef.current && overlaysRef.current.length > 0 && selectedOverlayRef.current >= 0) {
        isPanningOverlayRef.current = true;
        lastXRef.current = x;
        lastYRef.current = y;
        render();
        return;
      }

      const idx = slotAtPoint(x, y);
      setSelectedSlot(idx);
      selectedSlotRef.current = idx;

      if (idx < 0) {
        render();
        return;
      }

      const hasImg = imagesRef.current.some((it) => it.slotIndex === idx);

      if (!hasImg) {
        // Open file picker for this empty slot
        if (slotFileInputRef.current) slotFileInputRef.current.click();
        render();
        return;
      }

      if (isOnSwapHandle(x, y, idx)) {
        draggingSwapRef.current = true;
        dragStartSlotRef.current = idx;
        render();
        return;
      }

      // Start panning
      isPanningRef.current = true;
      panSlotRef.current = idx;
      lastXRef.current = x;
      lastYRef.current = y;
      render();
    },
    [getCanvasCoords, slotAtPoint, isOnSwapHandle, render]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Overlay panning
      if (isPanningOverlayRef.current && selectedOverlayRef.current >= 0) {
        const { x, y } = getCanvasCoords(e);
        const ov = overlaysRef.current[selectedOverlayRef.current];
        if (ov) {
          const dx = x - lastXRef.current;
          const dy = y - lastYRef.current;
          ov.x = (ov.x || 0) + dx;
          ov.y = (ov.y || 0) + dy;
          lastXRef.current = x;
          lastYRef.current = y;
          setOverlays([...overlaysRef.current]);
        }
        return;
      }

      if (!isPanningRef.current || panSlotRef.current < 0) return;
      const { x, y } = getCanvasCoords(e);
      const imgObj = imagesRef.current.find((it) => it.slotIndex === panSlotRef.current);
      if (imgObj) {
        const dx = x - lastXRef.current;
        const dy = y - lastYRef.current;
        imgObj.offsetX = (imgObj.offsetX || 0) + dx;
        imgObj.offsetY = (imgObj.offsetY || 0) + dy;
        lastXRef.current = x;
        lastYRef.current = y;
        render();
      }
    },
    [getCanvasCoords, render]
  );

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      const target = slotAtPoint(x, y);

      if (
        draggingSwapRef.current &&
        dragStartSlotRef.current >= 0 &&
        target >= 0 &&
        target !== dragStartSlotRef.current
      ) {
        // Swap slots
        setImages((prev) => {
          const updated = [...prev];
          const idxA = updated.findIndex((it) => it.slotIndex === dragStartSlotRef.current);
          const idxB = updated.findIndex((it) => it.slotIndex === target);
          if (idxA >= 0 && idxB >= 0) {
            const tmp = updated[idxA].slotIndex;
            updated[idxA] = { ...updated[idxA], slotIndex: updated[idxB].slotIndex };
            updated[idxB] = { ...updated[idxB], slotIndex: tmp };
          } else if (idxA >= 0) {
            updated[idxA] = { ...updated[idxA], slotIndex: target };
          } else if (idxB >= 0) {
            updated[idxB] = { ...updated[idxB], slotIndex: dragStartSlotRef.current };
          }
          return updated;
        });
      }
      draggingSwapRef.current = false;
      dragStartSlotRef.current = -1;
      isPanningRef.current = false;
      panSlotRef.current = -1;
      isPanningOverlayRef.current = false;
      render();
    },
    [getCanvasCoords, slotAtPoint, render]
  );

  const handleCanvasMouseLeave = useCallback(() => {
    draggingSwapRef.current = false;
    dragStartSlotRef.current = -1;
    isPanningRef.current = false;
    panSlotRef.current = -1;
    isPanningOverlayRef.current = false;
  }, []);

  const handleCanvasWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      const step = 0.1;

      // Overlay zoom in edit mode
      if (overlayEnabledRef.current && overlayEditModeRef.current && selectedOverlayRef.current >= 0) {
        const ov = overlaysRef.current[selectedOverlayRef.current];
        if (ov) {
          ov.scale = Math.min(4, Math.max(0.1, (ov.scale || 1) * (1 + direction * step)));
          setOverlays([...overlaysRef.current]);
        }
        return;
      }

      const { x, y } = getCanvasCoords(e as any);
      const idx = slotAtPoint(x, y);
      if (idx < 0) return;
      const imgObj = imagesRef.current.find((it) => it.slotIndex === idx);
      if (!imgObj) return;
      imgObj.scale = Math.min(4, Math.max(0.2, (imgObj.scale || 1) * (1 + direction * step)));
      setImages((prev) => [...prev]);
    },
    [getCanvasCoords, slotAtPoint]
  );

  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      const idx = slotAtPoint(x, y);
      if (idx >= 0) {
        setSelectedSlot(idx);
        selectedSlotRef.current = idx;
        if (slotFileInputRef.current) slotFileInputRef.current.click();
      }
    },
    [getCanvasCoords, slotAtPoint]
  );

  // Drag and drop on canvas
  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
      const y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
      const idx = slotAtPoint(x, y);
      if (idx < 0) return;
      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;
      assignFileToSlot(files[0], idx);
      if (files.length > 1) handleFiles(Array.from(files).slice(1));
    },
    [slotAtPoint, assignFileToSlot, handleFiles]
  );

  // Slot file input handler
  const handleSlotFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0 || selectedSlotRef.current < 0) return;
      assignFileToSlot(files[0], selectedSlotRef.current);
      e.target.value = '';
    },
    [assignFileToSlot]
  );

  // Bulk file input handler
  const handleBulkFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      handleFiles(files);
      e.target.value = '';
    },
    [handleFiles]
  );

  // --- Selected slot controls ---
  const selectedImg = images.find((it) => it.slotIndex === selectedSlot);

  const updateSlotProp = useCallback(
    (key: keyof CollageImageObj, value: any) => {
      setImages((prev) =>
        prev.map((it) => (it.slotIndex === selectedSlot ? { ...it, [key]: value } : it))
      );
    },
    [selectedSlot]
  );

  const clearSlot = useCallback(() => {
    if (selectedSlot >= 0) {
      setImages((prev) => prev.filter((it) => it.slotIndex !== selectedSlot));
    }
  }, [selectedSlot]);

  const resetAll = useCallback(() => {
    setImages([]);
    setSelectedSlot(-1);
  }, []);

  // --- Overlay helpers ---
  const handleOverlayFiles = useCallback((files: FileList | File[]) => {
    const newItems: OverlayItem[] = [];
    Array.from(files).forEach((f) => {
      const url = URL.createObjectURL(f);
      const img = new window.Image();
      img.onload = () => setOverlays((prev) => [...prev]);
      img.src = url;
      newItems.push({
        id: `ov-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        img,
        name: f.name,
        opacity: 1,
        blend: 'source-over',
        scale: 0.5,
        x: 0,
        y: 0,
        rotation: 0,
      });
    });
    setOverlays((prev) => [...prev, ...newItems]);
    if (newItems.length > 0) {
      setSelectedOverlay((prev) => prev < 0 ? 0 : prev);
    }
  }, []);

  const handleOverlayFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      handleOverlayFiles(files);
      e.target.value = '';
    },
    [handleOverlayFiles]
  );

  const moveOverlay = useCallback((dir: 'up' | 'down') => {
    setOverlays((prev) => {
      const idx = selectedOverlayRef.current;
      if (idx < 0 || idx >= prev.length) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      setSelectedOverlay(newIdx);
      return arr;
    });
  }, []);

  const deleteOverlay = useCallback(() => {
    setOverlays((prev) => {
      const idx = selectedOverlayRef.current;
      if (idx < 0 || idx >= prev.length) return prev;
      const arr = prev.filter((_, i) => i !== idx);
      setSelectedOverlay(Math.min(idx, arr.length - 1));
      return arr;
    });
  }, []);

  const centerOverlay = useCallback(() => {
    setOverlays((prev) => {
      const idx = selectedOverlayRef.current;
      if (idx < 0 || idx >= prev.length) return prev;
      const arr = [...prev];
      arr[idx] = { ...arr[idx], x: 0, y: 0 };
      return arr;
    });
  }, []);

  const clearAllOverlays = useCallback(() => {
    setOverlays([]);
    setSelectedOverlay(-1);
  }, []);

  const updateOverlayProp = useCallback(
    (key: keyof OverlayItem, value: any) => {
      setOverlays((prev) => {
        const idx = selectedOverlayRef.current;
        if (idx < 0 || idx >= prev.length) return prev;
        const arr = [...prev];
        arr[idx] = { ...arr[idx], [key]: value };
        return arr;
      });
    },
    []
  );

  const selectedOv = selectedOverlay >= 0 ? overlays[selectedOverlay] : null;

  // --- Export ---
  const exportImage = useCallback(
    (format: 'png' | 'jpeg') => {
      const offCanvas = document.createElement('canvas');
      const ctx = offCanvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      drawScene(ctx, false);

      if (format === 'png') {
        offCanvas.toBlob(
          (blob) => {
            if (!blob) return;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `collage_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('ส่งออก PNG สำเร็จ');
          },
          'image/png',
          1.0
        );
      } else {
        const dataURL = offCanvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `collage_${Date.now()}.jpg`;
        a.click();
        toast.success('ส่งออก JPEG สำเร็จ');
      }
    },
    [drawScene]
  );

  // --- Filter layouts ---
  const filteredLayouts = layoutSearch
    ? ALL_PRESETS.filter(
        (p) =>
          p.id.toLowerCase().includes(layoutSearch.toLowerCase()) ||
          p.name.toLowerCase().includes(layoutSearch.toLowerCase())
      )
    : ALL_PRESETS;

  // --- Layout categories ---
  const layoutCategories = [
    { label: 'ทั้งหมด', filter: '' },
    { label: 'เรียบง่าย', filter: 'S' },
    { label: 'กริด', filter: 'G' },
    { label: 'แถบ', filter: 'V,H' },
    { label: 'ฮีโร่', filter: 'HT,HB,HL,HR' },
    { label: 'หลายส่วน', filter: 'MR,MB,CEN,DIA,CRS,BAN' },
    { label: 'ควิลท์', filter: 'Q' },
    { label: 'โมเสค', filter: 'MOS,BRK,LFR,RING,TRI' },
    { label: 'หัวใจ', filter: 'HEART' },
    { label: 'Love Center', filter: 'LOVECTR' },
    { label: 'ฟิล์ม', filter: 'PSFILM' },
    { label: 'แมกกาซีน', filter: 'PSMAG' },
    { label: 'PSX', filter: 'PSX' },
  ];
  const [activeCategory, setActiveCategory] = useState('');

  const categoryFilteredLayouts = activeCategory
    ? filteredLayouts.filter((p) => {
        const cats = activeCategory.split(',');
        return cats.some((c) => p.id.startsWith(c));
      })
    : filteredLayouts;

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <Link to="/">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              isDark ? 'glass-btn' : 'light-glass-btn'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าหลัก
          </button>
        </Link>
      </div>

      <div className="mb-6">
        <h1
          className={`text-2xl font-semibold font-display ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Collage Builder
        </h1>
        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          สร้างคอลลาจภาพถ่ายสำหรับโซเชียลมีเดีย
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Left Controls */}
        <div className="xl:col-span-1 space-y-4 order-2 xl:order-1">
          {/* Orientation & Resolution */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ขนาดและทิศทาง
              </h3>
            </div>

            {/* Orientation toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setOrient('landscape')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  orient === 'landscape'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isDark
                    ? 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                แนวนอน
              </button>
              <button
                onClick={() => setOrient('portrait')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  orient === 'portrait'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isDark
                    ? 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Minimize2 className="w-3.5 h-3.5" />
                แนวตั้ง
              </button>
            </div>

            {/* Resolution */}
            <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              ขนาดงาน
            </Label>
            <Select value={resPreset} onValueChange={setResPreset}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RES_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-3">
              <Upload className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                อัปโหลดรูปภาพ
              </h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkFileChange}
              className="hidden"
            />
            <input
              ref={slotFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSlotFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-5 border-2 border-dashed rounded-xl flex flex-col items-center gap-1.5 transition-colors ${
                isDark
                  ? 'border-white/20 hover:border-emerald-400/50'
                  : 'border-gray-300 hover:border-emerald-500/50'
              }`}
            >
              <ImageIcon className={`w-8 h-8 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
              <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                คลิกเพื่อเลือกรูปภาพ (เลือกหลายรูปได้)
              </span>
            </button>

            <div className="flex gap-2 mt-3">
              <button
                onClick={resetAll}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isDark
                    ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20'
                    : 'text-red-400 hover:text-red-500 hover:bg-red-50 border border-red-200'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          {/* Gutter / Radius / Background */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-3">
              <Settings2
                className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
              />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                การตั้งค่า
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                  ช่องว่าง: {gutter}px
                </Label>
                <Slider
                  value={[gutter]}
                  onValueChange={([v]) => setGutter(v)}
                  min={0}
                  max={60}
                  step={2}
                />
              </div>
              <div>
                <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                  มุมโค้ง: {radius}px
                </Label>
                <Slider
                  value={[radius]}
                  onValueChange={([v]) => setRadius(v)}
                  min={0}
                  max={80}
                  step={2}
                />
              </div>
              <div>
                <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                  สีพื้นหลัง
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slot Controls */}
          {selectedSlot >= 0 && (
            <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Move
                    className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                  />
                  <h3
                    className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    ช่อง {selectedSlot + 1}
                  </h3>
                </div>
                <button
                  onClick={clearSlot}
                  className={`p-1.5 rounded-lg text-xs ${
                    isDark
                      ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                      : 'text-red-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedImg ? (
                <div className="space-y-3">
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      ขนาด: {(selectedImg.scale * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[selectedImg.scale]}
                      onValueChange={([v]) => updateSlotProp('scale', v)}
                      min={0.2}
                      max={4}
                      step={0.05}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      เลื่อน X: {selectedImg.offsetX.toFixed(0)}
                    </Label>
                    <Slider
                      value={[selectedImg.offsetX]}
                      onValueChange={([v]) => updateSlotProp('offsetX', v)}
                      min={-500}
                      max={500}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      เลื่อน Y: {selectedImg.offsetY.toFixed(0)}
                    </Label>
                    <Slider
                      value={[selectedImg.offsetY]}
                      onValueChange={([v]) => updateSlotProp('offsetY', v)}
                      min={-500}
                      max={500}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      หมุน: {selectedImg.rotation.toFixed(0)}°
                    </Label>
                    <Slider
                      value={[selectedImg.rotation]}
                      onValueChange={([v]) => updateSlotProp('rotation', v)}
                      min={-180}
                      max={180}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      โหมด
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => updateSlotProp('mode', 'fill')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedImg.mode === 'fill'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isDark
                            ? 'bg-white/5 text-white/50 border border-white/10'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        Fill
                      </button>
                      <button
                        onClick={() => updateSlotProp('mode', 'fit')}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedImg.mode === 'fit'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isDark
                            ? 'bg-white/5 text-white/50 border border-white/10'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        Fit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  ยังไม่มีรูปในช่องนี้ — ดับเบิลคลิกเพื่อเพิ่ม
                </p>
              )}
            </div>
          )}

          {/* Watermark */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings2
                  className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                />
                <h3
                  className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  ลายน้ำ
                </h3>
              </div>
              <Switch
                checked={watermark.enabled}
                onCheckedChange={(v) => setWatermark((prev) => ({ ...prev, enabled: v }))}
              />
            </div>

            {watermark.enabled && (
              <div className="space-y-3">
                <div>
                  <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    ข้อความ
                  </Label>
                  <Input
                    value={watermark.text}
                    onChange={(e) =>
                      setWatermark((prev) => ({ ...prev, text: e.target.value }))
                    }
                    placeholder="ชื่อร้าน/ช่างภาพ"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    ฟอนต์
                  </Label>
                  <Select
                    value={watermark.fontFamily}
                    onValueChange={(v) =>
                      setWatermark((prev) => ({ ...prev, fontFamily: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WATERMARK_FONTS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      ขนาด: {watermark.size}px
                    </Label>
                    <Slider
                      value={[watermark.size]}
                      onValueChange={([v]) =>
                        setWatermark((prev) => ({ ...prev, size: v }))
                      }
                      min={12}
                      max={200}
                      step={4}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      ความทึบ: {(watermark.opacity * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[watermark.opacity]}
                      onValueChange={([v]) =>
                        setWatermark((prev) => ({ ...prev, opacity: v }))
                      }
                      min={0.01}
                      max={1}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      ระยะขอบ: {watermark.margin}px
                    </Label>
                    <Slider
                      value={[watermark.margin]}
                      onValueChange={([v]) =>
                        setWatermark((prev) => ({ ...prev, margin: v }))
                      }
                      min={0}
                      max={200}
                      step={4}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      น้ำหนัก
                    </Label>
                    <Select
                      value={String(watermark.weight)}
                      onValueChange={(v) =>
                        setWatermark((prev) => ({ ...prev, weight: parseInt(v) }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">ปกติ (400)</SelectItem>
                        <SelectItem value="600">กึ่งหนา (600)</SelectItem>
                        <SelectItem value="700">หนา (700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      ตำแหน่ง
                    </Label>
                    <Select
                      value={watermark.position}
                      onValueChange={(v) =>
                        setWatermark((prev) => ({ ...prev, position: v }))
                      }
                    >
                      <SelectTrigger className="mt-1">
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
                  <div>
                    <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      สี
                    </Label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="color"
                        value={watermark.color}
                        onChange={(e) =>
                          setWatermark((prev) => ({ ...prev, color: e.target.value }))
                        }
                        className="w-8 h-8 rounded border-0 cursor-pointer"
                      />
                      <Input
                        value={watermark.color}
                        onChange={(e) =>
                          setWatermark((prev) => ({ ...prev, color: e.target.value }))
                        }
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Overlay */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Copy
                  className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                />
                <h3
                  className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  ภาพซ้อน (Overlay)
                </h3>
              </div>
              <Switch
                checked={overlayEnabled}
                onCheckedChange={setOverlayEnabled}
              />
            </div>

            {overlayEnabled && (
              <div className="space-y-3">
                {/* File upload */}
                <input
                  ref={overlayFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleOverlayFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => overlayFileInputRef.current?.click()}
                  className={`w-full py-2 border border-dashed rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors ${
                    isDark
                      ? 'border-white/20 hover:border-amber-400/50 text-white/50'
                      : 'border-gray-300 hover:border-amber-500/50 text-gray-500'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  เลือกภาพซ้อน (หลายรูปได้)
                </button>

                {/* List + reorder/delete */}
                {overlays.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      size={Math.min(4, overlays.length)}
                      value={selectedOverlay}
                      onChange={(e) => setSelectedOverlay(parseInt(e.target.value))}
                      className={`flex-1 text-xs rounded-lg border p-1.5 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {overlays.map((ov, i) => (
                        <option key={ov.id} value={i}>
                          {ov.name.length > 20 ? ov.name.slice(0, 20) + '...' : ov.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveOverlay('up')}
                        className={`p-1 rounded text-xs ${
                          isDark
                            ? 'bg-white/10 hover:bg-white/20 text-white/60'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                        }`}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveOverlay('down')}
                        className={`p-1 rounded text-xs ${
                          isDark
                            ? 'bg-white/10 hover:bg-white/20 text-white/60'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={deleteOverlay}
                        className={`p-1 rounded text-xs ${
                          isDark
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                            : 'bg-red-50 hover:bg-red-100 text-red-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit mode toggle */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    โหมดแก้ไข (ลาก/ซูม บนแคนวาส)
                  </span>
                  <Switch
                    checked={overlayEditMode}
                    onCheckedChange={setOverlayEditMode}
                  />
                </div>

                {/* Selected overlay controls */}
                {selectedOv && (
                  <div className="space-y-3">
                    <div>
                      <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        ความทึบ: {(selectedOv.opacity * 100).toFixed(0)}%
                      </Label>
                      <Slider
                        value={[selectedOv.opacity]}
                        onValueChange={([v]) => updateOverlayProp('opacity', v)}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        โหมดผสมสี
                      </Label>
                      <Select
                        value={selectedOv.blend}
                        onValueChange={(v) => updateOverlayProp('blend', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLEND_MODES.map((bm) => (
                            <SelectItem key={bm.value} value={bm.value}>
                              {bm.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        ซูม: {(selectedOv.scale * 100).toFixed(0)}%
                      </Label>
                      <Slider
                        value={[selectedOv.scale]}
                        onValueChange={([v]) => updateOverlayProp('scale', v)}
                        min={0.1}
                        max={4}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        ตำแหน่ง X: {selectedOv.x.toFixed(0)}
                      </Label>
                      <Slider
                        value={[selectedOv.x]}
                        onValueChange={([v]) => updateOverlayProp('x', v)}
                        min={-3000}
                        max={3000}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        ตำแหน่ง Y: {selectedOv.y.toFixed(0)}
                      </Label>
                      <Slider
                        value={[selectedOv.y]}
                        onValueChange={([v]) => updateOverlayProp('y', v)}
                        min={-3000}
                        max={3000}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        หมุน: {selectedOv.rotation.toFixed(0)}°
                      </Label>
                      <Slider
                        value={[selectedOv.rotation]}
                        onValueChange={([v]) => updateOverlayProp('rotation', v)}
                        min={-180}
                        max={180}
                        step={1}
                      />
                    </div>
                    <button
                      onClick={centerOverlay}
                      className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                        isDark
                          ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <Crosshair className="w-3.5 h-3.5 inline mr-1.5" />
                      จัดกึ่งกลาง (ตัวที่เลือก)
                    </button>
                  </div>
                )}

                <button
                  onClick={clearAllOverlays}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                    isDark
                      ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20'
                      : 'text-red-400 hover:text-red-500 hover:bg-red-50 border border-red-200'
                  }`}
                >
                  ล้างภาพซ้อนทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* Export */}
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-3">
              <Download
                className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
              />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ส่งออก
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportImage('png')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
              >
                <Download className="w-3.5 h-3.5" />
                PNG
              </button>
              <button
                onClick={() => exportImage('jpeg')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              >
                <Download className="w-3.5 h-3.5" />
                JPEG
              </button>
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="xl:col-span-2 order-1 xl:order-2">
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                ตัวอย่าง
              </h3>
              <div
                className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}
              >
                {(() => {
                  const { W, H } = getCanvasWH();
                  return `${W}\u00d7${H}px`;
                })()}
              </div>
            </div>

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className={`rounded-xl cursor-move ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
                onWheel={handleCanvasWheel}
                onDoubleClick={handleCanvasDoubleClick}
                onDragOver={handleCanvasDragOver}
                onDrop={handleCanvasDrop}
              />
            </div>

            <p className={`text-xs text-center mt-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
              คลิก = เลือกช่อง &bull; ลาก = เลื่อนรูป &bull; Scroll = ซูม &bull; ดับเบิลคลิก =
              เพิ่มรูป &bull; ลากปุ่มมุม = สลับช่อง
            </p>
          </div>
        </div>

        {/* Right: Layout Presets */}
        <div className="xl:col-span-1 order-3">
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 rounded-2xl`}>
            <div className="flex items-center gap-2 mb-3">
              <Layers
                className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
              />
              <h3
                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                เลย์เอาต์ ({categoryFilteredLayouts.length})
              </h3>
            </div>

            {/* Search */}
            <Input
              value={layoutSearch}
              onChange={(e) => setLayoutSearch(e.target.value)}
              placeholder="ค้นหาเลย์เอาต์..."
              className="mb-3"
            />

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {layoutCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.filter)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    activeCategory === cat.filter
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isDark
                      ? 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Layout grid */}
            <div
              className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin' }}
            >
              {categoryFilteredLayouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleSetLayout(layout)}
                  className={`p-1.5 rounded-xl transition-all flex flex-col items-center gap-1 ${
                    currentLayout.id === layout.id
                      ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500/30'
                      : isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  } border`}
                  title={`${layout.name} (${layout.slots.length} ช่อง)`}
                >
                  <LayoutThumbnail layout={layout} isDark={isDark} />
                  <span
                    className={`text-[8px] leading-tight text-center truncate w-full ${
                      isDark ? 'text-white/50' : 'text-gray-500'
                    }`}
                  >
                    {layout.slots.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Layout Thumbnail Component ---
function LayoutThumbnail({ layout, isDark }: { layout: CollageLayout; isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawLayoutThumbnail(canvasRef.current, layout, isDark);
    }
  }, [layout, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded"
      style={{ width: '100%', height: 'auto', aspectRatio: '1' }}
    />
  );
}
