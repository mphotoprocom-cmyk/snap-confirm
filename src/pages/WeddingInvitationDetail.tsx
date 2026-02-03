import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft,
  Heart,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Users,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useWeddingInvitation,
  useUpdateInvitation,
  useInvitationRsvps,
  useInvitationImages,
  useAddInvitationImage,
  useDeleteInvitationImage,
} from '@/hooks/useWeddingInvitations';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { TemplateSelector } from '@/components/invitation-templates/TemplateSelector';
import { TemplateType } from '@/components/invitation-templates/types';

export default function WeddingInvitationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: invitation, isLoading } = useWeddingInvitation(id);
  const { data: rsvps } = useInvitationRsvps(id);
  const { data: galleryImages } = useInvitationImages(id);
  const updateInvitation = useUpdateInvitation();
  const addImage = useAddInvitationImage();
  const deleteImage = useDeleteInvitationImage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');

  const [formData, setFormData] = useState({
    groom_name: '',
    bride_name: '',
    event_date: '',
    event_time: '',
    ceremony_time: '',
    reception_time: '',
    venue_name: '',
    venue_address: '',
    google_maps_url: '',
    google_maps_embed_url: '',
    message: '',
    rsvp_enabled: true,
    rsvp_deadline: '',
    theme_color: '#d4af37',
    is_active: true,
  });

  useEffect(() => {
    if (invitation) {
      setFormData({
        groom_name: invitation.groom_name,
        bride_name: invitation.bride_name,
        event_date: invitation.event_date,
        event_time: invitation.event_time || '',
        ceremony_time: invitation.ceremony_time || '',
        reception_time: invitation.reception_time || '',
        venue_name: invitation.venue_name || '',
        venue_address: invitation.venue_address || '',
        google_maps_url: invitation.google_maps_url || '',
        google_maps_embed_url: invitation.google_maps_embed_url || '',
        message: invitation.message || '',
        rsvp_enabled: invitation.rsvp_enabled,
        rsvp_deadline: invitation.rsvp_deadline || '',
        theme_color: invitation.theme_color || '#d4af37',
        is_active: invitation.is_active,
      });
      setSelectedTemplate(invitation.template || 'classic');
    }
  }, [invitation]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!invitation) {
    return (
      <div className="py-8 text-center">
        <p className={isDark ? 'text-white/50' : 'text-gray-500'}>ไม่พบการ์ดเชิญ</p>
        <Link to="/invitations">
          <button className="mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">กลับ</button>
        </Link>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/invitation/${invitation.access_token}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('คัดลอกลิงก์แล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await updateInvitation.mutateAsync({
      id: invitation.id,
      ...formData,
      event_time: formData.event_time || null,
      ceremony_time: formData.ceremony_time || null,
      reception_time: formData.reception_time || null,
      venue_name: formData.venue_name || null,
      venue_address: formData.venue_address || null,
      google_maps_url: formData.google_maps_url || null,
      google_maps_embed_url: formData.google_maps_embed_url || null,
      message: formData.message || null,
      rsvp_deadline: formData.rsvp_deadline || null,
    });
  };

  const handleTemplateChange = async (template: TemplateType) => {
    setSelectedTemplate(template);
    await updateInvitation.mutateAsync({
      id: invitation.id,
      template,
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `invitation/${invitation.id}`);

      const response = await supabase.functions.invoke('r2-storage?action=upload', {
        body: formData,
      });

      if (response.error) throw response.error;

      await updateInvitation.mutateAsync({
        id: invitation.id,
        cover_image_url: response.data.url,
      });
    } catch (error: any) {
      toast.error('ไม่สามารถอัปโหลดได้: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCover = async () => {
    await updateInvitation.mutateAsync({
      id: invitation.id,
      cover_image_url: null,
    });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `invitation/${invitation.id}/gallery`);

        const response = await supabase.functions.invoke('r2-storage?action=upload', {
          body: formData,
        });

        if (response.error) throw response.error;

        await addImage.mutateAsync({
          invitation_id: invitation.id,
          user_id: user.id,
          image_url: response.data.url,
          sort_order: (galleryImages?.length || 0) + i,
        });
      }
      toast.success(`อัปโหลด ${files.length} รูปสำเร็จ`);
    } catch (error: any) {
      toast.error('ไม่สามารถอัปโหลดได้: ' + error.message);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    await deleteImage.mutateAsync({ id: imageId, invitationId: invitation.id });
  };

  const formatThaiDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear() + 543;
    return `${format(d, 'd MMMM', { locale: th })} ${year}`;
  };

  const attendingCount = rsvps?.filter(r => r.attending).reduce((sum, r) => sum + r.guest_count, 0) || 0;
  const notAttendingCount = rsvps?.filter(r => !r.attending).length || 0;

  return (
    <>
      <div className="mb-6">
        <Link to="/invitations">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {invitation.groom_name} & {invitation.bride_name}
                </h1>
                <p className={isDark ? 'text-white/50' : 'text-gray-500'}>{formatThaiDate(invitation.event_date)}</p>
              </div>
            </div>
            <Badge variant={invitation.is_active ? 'default' : 'secondary'}>
              {invitation.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </Badge>
          </div>

            <Tabs defaultValue="template" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="template">เทมเพลต</TabsTrigger>
                <TabsTrigger value="details">รายละเอียด</TabsTrigger>
                <TabsTrigger value="gallery">แกลเลอรี่ ({galleryImages?.length || 0})</TabsTrigger>
                <TabsTrigger value="rsvp">RSVP ({rsvps?.length || 0})</TabsTrigger>
              </TabsList>

              {/* Template Selection Tab */}
              <TabsContent value="template" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">เลือกเทมเพลต</CardTitle>
                    <CardDescription>
                      เลือกดีไซน์การ์ดเชิญที่ต้องการ แต่ละแบบมีสไตล์เฉพาะตัว
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TemplateSelector
                      value={selectedTemplate}
                      onChange={handleTemplateChange}
                    />
                  </CardContent>
                </Card>

                {/* Cover Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ภาพหน้าปก</CardTitle>
                    <CardDescription>ภาพหลักที่จะแสดงบนการ์ดเชิญ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {invitation.cover_image_url ? (
                      <div className="relative">
                        <img
                          src={invitation.cover_image_url}
                          alt="Cover"
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleDeleteCover}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                          {isUploading ? (
                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดภาพหน้าปก</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </CardContent>
                </Card>

                {/* Theme Color */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">สีธีม</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Input
                        type="color"
                        value={formData.theme_color}
                        onChange={e => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">
                        สีหลักที่จะใช้ในการ์ดเชิญ (บางเทมเพลตใช้สีคงที่)
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateInvitation.mutateAsync({ id: invitation.id, theme_color: formData.theme_color })}
                      >
                        บันทึกสี
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">การตั้งค่า</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>เปิดให้แขกตอบรับ (RSVP)</Label>
                        <p className="text-sm text-muted-foreground">แขกสามารถกดปุ่มตอบรับ</p>
                      </div>
                      <Switch
                        checked={formData.rsvp_enabled}
                        onCheckedChange={checked => {
                          setFormData(prev => ({ ...prev, rsvp_enabled: checked }));
                          updateInvitation.mutateAsync({ id: invitation.id, rsvp_enabled: checked });
                        }}
                      />
                    </div>

                    {formData.rsvp_enabled && (
                      <div className="space-y-2">
                        <Label>กำหนดตอบรับภายใน</Label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={formData.rsvp_deadline}
                            onChange={e => setFormData(prev => ({ ...prev, rsvp_deadline: e.target.value }))}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateInvitation.mutateAsync({ id: invitation.id, rsvp_deadline: formData.rsvp_deadline || null })}
                          >
                            บันทึก
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <Label>เปิดใช้งานการ์ด</Label>
                        <p className="text-sm text-muted-foreground">
                          ปิดเพื่อไม่ให้แขกเข้าดูการ์ดได้
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={checked => {
                          setFormData(prev => ({ ...prev, is_active: checked }));
                          updateInvitation.mutateAsync({ id: invitation.id, is_active: checked });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Couple Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ข้อมูลคู่บ่าวสาว</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ชื่อเจ้าบ่าว</Label>
                        <Input
                          value={formData.groom_name}
                          onChange={e => setFormData(prev => ({ ...prev, groom_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ชื่อเจ้าสาว</Label>
                        <Input
                          value={formData.bride_name}
                          onChange={e => setFormData(prev => ({ ...prev, bride_name: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">รายละเอียดงาน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>วันที่จัดงาน</Label>
                        <Input
                          type="date"
                          value={formData.event_date}
                          onChange={e => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>เวลางาน</Label>
                        <Input
                          type="time"
                          value={formData.event_time}
                          onChange={e => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>เวลาพิธีการ</Label>
                        <Input
                          type="time"
                          value={formData.ceremony_time}
                          onChange={e => setFormData(prev => ({ ...prev, ceremony_time: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>เวลาเลี้ยงรับรอง</Label>
                        <Input
                          type="time"
                          value={formData.reception_time}
                          onChange={e => setFormData(prev => ({ ...prev, reception_time: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Venue */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">สถานที่จัดงาน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>ชื่อสถานที่</Label>
                      <Input
                        value={formData.venue_name}
                        onChange={e => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                        placeholder="เช่น โรงแรม ABC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ที่อยู่</Label>
                      <Textarea
                        value={formData.venue_address}
                        onChange={e => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ลิงก์ Google Maps</Label>
                      <Input
                        value={formData.google_maps_url}
                        onChange={e => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Embed URL (สำหรับแสดงแผนที่)</Label>
                      <Input
                        value={formData.google_maps_embed_url}
                        onChange={e => setFormData(prev => ({ ...prev, google_maps_embed_url: e.target.value }))}
                        placeholder="https://www.google.com/maps/embed?pb=..."
                      />
                      <p className="text-xs text-muted-foreground">
                        คัดลอก src จาก Google Maps Embed {"<iframe>"} tag
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Message */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ข้อความเชิญ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      placeholder="ข้อความเชิญที่จะแสดงบนการ์ด..."
                    />
                  </CardContent>
                </Card>

                <Button onClick={handleSave} disabled={updateInvitation.isPending}>
                  {updateInvitation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      แกลเลอรี่รูปภาพ
                    </CardTitle>
                    <CardDescription>
                      เพิ่มรูปภาพคู่บ่าวสาวเพื่อแสดงในหน้าการ์ดเชิญ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <label className="block">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                        {isUploadingGallery ? (
                          <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">คลิกเพื่อเพิ่มรูปภาพ (เลือกได้หลายรูป)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="hidden"
                        disabled={isUploadingGallery}
                      />
                    </label>

                    {/* Gallery Grid */}
                    {galleryImages && galleryImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((img) => (
                          <div key={img.id} className="relative group aspect-square">
                            <img
                              src={img.image_url}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteGalleryImage(img.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!galleryImages || galleryImages.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>ยังไม่มีรูปภาพในแกลเลอรี่</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* RSVP Tab */}
              <TabsContent value="rsvp" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{attendingCount}</p>
                        <p className="text-sm text-muted-foreground">คนมาร่วมงาน</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{notAttendingCount}</p>
                        <p className="text-sm text-muted-foreground">ไม่มา</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {rsvps && rsvps.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ชื่อแขก</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead>จำนวน</TableHead>
                            <TableHead>ข้อความ</TableHead>
                            <TableHead>วันที่ตอบ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rsvps.map(rsvp => (
                            <TableRow key={rsvp.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{rsvp.guest_name}</p>
                                  {rsvp.guest_phone && (
                                    <p className="text-xs text-muted-foreground">{rsvp.guest_phone}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={rsvp.attending ? 'default' : 'secondary'}>
                                  {rsvp.attending ? 'มา' : 'ไม่มา'}
                                </Badge>
                              </TableCell>
                              <TableCell>{rsvp.guest_count} คน</TableCell>
                              <TableCell className="max-w-32 truncate">
                                {rsvp.message || '-'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(rsvp.created_at), 'd MMM yy', { locale: th })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">ยังไม่มีการตอบรับ</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ลิงก์แชร์</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    เปิดดูการ์ด
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">สถิติ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    เข้าชม
                  </span>
                  <span className="font-medium">{invitation.view_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    ตอบรับทั้งหมด
                  </span>
                  <span className="font-medium">{rsvps?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    รูปในแกลเลอรี่
                  </span>
                  <span className="font-medium">{galleryImages?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">เทมเพลตที่ใช้</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-sm">
                  {selectedTemplate === 'classic' && 'Classic Elegance'}
                  {selectedTemplate === 'modern' && 'Modern Luxe'}
                  {selectedTemplate === 'floral' && 'Garden Romance'}
                  {selectedTemplate === 'minimal' && 'Pure Minimalist'}
                  {selectedTemplate === 'luxury' && 'Royal Opulence'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
