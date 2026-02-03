import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '@/hooks/usePackages';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Package } from '@/types/package';
import { JOB_TYPE_LABELS, JobType } from '@/types/booking';
import { Plus, Pencil, Trash2, Loader2, Package as PackageIcon } from 'lucide-react';

interface PackageFormData {
  name: string;
  price: number;
  description: string;
  job_type: string;
  is_active: boolean;
}

export default function Packages() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: packages, isLoading } = usePackages();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    price: 0,
    description: '',
    job_type: '',
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) return null;

  const handleOpenDialog = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description || '',
        job_type: pkg.job_type || '',
        is_active: pkg.is_active,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        price: 0,
        description: '',
        job_type: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPackage) {
      await updatePackage.mutateAsync({
        id: editingPackage.id,
        ...formData,
        job_type: (formData.job_type || null) as any,
      });
    } else {
      await createPackage.mutateAsync({
        ...formData,
        job_type: formData.job_type || undefined,
      });
    }

    setIsDialogOpen(false);
    setEditingPackage(null);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deletePackage.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
            แพ็กเกจบริการ
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            จัดการแพ็กเกจราคาสำหรับบริการถ่ายภาพ
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => handleOpenDialog()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              เพิ่มแพ็กเกจ
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อแพ็กเกจ *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น แพ็กเกจงานแต่งงาน"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">ราคา (฿) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">ประเภทงาน</Label>
                <Select
                  value={formData.job_type || "none"}
                  onValueChange={(value) => setFormData({ ...formData, job_type: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทงาน (ไม่บังคับ)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุ</SelectItem>
                    {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {JOB_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="รายละเอียดบริการที่รวมในแพ็กเกจ..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">เปิดใช้งาน</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={createPackage.isPending || updatePackage.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                >
                  {(createPackage.isPending || updatePackage.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingPackage ? 'บันทึก' : 'เพิ่มแพ็กเกจ'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {packages && packages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 ${!pkg.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {pkg.name}
                </h3>
                <div className="flex gap-1">
                  <button
                    className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                    onClick={() => handleOpenDialog(pkg)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded-lg text-red-400 ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                    onClick={() => setDeleteConfirmId(pkg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-2xl font-bold text-emerald-400 mb-2">
                ฿{pkg.price.toLocaleString()}
              </p>

              {pkg.job_type && (
                <p className={`text-sm mb-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                  ประเภท: {JOB_TYPE_LABELS[pkg.job_type as JobType]}
                </p>
              )}

              {pkg.description && (
                <p className={`text-sm whitespace-pre-line ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  {pkg.description}
                </p>
              )}

              {!pkg.is_active && (
                <p className={`text-xs mt-2 italic ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  ปิดใช้งาน
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-12 text-center`}>
          <PackageIcon className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
            ยังไม่มีแพ็กเกจ
          </h3>
          <p className={`mb-4 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            สร้างแพ็กเกจบริการเพื่อใช้ในการเสนอราคาและการจอง
          </p>
          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mx-auto"
          >
            <Plus className="w-4 h-4" />
            เพิ่มแพ็กเกจแรก
          </button>
        </div>
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบแพ็กเกจนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
