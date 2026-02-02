import { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useDeliveryGalleries, useCreateDeliveryGallery, useDeleteDeliveryGallery } from '@/hooks/useDeliveryGallery';
import { useBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, FolderOpen, Trash2, ExternalLink, Calendar, Image, Eye, Copy, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

// IMPORTANT:
// - The editor domain (lovableproject.com) is not accessible to customers.
// - For pre-publish testing, share links should use the Preview URL (id-preview--*.lovable.app).
const PUBLIC_PREVIEW_ORIGIN = 'https://id-preview--81ed6ab9-49d8-4e47-8152-992a7126d3e3.lovable.app';

export default function DeliveryGalleries() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: galleries, isLoading } = useDeliveryGalleries();
  const { data: bookings } = useBookings();
  const createGallery = useCreateDeliveryGallery();
  const deleteGallery = useDeleteDeliveryGallery();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newGalleryData, setNewGalleryData] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    description: '',
    booking_id: '',
    expires_days: '30',
  });

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

  const handleCreateGallery = async () => {
    if (!newGalleryData.title || !newGalleryData.client_name) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const expiresAt = newGalleryData.expires_days !== 'never' 
      ? addDays(new Date(), parseInt(newGalleryData.expires_days)).toISOString()
      : undefined;

    const result = await createGallery.mutateAsync({
      title: newGalleryData.title,
      client_name: newGalleryData.client_name,
      client_email: newGalleryData.client_email || undefined,
      client_phone: newGalleryData.client_phone || undefined,
      description: newGalleryData.description || undefined,
      booking_id: newGalleryData.booking_id || undefined,
      expires_at: expiresAt,
    });

    setIsCreateDialogOpen(false);
    setNewGalleryData({
      title: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      description: '',
      booking_id: '',
      expires_days: '30',
    });

    // Navigate to the new gallery
    navigate(`/deliveries/${result.id}`);
  };

  const handleBookingSelect = (bookingId: string) => {
    const booking = bookings?.find((b) => b.id === bookingId);
    if (booking) {
      setNewGalleryData({
        ...newGalleryData,
        booking_id: bookingId,
        client_name: booking.client_name,
        client_email: booking.client_email || '',
        client_phone: booking.client_phone || '',
        title: `ส่งงาน - ${booking.client_name}`,
      });
    }
  };

  const handleCopyLink = (gallery: any) => {
    const baseUrl = window.location.origin.includes('lovableproject.com')
      ? PUBLIC_PREVIEW_ORIGIN
      : window.location.origin;
    const url = `${baseUrl}/delivery/${gallery.access_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(gallery.id);
    toast.success('คัดลอกลิงก์แล้ว');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const completedBookings = bookings?.filter((b) => b.status === 'completed' || b.status === 'booked');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-semibold">ส่งงานลูกค้า</h1>
            <p className="text-muted-foreground">อัปโหลดรูปภาพและส่งลิงก์ให้ลูกค้าดาวน์โหลด</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            สร้างแกลเลอรี่ใหม่
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 w-32 bg-muted rounded"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : galleries && galleries.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery: any) => {
              const isExpired = gallery.expires_at && new Date(gallery.expires_at) < new Date();
              
              return (
                <Card key={gallery.id} className="group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FolderOpen className="w-5 h-5 text-muted-foreground" />
                          {gallery.title}
                        </CardTitle>
                        <CardDescription>{gallery.client_name}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {!gallery.is_active && <Badge variant="secondary">ปิด</Badge>}
                        {isExpired && <Badge variant="destructive">หมดอายุ</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {gallery.download_count}
                      </span>
                      {gallery.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(gallery.expires_at), 'd MMM yy', { locale: th })}
                        </span>
                      )}
                    </div>

                    {gallery.booking && (
                      <Badge variant="outline" className="text-xs">
                        เชื่อมกับ: {gallery.booking.client_name}
                      </Badge>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/deliveries/${gallery.id}`}>
                          <Image className="w-4 h-4 mr-1" />
                          จัดการ
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleCopyLink(gallery)}
                      >
                        {copiedId === gallery.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ลบแกลเลอรี่</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ว่าต้องการลบแกลเลอรี่ "{gallery.title}"? รูปภาพทั้งหมดจะถูกลบด้วย
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGallery.mutate(gallery.id)}>
                              ลบ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">ยังไม่มีแกลเลอรี่</h2>
              <p className="text-muted-foreground mb-6">
                สร้างแกลเลอรี่ใหม่เพื่อส่งรูปภาพให้ลูกค้า
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                สร้างแกลเลอรี่ใหม่
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>สร้างแกลเลอรี่ส่งงานใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลแกลเลอรี่เพื่อส่งรูปภาพให้ลูกค้า
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Link with Booking */}
            {completedBookings && completedBookings.length > 0 && (
              <div>
                <Label>เชื่อมกับ Booking (ไม่บังคับ)</Label>
                <Select
                  value={newGalleryData.booking_id || 'none'}
                  onValueChange={(v) => v === 'none' ? setNewGalleryData({ ...newGalleryData, booking_id: '' }) : handleBookingSelect(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Booking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่เชื่อม</SelectItem>
                    {completedBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.client_name} - {format(new Date(booking.event_date), 'd MMM yyyy', { locale: th })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="title">ชื่อแกลเลอรี่ *</Label>
              <Input
                id="title"
                value={newGalleryData.title}
                onChange={(e) => setNewGalleryData({ ...newGalleryData, title: e.target.value })}
                placeholder="เช่น ส่งงาน - คุณ A"
              />
            </div>

            <div>
              <Label htmlFor="client_name">ชื่อลูกค้า *</Label>
              <Input
                id="client_name"
                value={newGalleryData.client_name}
                onChange={(e) => setNewGalleryData({ ...newGalleryData, client_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_email">อีเมล</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={newGalleryData.client_email}
                  onChange={(e) => setNewGalleryData({ ...newGalleryData, client_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="client_phone">เบอร์โทร</Label>
                <Input
                  id="client_phone"
                  value={newGalleryData.client_phone}
                  onChange={(e) => setNewGalleryData({ ...newGalleryData, client_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={newGalleryData.description}
                onChange={(e) => setNewGalleryData({ ...newGalleryData, description: e.target.value })}
                placeholder="ข้อความถึงลูกค้า"
                rows={2}
              />
            </div>

            <div>
              <Label>อายุลิงก์</Label>
              <Select
                value={newGalleryData.expires_days}
                onValueChange={(v) => setNewGalleryData({ ...newGalleryData, expires_days: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 วัน</SelectItem>
                  <SelectItem value="14">14 วัน</SelectItem>
                  <SelectItem value="30">30 วัน</SelectItem>
                  <SelectItem value="60">60 วัน</SelectItem>
                  <SelectItem value="90">90 วัน</SelectItem>
                  <SelectItem value="never">ไม่มีวันหมดอายุ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateGallery} disabled={createGallery.isPending}>
              {createGallery.isPending ? 'กำลังสร้าง...' : 'สร้างแกลเลอรี่'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
