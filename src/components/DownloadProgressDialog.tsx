import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface DownloadProgress {
  total: number;
  completed: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  status: 'downloading' | 'zipping' | 'complete' | 'error';
}

interface DownloadProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: DownloadProgress;
  onCancel?: () => void;
}

export function DownloadProgressDialog({ 
  open, 
  onOpenChange, 
  progress,
  onCancel 
}: DownloadProgressDialogProps) {
  const percentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  const canClose = progress.status === 'complete' || progress.status === 'error';

  const getStatusText = () => {
    switch (progress.status) {
      case 'downloading':
        return `กำลังดาวน์โหลด ${progress.completed}/${progress.total} รูป...`;
      case 'zipping':
        return 'กำลังสร้างไฟล์ ZIP...';
      case 'complete':
        if (progress.failed > 0) {
          return `ดาวน์โหลดสำเร็จ ${progress.completed - progress.failed}/${progress.total} รูป`;
        }
        return `ดาวน์โหลดสำเร็จ ${progress.completed} รูป`;
      case 'error':
        return 'เกิดข้อผิดพลาดในการดาวน์โหลด';
      default:
        return 'กำลังเตรียมการ...';
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'downloading':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'zipping':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Download className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => !canClose && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            <span>ดาวน์โหลดรูปภาพ</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Batch indicator for large galleries */}
          {progress.totalBatches > 1 && (
            <div className="text-sm text-muted-foreground text-center">
              ไฟล์ ZIP ที่ {progress.currentBatch}/{progress.totalBatches}
            </div>
          )}
          
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={percentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{getStatusText()}</span>
              <span>{percentage}%</span>
            </div>
          </div>
          
          {/* Failed count warning */}
          {progress.failed > 0 && progress.status !== 'error' && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>{progress.failed} รูปดาวน์โหลดไม่สำเร็จ</span>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            {!canClose && onCancel && (
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                ยกเลิก
              </Button>
            )}
            {canClose && (
              <Button onClick={() => onOpenChange(false)}>
                ปิด
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
