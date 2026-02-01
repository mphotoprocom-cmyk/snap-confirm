import { useState, useRef } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Plus, Copy, Check, ExternalLink, Upload, Image, Calendar, Eye, LayoutGrid, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { GalleryLayoutSelector, type GalleryLayout } from '@/components/GalleryLayoutSelector';
import { GalleryImageGrid } from '@/components/GalleryImageGrid';

export default function DeliveryGalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useDeliveryGallery(id);
  const uploadImage = useUploadDeliveryImage();
  const addImage = useAddDeliveryImage();
  const deleteImage = useDeleteDeliveryImage();
  const updateGallery = useUpdateDeliveryGallery();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<GalleryLayout>('grid-4');
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);

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
                <GalleryLayoutSelector value={selectedLayout} onChange={setSelectedLayout} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Images Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>รูปภาพ</CardTitle>
              <CardDescription>อัปโหลดรูปภาพเพื่อส่งให้ลูกค้าดาวน์โหลด</CardDescription>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <GalleryImageGrid
                images={images}
                layout={selectedLayout}
                onDeleteImage={(id) => deleteImage.mutate({ id, galleryId: gallery.id })}
                formatFileSize={formatFileSize}
              />
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">ยังไม่มีรูปภาพ</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  อัปโหลดรูปภาพเพื่อส่งให้ลูกค้า
                </p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มรูปภาพ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
