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
  PortfolioImage
} from '@/hooks/usePortfolio';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Camera, Plus, Trash2, Edit, ExternalLink, Image, Copy, Check } from 'lucide-react';
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
    job_type: 'event' as 'wedding' | 'event' | 'corporate' | 'portrait' | 'other',
    is_featured: false,
  });
  const [copied, setCopied] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`animate-pulse ${isDark ? 'text-white/50' : 'text-gray-500'}`}>กำลังโหลด...</div>
      </div>
    );
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
    if (uploadingFiles.length === 0) return;

    for (const file of uploadingFiles) {
      try {
        const imageUrl = await uploadImage.mutateAsync(file);
        await addImage.mutateAsync({
          image_url: imageUrl,
          ...newImageData,
        });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploadingFiles([]);
    setIsUploadDialogOpen(false);
    setNewImageData({
      title: '',
      description: '',
      job_type: 'event',
      is_featured: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (image: PortfolioImage) => {
    setSelectedImage(image);
    setIsEditDialogOpen(true);
  };

  const handleUpdateImage = async () => {
    if (!selectedImage) return;
    
    await updateImage.mutateAsync({
      id: selectedImage.id,
      title: selectedImage.title,
      description: selectedImage.description,
      job_type: selectedImage.job_type,
      is_featured: selectedImage.is_featured,
    });
    
    setIsEditDialogOpen(false);
    setSelectedImage(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    toast.success('คัดลอกลิงก์แล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Portfolio Link Card */}
      <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 mb-8`}>
        <div className="flex items-center gap-2 mb-2">
          <Camera className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>ลิงก์ Portfolio ของคุณ</h2>
        </div>
        <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          แชร์ลิงก์นี้ให้ลูกค้าเพื่อดูผลงานและแพ็กเกจบริการของคุณ
        </p>
        <div className="flex gap-2">
          <Input value={portfolioUrl} readOnly className="font-mono text-sm" />
          <button className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`} onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <Link to={`/portfolio/${user.id}`} target="_blank" className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Upload Section */}
      <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 mb-8`}>
        <div className="flex flex-row items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>รูปภาพผลงาน</h2>
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>อัปโหลดรูปภาพเพื่อแสดงในหน้า Portfolio</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <Plus className="w-4 h-4" />
            เพิ่มรูปภาพ
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <AspectRatio ratio={1}>
                      <div className="w-full h-full bg-muted rounded-lg" />
                    </AspectRatio>
                  </div>
                ))}
              </div>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="group relative">
                    <AspectRatio ratio={1}>
                      <img
                        src={image.image_url}
                        alt={image.title || 'Portfolio image'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </AspectRatio>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button size="icon" variant="secondary" onClick={() => handleEdit(image)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ลบรูปภาพ</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
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
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {image.is_featured && (
                        <Badge variant="secondary" className="text-xs">แนะนำ</Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-background/80">
                        {JOB_TYPE_OPTIONS.find((o) => o.value === image.job_type)?.label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
          ) : (
            <div className={`text-center py-12 border-2 border-dashed rounded-lg ${isDark ? 'border-white/20' : 'border-gray-300'}`}>
              <Image className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>ยังไม่มีรูปภาพ</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                เริ่มต้นอัปโหลดรูปภาพผลงานของคุณ
              </p>
              <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 px-4 py-2 rounded-lg mx-auto ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
                <Plus className="w-4 h-4" />
                เพิ่มรูปภาพ
              </button>
            </div>
          )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มรูปภาพ ({uploadingFiles.length} ไฟล์)</DialogTitle>
            <DialogDescription>
              กำหนดข้อมูลสำหรับรูปภาพที่จะอัปโหลด
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">ชื่อผลงาน (ไม่บังคับ)</Label>
              <Input
                id="title"
                value={newImageData.title}
                onChange={(e) => setNewImageData({ ...newImageData, title: e.target.value })}
                placeholder="เช่น งานแต่งคุณ A & B"
              />
            </div>
            
            <div>
              <Label htmlFor="job_type">ประเภทงาน</Label>
              <Select
                value={newImageData.job_type}
                onValueChange={(v) => setNewImageData({ ...newImageData, job_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">คำอธิบาย (ไม่บังคับ)</Label>
              <Textarea
                id="description"
                value={newImageData.description}
                onChange={(e) => setNewImageData({ ...newImageData, description: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติม"
                rows={2}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={newImageData.is_featured}
                onCheckedChange={(v) => setNewImageData({ ...newImageData, is_featured: v })}
              />
              <Label htmlFor="is_featured">แสดงเป็นผลงานแนะนำ</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploadImage.isPending || addImage.isPending}
            >
              {uploadImage.isPending || addImage.isPending ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขรูปภาพ</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="w-full max-w-[200px] mx-auto">
                <AspectRatio ratio={1}>
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.title || 'Preview'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </AspectRatio>
              </div>
              
              <div>
                <Label htmlFor="edit-title">ชื่อผลงาน</Label>
                <Input
                  id="edit-title"
                  value={selectedImage.title || ''}
                  onChange={(e) => setSelectedImage({ ...selectedImage, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-job_type">ประเภทงาน</Label>
                <Select
                  value={selectedImage.job_type}
                  onValueChange={(v) => setSelectedImage({ ...selectedImage, job_type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-description">คำอธิบาย</Label>
                <Textarea
                  id="edit-description"
                  value={selectedImage.description || ''}
                  onChange={(e) => setSelectedImage({ ...selectedImage, description: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-is_featured"
                  checked={selectedImage.is_featured}
                  onCheckedChange={(v) => setSelectedImage({ ...selectedImage, is_featured: v })}
                />
                <Label htmlFor="edit-is_featured">แสดงเป็นผลงานแนะนำ</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdateImage} disabled={updateImage.isPending}>
              {updateImage.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
