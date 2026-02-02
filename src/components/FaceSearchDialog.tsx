import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Camera, Upload, X, Search, Loader2, UserRound, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeliveryImage } from '@/hooks/useDeliveryGallery';

interface FaceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  progress: number;
  error: string | null;
  matchedCount: number;
  onSearch: (file: File, threshold: number) => Promise<DeliveryImage[]>;
  onReset: () => void;
}

export function FaceSearchDialog({
  open,
  onOpenChange,
  isLoading,
  progress,
  error,
  matchedCount,
  onSearch,
  onReset,
}: FaceSearchDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(0.5);
  const [hasSearched, setHasSearched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setHasSearched(false);
      onReset();
    }
  };

  const handleSearch = async () => {
    if (!selectedFile) return;
    setHasSearched(true);
    await onSearch(selectedFile, threshold);
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setHasSearched(false);
    onReset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="w-5 h-5" />
            ค้นหาด้วยใบหน้า
          </DialogTitle>
          <DialogDescription>
            อัปโหลดรูปใบหน้าเพื่อค้นหารูปที่มีใบหน้าตรงกันในแกลเลอรี่
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />

            {previewUrl ? (
              <div className="relative">
                <div className="aspect-square w-full max-w-[200px] mx-auto rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                {!isLoading && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={handleReset}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25",
                  "flex flex-col items-center justify-center gap-2 p-6",
                  "hover:border-primary/50 hover:bg-muted/50 transition-colors"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">คลิกเพื่ออัปโหลดรูปภาพ</p>
                  <p className="text-xs text-muted-foreground">หรือลากไฟล์มาวาง</p>
                </div>
              </button>
            )}
          </div>

          {/* Threshold Slider */}
          <div className="space-y-2">
            <Label className="text-sm">
              ระดับความเข้มงวด: {Math.round((1 - threshold) * 100)}%
            </Label>
            <Slider
              value={[threshold]}
              onValueChange={([val]) => setThreshold(val)}
              min={0.3}
              max={0.7}
              step={0.05}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              ยิ่งสูงยิ่งเข้มงวด (อาจพลาดรูปบางรูป) / ยิ่งต่ำยิ่งผ่อนปรน (อาจมีรูปที่ไม่ตรงปน)
            </p>
          </div>

          {/* Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังค้นหา...
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {hasSearched && !isLoading && !error && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              {matchedCount > 0 ? (
                <p className="text-sm">
                  พบ <span className="font-semibold text-primary">{matchedCount}</span> รูปที่มีใบหน้าตรงกัน
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ไม่พบรูปที่มีใบหน้าตรงกัน ลองลดระดับความเข้มงวดแล้วค้นหาใหม่
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              {hasSearched && matchedCount > 0 ? 'ดูผลลัพธ์' : 'ปิด'}
            </Button>
            <Button
              onClick={handleSearch}
              disabled={!selectedFile || isLoading}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังค้นหา...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  ค้นหา
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
