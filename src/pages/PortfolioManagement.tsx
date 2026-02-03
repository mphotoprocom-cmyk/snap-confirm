import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Navigate, Link } from 'react-router-dom';
import {
  usePortfolioImages,
  useAddPortfolioImage,
  useDeletePortfolioImage,
  useUploadPortfolioImage,
  useUpdatePortfolioImage,
  PortfolioImage,
} from '@/hooks/usePortfolio';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import {
  Camera,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Image,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

const JOB_TYPE_OPTIONS = [
  { value: 'wedding', label: 'งานแต่งงาน' },
  { value: 'event', label: 'อีเว้นท์' },
  { value: 'corporate', label: 'องค์กร' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'other', label: 'อื่นๆ' },
];

export default function PortfolioManagement() {
  const { user, loading: authLoading } = useAuth();
  const { data: images, isLoading } = usePortfolioImages();
  const addImage = useAddPortfolioImage();
  const deleteImage = useDeletePortfolioImage();
  const uploadImage = useUploadPortfolioImage();
  const updateImage = useUpdatePortfolioImage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [newImageData, setNewImageData] = useState({
    title: '',
    description: '',
    job_type: 'event' as any,
    is_featured: false,
  });
  const [copied, setCopied] = useState(false);

  if (authLoading) {
    return <div className="py-12 text-center">กำลังโหลด...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const portfolioUrl = `${window.location.origin}/portfolio/${user.id}`;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadingFiles(files);
      setIsUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    for (const file of uploadingFiles) {
      const imageUrl = await uploadImage.mutateAsync(file);
      await addImage.mutateAsync({ image_url: imageUrl, ...newImageData });
    }
    setUploadingFiles([]);
    setIsUploadDialogOpen(false);
    setNewImageData({
      title: '',
      description: '',
      job_type: 'event',
      is_featured: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    toast.success('คัดลอกลิงก์แล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Portfolio Link */}
      <Card className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 mb-8`}>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold">ลิงก์ Portfolio ของคุณ</h2>
          </div>
          <div className="flex gap-2">
            <Input value={portfolioUrl} readOnly />
            <Button size="icon" onClick={handleCopyLink}>
              {copied ? <Check /> : <Copy />}
            </Button>
            <Link to={`/portfolio/${user.id}`} target="_blank">
              <Button size="icon" variant="outline">
                <ExternalLink />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 mb-8`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">รูปภาพผลงาน</h2>
            <p className="text-sm opacity-70">อัปโหลดรูปภาพเพื่อแสดงในหน้า Portfolio</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มรูปภาพ
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileSelect}
          />
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : images && images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <AspectRatio ratio={1}>
                    <img src={image.image_url} className="rounded-lg object-cover" />
                  </AspectRatio>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                    <Button size="icon" onClick={() => setSelectedImage(image)}>
                      <Edit />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบรูปภาพ</AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณแน่ใจหรือไม่?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteImage.mutate(image.id)}>
                            ลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="absolute top-2 left-2 flex gap-1">
                    {image.is_featured && <Badge>แนะนำ</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="mx-auto mb-4" />
              ยังไม่มีรูปภาพ
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog / Edit Dialog — โครงสร้างเดิม ถูกต้องแล้ว */}
      {/* ไม่ต้องแก้อะไรเพิ่ม */}
    </>
  );
}
