import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Package } from '@/types/package';
import { JOB_TYPE_LABELS, JobType } from '@/types/booking';
import { Plus, Pencil, Trash2, Loader2, Package as PackageIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="page-header mb-0">
            <h1 className="page-title">แพ็กเกจบริการ</h1>
            <p className="page-subtitle">จัดการแพ็กเกจราคาสำหรับบริการถ่ายภาพ</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มแพ็กเกจ
              </Button>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPackage.isPending || updatePackage.isPending}
                  >
                    {(createPackage.isPending || updatePackage.isPending) ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {editingPackage ? 'บันทึก' : 'เพิ่มแพ็กเกจ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {packages && packages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`relative ${!pkg.is_active ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium">{pkg.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(pkg)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">
                    ฿{pkg.price.toLocaleString()}
                  </p>
                  {pkg.job_type && (
                    <p className="text-sm text-muted-foreground mb-2">
                      ประเภท: {JOB_TYPE_LABELS[pkg.job_type as JobType]}
                    </p>
                  )}
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {pkg.description}
                    </p>
                  )}
                  {!pkg.is_active && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      ปิดใช้งาน
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <PackageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มีแพ็กเกจ</h3>
            <p className="text-muted-foreground mb-4">
              สร้างแพ็กเกจบริการเพื่อใช้ในการเสนอราคาและการจอง
            </p>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มแพ็กเกจแรก
            </Button>
          </Card>
        )}
      </main>

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
    </div>
  );
}
