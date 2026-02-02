import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { 
  useDeliveryGallery, 
  useUploadDeliveryImage,
  useAddDeliveryImage,
  useDeleteDeliveryImage,
  useUpdateDeliveryGallery
} from '@/hooks/useDeliveryGallery';
import { useFaceSearch } from '@/hooks/useFaceSearch';
import { FaceSearchDialog } from '@/components/FaceSearchDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Copy, Check, ExternalLink, Upload, Image, Calendar, Eye, LayoutGrid, ChevronDown, ImageIcon, Trash2, FileArchive, Loader2, ArrowUpDown, UserRound } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { GalleryLayoutSelector, type GalleryLayout } from '@/components/GalleryLayoutSelector';
import { GalleryImageGrid } from '@/components/GalleryImageGrid';
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';

type ZipUiProgress = {
  status: 'idle' | 'extracting' | 'uploading' | 'complete' | 'error';
  message: string;
  progress: number;
  totalFiles: number;
  processedFiles: number;
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];

function isImageFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function getBasename(filepath: string): string {
  const parts = filepath.split('/');
  return parts[parts.length - 1] || filepath;
}

export default function DeliveryGalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useDeliveryGallery(id);
  const uploadImage = useUploadDeliveryImage();
  const addImage = useAddDeliveryImage();
  const deleteImage = useDeleteDeliveryImage();
  const updateGallery = useUpdateDeliveryGallery();
  
  // Face search hook - must be called before any conditional returns
  const faceSearch = useFaceSearch(data?.images ?? []);
  
  const [zipProgress, setZipProgress] = useState<ZipUiProgress>({
    status: 'idle',
    message: '',
    progress: 0,
    totalFiles: 0,
    processedFiles: 0,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<GalleryLayout>('grid-4');
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showFaceSearchDialog, setShowFaceSearchDialog] = useState(false);
  
  // Load saved layout from gallery data
  useEffect(() => {
    if (data?.gallery?.layout) {
      setSelectedLayout(data.gallery.layout as GalleryLayout);
    }
  }, [data?.gallery?.layout]);

  // Save layout when changed
  const handleLayoutChange = async (newLayout: GalleryLayout) => {
    setSelectedLayout(newLayout);
    if (data?.gallery) {
      await updateGallery.mutateAsync({
        id: data.gallery.id,
        layout: newLayout,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h1 className="text-xl font-semibold mb-2">ไม่พบแกลเลอรี่</h1>
              <Button variant="outline" onClick={() => navigate('/deliveries')}>
                กลับหน้ารายการ
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { gallery, images } = data;
  const shareUrl = `${window.location.origin}/delivery/${gallery.access_token}`;
  const isExpired = gallery.expires_at && new Date(gallery.expires_at) < new Date();

  // Sort images based on sort order or face search results
  const displayImages = faceSearch.matchedImages.length > 0 
    ? faceSearch.matchedImages 
    : [...images].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });

  const handleToggleFaceSearch = async () => {
    await updateGallery.mutateAsync({
      id: gallery.id,
      face_search_enabled: !gallery.face_search_enabled,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of files) {
      try {
        const result = await uploadImage.mutateAsync({ file, galleryId: gallery.id });
        await addImage.mutateAsync({
          gallery_id: gallery.id,
          filename: result.filename,
          image_url: result.url,
          file_size: result.fileSize,
        });
        successCount++;
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (successCount > 0) {
      toast.success(`อัปโหลดสำเร็จ ${successCount} ไฟล์`);
    }
  };

  const handleZipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipFile = e.target.files?.[0];
    if (!zipFile) return;

    // IMPORTANT:
    // Large ZIPs (e.g. 200MB) can exceed backend function limits.
    // We unzip in the browser and reuse the existing per-image upload pipeline.
    try {
      setZipProgress({
        status: 'extracting',
        message: 'กำลังอ่านไฟล์ ZIP...',
        progress: 0,
        totalFiles: 0,
        processedFiles: 0,
      });

      const zip = await JSZip.loadAsync(zipFile);
      const entries = Object.entries(zip.files)
        .filter(([name, entry]) => !entry.dir)
        .filter(([name]) => isImageFile(name))
        .filter(([name]) => !name.startsWith('__MACOSX') && !name.startsWith('.') && !name.includes('/.__MACOSX'));

      if (entries.length === 0) {
        throw new Error('ไม่พบไฟล์รูปภาพใน ZIP');
      }

      setZipProgress({
        status: 'uploading',
        message: `พบ ${entries.length} รูป กำลังอัปโหลด...`,
        progress: 0,
        totalFiles: entries.length,
        processedFiles: 0,
      });

      let successCount = 0;
      let errorCount = 0;

      // Small concurrency to keep memory stable in the browser.
      const CONCURRENCY = 3;
      for (let i = 0; i < entries.length; i += CONCURRENCY) {
        const batch = entries.slice(i, i + CONCURRENCY);

        const results = await Promise.all(
          batch.map(async ([path, entry]) => {
            const filename = getBasename(path);
            try {
              const blob = await entry.async('blob');
              const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });

              const uploaded = await uploadImage.mutateAsync({ file, galleryId: gallery.id });
              await addImage.mutateAsync({
                gallery_id: gallery.id,
                filename: uploaded.filename,
                image_url: uploaded.url,
                file_size: uploaded.fileSize,
              });

              return { ok: true };
            } catch (err) {
              console.error('ZIP image upload error:', filename, err);
              return { ok: false };
            }
          })
        );

        for (const r of results) {
          if (r.ok) successCount++;
          else errorCount++;
        }

        const processedFiles = successCount + errorCount;
        const progress = Math.round((processedFiles / entries.length) * 100);
        setZipProgress({
          status: 'uploading',
          message: `กำลังอัปโหลด... (${processedFiles}/${entries.length})`,
          progress,
          totalFiles: entries.length,
          processedFiles,
        });
      }

      setZipProgress({
        status: 'complete',
        message: `เสร็จสิ้น ${successCount} รูป`,
        progress: 100,
        totalFiles: entries.length,
        processedFiles: entries.length,
      });

      if (successCount > 0) toast.success(`อัปโหลดจาก ZIP สำเร็จ ${successCount} รูป`);
      if (errorCount > 0) toast.warning(`${errorCount} รูปอัปโหลดไม่สำเร็จ`);
    } catch (error: any) {
      setZipProgress({
        status: 'error',
        message: error?.message || 'เกิดข้อผิดพลาด',
        progress: 0,
        totalFiles: 0,
        processedFiles: 0,
      });
      toast.error('อัปโหลด ZIP ไม่สำเร็จ: ' + (error?.message || 'Unknown error'));
    } finally {
      if (zipInputRef.current) zipInputRef.current.value = '';
      // Reset UI after a short delay (but keep completion message briefly)
      setTimeout(() => {
        setZipProgress({ status: 'idle', message: '', progress: 0, totalFiles: 0, processedFiles: 0 });
      }, 2500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('คัดลอกลิงก์แล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleActive = async () => {
    await updateGallery.mutateAsync({
      id: gallery.id,
      is_active: !gallery.is_active,
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingCover(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `delivery/${gallery.id}`);

      const response = await supabase.functions.invoke('r2-storage?action=upload', {
        body: formData,
      });

      if (response.error) throw response.error;

      await updateGallery.mutateAsync({
        id: gallery.id,
        cover_image_url: response.data.url,
        show_cover: true,
      });

      toast.success('อัปโหลดภาพหน้าปกสำเร็จ');
    } catch (error: any) {
      toast.error('อัปโหลดไม่สำเร็จ: ' + error.message);
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCover = async () => {
    await updateGallery.mutateAsync({
      id: gallery.id,
      cover_image_url: null,
      show_cover: false,
    });
    toast.success('ลบภาพหน้าปกแล้ว');
  };

  const handleToggleCover = async () => {
    await updateGallery.mutateAsync({
      id: gallery.id,
      show_cover: !gallery.show_cover,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/deliveries')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับหน้ารายการ
        </Button>

        {/* Gallery Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {gallery.title}
                  {!gallery.is_active && <Badge variant="secondary">ปิดใช้งาน</Badge>}
                  {isExpired && <Badge variant="destructive">หมดอายุ</Badge>}
                </CardTitle>
                <CardDescription>
                  ลูกค้า: {gallery.client_name}
                  {gallery.client_email && ` • ${gallery.client_email}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={gallery.is_active}
                  onCheckedChange={handleToggleActive}
                />
                <span className="text-sm text-muted-foreground">
                  {gallery.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Image className="w-4 h-4" />
                {images.length} รูปภาพ
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                เข้าชม {gallery.download_count} ครั้ง
              </span>
              {gallery.expires_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  หมดอายุ {format(new Date(gallery.expires_at), 'd MMM yyyy', { locale: th })}
                </span>
              )}
            </div>

            {/* Share Link */}
            <div>
              <Label className="text-sm font-medium mb-2 block">ลิงก์สำหรับลูกค้า</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" onClick={handleCopyLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/delivery/${gallery.access_token}`} target="_blank">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <CardTitle className="text-base">ภาพหน้าปก</CardTitle>
              </div>
              {gallery.cover_image_url && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={gallery.show_cover}
                    onCheckedChange={handleToggleCover}
                  />
                  <span className="text-sm text-muted-foreground">
                    {gallery.show_cover ? 'แสดง' : 'ซ่อน'}
                  </span>
                </div>
              )}
            </div>
            <CardDescription>
              ภาพหน้าปกจะแสดงด้านบนสุดของแกลเลอรี่ในหน้าลูกค้า (ค่าเริ่มต้นปิด)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gallery.cover_image_url ? (
              <div className="space-y-4">
                <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden">
                  <img
                    src={gallery.cover_image_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? 'กำลังอัปโหลด...' : 'เปลี่ยนภาพ'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRemoveCover}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบภาพหน้าปก
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => coverInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">อัปโหลดภาพหน้าปก</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  แนะนำขนาด 1920x1080 หรืออัตราส่วน 16:9
                </p>
                <Button variant="outline" disabled={isUploadingCover}>
                  {isUploadingCover ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-pulse" />
                      กำลังอัปโหลด...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      เลือกภาพ
                    </>
                  )}
                </Button>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </CardContent>
        </Card>

        {/* Layout Selector */}
        <Collapsible open={isLayoutOpen} onOpenChange={setIsLayoutOpen}>
          <Card className="mb-6">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    <CardTitle className="text-base">เลือก Layout แสดงผล</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isLayoutOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Layout ที่เลือกจะแสดงผลในหน้าลูกค้าด้วย
                </p>
                <GalleryLayoutSelector value={selectedLayout} onChange={handleLayoutChange} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Face Search Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5" />
                <CardTitle className="text-base">ค้นหาด้วยใบหน้า</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={gallery.face_search_enabled}
                  onCheckedChange={handleToggleFaceSearch}
                />
                <span className="text-sm text-muted-foreground">
                  {gallery.face_search_enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>
            </div>
            <CardDescription>
              ให้ลูกค้าอัปโหลดรูปหน้าตัวเองเพื่อค้นหารูปที่มีใบหน้าตรงกันในแกลเลอรี่
            </CardDescription>
          </CardHeader>
          {gallery.face_search_enabled && images.length > 0 && (
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => setShowFaceSearchDialog(true)}
                disabled={faceSearch.isLoading}
              >
                <UserRound className="w-4 h-4 mr-2" />
                ทดสอบค้นหาใบหน้า
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Images Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>รูปภาพ</CardTitle>
                <CardDescription>อัปโหลดรูปภาพเพื่อส่งให้ลูกค้าดาวน์โหลด</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                  <SelectTrigger className="w-[160px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                    <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => zipInputRef.current?.click()} 
                  disabled={isUploading || zipProgress.status === 'extracting' || zipProgress.status === 'uploading'}
                >
                  {zipProgress.status === 'extracting' || zipProgress.status === 'uploading' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {zipProgress.status === 'extracting' ? 'กำลังอ่าน ZIP...' : 'กำลังอัปโหลด...'}
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-4 h-4 mr-2" />
                      อัปโหลด ZIP
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || zipProgress.status === 'extracting' || zipProgress.status === 'uploading'}
                >
                  {isUploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-pulse" />
                      กำลังอัปโหลด...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่มรูปภาพ
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* ZIP Upload Progress */}
            {(zipProgress.status === 'extracting' || zipProgress.status === 'uploading') && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">{zipProgress.message}</span>
                </div>
                {zipProgress.totalFiles > 0 && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {zipProgress.processedFiles} / {zipProgress.totalFiles} รูป
                  </p>
                )}
                <Progress value={zipProgress.progress || 10} className="h-2" />
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={handleZipSelect}
            />
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <>
                {faceSearch.matchedImages.length > 0 && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
                    <span className="text-sm">
                      แสดง <span className="font-semibold">{faceSearch.matchedImages.length}</span> รูปที่พบใบหน้าตรงกัน (จากทั้งหมด {images.length} รูป)
                    </span>
                    <Button variant="ghost" size="sm" onClick={faceSearch.resetSearch}>
                      แสดงทั้งหมด
                    </Button>
                  </div>
                )}
                <GalleryImageGrid
                  images={displayImages}
                  layout={selectedLayout}
                  onDeleteImage={(id) => deleteImage.mutate({ id, galleryId: gallery.id })}
                  formatFileSize={formatFileSize}
                />
              </>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">ยังไม่มีรูปภาพ</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  อัปโหลดรูปภาพทีละรูป หรืออัปโหลดไฟล์ ZIP ที่รวมรูปภาพไว้
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => zipInputRef.current?.click()}>
                    <FileArchive className="w-4 h-4 mr-2" />
                    อัปโหลด ZIP
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มรูปภาพ
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Face Search Dialog */}
      <FaceSearchDialog
        open={showFaceSearchDialog}
        onOpenChange={setShowFaceSearchDialog}
        isLoading={faceSearch.isLoading}
        progress={faceSearch.progress}
        error={faceSearch.error}
        matchedCount={faceSearch.matchedImages.length}
        onSearch={faceSearch.searchFaces}
        onReset={faceSearch.resetSearch}
      />
    </div>
  );
}
