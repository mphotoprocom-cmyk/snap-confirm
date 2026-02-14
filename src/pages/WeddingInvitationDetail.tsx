import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  TimelineEvent,
  AccommodationLink,
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
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('classic');

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
      <div className="py-8 text-center text-muted-foreground">
        ไม่พบการ์ดเชิญ
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

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Not authenticated');

      for (let i = 0; i < files.length; i++) {
        const form = new FormData();
        form.append('file', files[i]);
        form.append('folder', `invitation/${invitation.id}/gallery`);

        const res = await supabase.functions.invoke(
          'r2-storage?action=upload',
          { body: form }
        );

        if (res.error) throw res.error;

        await addImage.mutateAsync({
          invitation_id: invitation.id,
          user_id: user.id,
          image_url: res.data.url,
          sort_order: (galleryImages?.length || 0) + i,
        });
      }

      toast.success('อัปโหลดรูปสำเร็จ');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const attendingCount =
    rsvps?.filter(r => r.attending).reduce(
      (sum, r) => sum + r.guest_count,
      0
    ) || 0;

  const notAttendingCount =
    rsvps?.filter(r => !r.attending).length || 0;

  return (
    <div>
      {/* Back */}
      <div className="mb-6">
        <Link to="/invitations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </Link>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* MAIN */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Heart className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold">
                  {invitation.groom_name} & {invitation.bride_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(invitation.event_date), 'd MMMM yyyy', {
                    locale: th,
                  })}
                </p>
              </div>
            </div>
            <Badge>
              {invitation.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </Badge>
          </div>

          <Tabs defaultValue="template">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="template">เทมเพลต</TabsTrigger>
              <TabsTrigger value="details">รายละเอียด</TabsTrigger>
              <TabsTrigger value="extra">เพิ่มเติม</TabsTrigger>
              <TabsTrigger value="gallery">แกลเลอรี่</TabsTrigger>
              <TabsTrigger value="rsvp">RSVP</TabsTrigger>
            </TabsList>

            <TabsContent value="template">
              <Card>
                <CardContent className="pt-6">
                  <TemplateSelector
                    value={selectedTemplate}
                    onChange={async t => {
                      setSelectedTemplate(t);
                      await updateInvitation.mutateAsync({
                        id: invitation.id,
                        template: t,
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
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
                  } as any);
                  toast.success('บันทึกสำเร็จ');
                }}
                className="space-y-6"
              >
                {/* Couple Info */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">ข้อมูลคู่บ่าวสาว</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="groom_name">ชื่อเจ้าบ่าว *</Label>
                        <Input id="groom_name" value={formData.groom_name} onChange={e => setFormData(prev => ({ ...prev, groom_name: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bride_name">ชื่อเจ้าสาว *</Label>
                        <Input id="bride_name" value={formData.bride_name} onChange={e => setFormData(prev => ({ ...prev, bride_name: e.target.value }))} required />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">รายละเอียดงาน</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event_date">วันที่จัดงาน *</Label>
                        <Input id="event_date" type="date" value={formData.event_date} onChange={e => setFormData(prev => ({ ...prev, event_date: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event_time">เวลางาน</Label>
                        <Input id="event_time" type="time" value={formData.event_time} onChange={e => setFormData(prev => ({ ...prev, event_time: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ceremony_time">เวลาพิธีการ</Label>
                        <Input id="ceremony_time" type="time" value={formData.ceremony_time} onChange={e => setFormData(prev => ({ ...prev, ceremony_time: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reception_time">เวลาเลี้ยงรับรอง</Label>
                        <Input id="reception_time" type="time" value={formData.reception_time} onChange={e => setFormData(prev => ({ ...prev, reception_time: e.target.value }))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Venue */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">สถานที่จัดงาน</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue_name">ชื่อสถานที่</Label>
                      <Input id="venue_name" value={formData.venue_name} onChange={e => setFormData(prev => ({ ...prev, venue_name: e.target.value }))} placeholder="เช่น โรงแรม ABC" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue_address">ที่อยู่</Label>
                      <Textarea id="venue_address" value={formData.venue_address} onChange={e => setFormData(prev => ({ ...prev, venue_address: e.target.value }))} placeholder="ที่อยู่เต็มของสถานที่จัดงาน" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="google_maps_url">ลิงก์ Google Maps</Label>
                      <Input id="google_maps_url" value={formData.google_maps_url} onChange={e => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))} placeholder="https://maps.google.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="google_maps_embed_url">Google Maps Embed URL</Label>
                      <Input id="google_maps_embed_url" value={formData.google_maps_embed_url} onChange={e => setFormData(prev => ({ ...prev, google_maps_embed_url: e.target.value }))} placeholder="https://www.google.com/maps/embed?..." />
                    </div>
                  </CardContent>
                </Card>

                {/* Message */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">ข้อความเชิญ</CardTitle></CardHeader>
                  <CardContent>
                    <Textarea value={formData.message} onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))} placeholder="ด้วยความยินดียิ่ง ขอเชิญท่านร่วมเป็นเกียรติ..." rows={4} />
                  </CardContent>
                </Card>

                {/* RSVP */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">การตอบรับ (RSVP)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>เปิดให้แขกตอบรับ</Label>
                        <p className="text-sm text-muted-foreground">แขกสามารถกดปุ่มตอบรับว่าจะมาหรือไม่มา</p>
                      </div>
                      <Switch checked={formData.rsvp_enabled} onCheckedChange={checked => setFormData(prev => ({ ...prev, rsvp_enabled: checked }))} />
                    </div>
                    {formData.rsvp_enabled && (
                      <div className="space-y-2">
                        <Label htmlFor="rsvp_deadline">กำหนดตอบรับภายใน</Label>
                        <Input id="rsvp_deadline" type="date" value={formData.rsvp_deadline} onChange={e => setFormData(prev => ({ ...prev, rsvp_deadline: e.target.value }))} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Theme & Status */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">ตั้งค่า</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input type="color" value={formData.theme_color} onChange={e => setFormData(prev => ({ ...prev, theme_color: e.target.value }))} className="w-16 h-10 p-1 cursor-pointer" />
                      <span className="text-sm text-muted-foreground">สีหลักที่จะใช้ในการ์ดเชิญ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>เปิดใช้งานการ์ด</Label>
                        <p className="text-sm text-muted-foreground">ปิดเพื่อซ่อนการ์ดจากผู้เข้าชม</p>
                      </div>
                      <Switch checked={formData.is_active} onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))} />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={updateInvitation.isPending}>
                  {updateInvitation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  บันทึกข้อมูล
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="extra">
              <div className="space-y-6">
                {/* Timeline Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">กำหนดการ (Timeline)</CardTitle>
                    <CardDescription>เพิ่มรายการกำหนดการวันงาน เช่น พิธี, ค็อกเทล, อาหาร</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(invitation.timeline_events as TimelineEvent[] || []).map((event: TimelineEvent, i: number) => (
                      <div key={i} className="flex gap-2 items-end">
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">เวลา</Label>
                          <Input
                            value={event.time}
                            onChange={e => {
                              const events = [...(invitation.timeline_events as TimelineEvent[] || [])];
                              events[i] = { ...events[i], time: e.target.value };
                              updateInvitation.mutate({ id: invitation.id, timeline_events: events } as any);
                            }}
                            placeholder="17:00"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">รายการ</Label>
                          <Input
                            value={event.title}
                            onChange={e => {
                              const events = [...(invitation.timeline_events as TimelineEvent[] || [])];
                              events[i] = { ...events[i], title: e.target.value };
                              updateInvitation.mutate({ id: invitation.id, timeline_events: events } as any);
                            }}
                            placeholder="พิธีมงคลสมรส"
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">ไอคอน</Label>
                          <select
                            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={event.icon || 'default'}
                            onChange={e => {
                              const events = [...(invitation.timeline_events as TimelineEvent[] || [])];
                              events[i] = { ...events[i], icon: e.target.value };
                              updateInvitation.mutate({ id: invitation.id, timeline_events: events } as any);
                            }}
                          >
                            <option value="ceremony">💒 พิธี</option>
                            <option value="cocktail">🍷 ค็อกเทล</option>
                            <option value="photo">📸 ถ่ายรูป</option>
                            <option value="dinner">🍽️ อาหาร</option>
                            <option value="party">💃 ปาร์ตี้</option>
                            <option value="default">⏰ ทั่วไป</option>
                          </select>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            const events = (invitation.timeline_events as TimelineEvent[] || []).filter((_: any, idx: number) => idx !== i);
                            updateInvitation.mutate({ id: invitation.id, timeline_events: events } as any);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {(invitation.timeline_events as TimelineEvent[] || []).length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const defaults: TimelineEvent[] = [
                            { time: '09:00', title: 'ต้อนรับแขก / ลงทะเบียน', icon: 'default' },
                            { time: '09:30', title: 'พิธีหมั้น', icon: 'ceremony' },
                            { time: '10:30', title: 'พิธีรดน้ำสังข์', icon: 'ceremony' },
                            { time: '11:30', title: 'ถ่ายภาพหมู่ครอบครัว', icon: 'photo' },
                            { time: '12:00', title: 'ร่วมรับประทานอาหารกลางวัน', icon: 'dinner' },
                            { time: '17:00', title: 'ค็อกเทล ต้อนรับแขกงานเลี้ยง', icon: 'cocktail' },
                            { time: '18:00', title: 'พิธีแต่งงาน', icon: 'ceremony' },
                            { time: '18:30', title: 'เปิดตัวคู่บ่าวสาว & First Dance', icon: 'party' },
                            { time: '19:00', title: 'ร่วมรับประทานอาหารเย็น', icon: 'dinner' },
                            { time: '20:00', title: 'ตัดเค้ก & เปิดแชมเปญ', icon: 'party' },
                            { time: '21:00', title: 'After Party', icon: 'party' },
                          ];
                          updateInvitation.mutate({ id: invitation.id, timeline_events: defaults } as any);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" /> เพิ่มกำหนดการเริ่มต้น
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const events = [...(invitation.timeline_events as TimelineEvent[] || []), { time: '', title: '', icon: 'default' }];
                        updateInvitation.mutate({ id: invitation.id, timeline_events: events } as any);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> เพิ่มรายการ
                    </Button>
                  </CardContent>
                </Card>

                {/* Dress Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dress Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>คำอธิบาย</Label>
                      <Textarea
                        value={invitation.dress_code || ''}
                        onChange={e => updateInvitation.mutate({ id: invitation.id, dress_code: e.target.value || null } as any)}
                        placeholder="เช่น Semi-Formal, กรุณาแต่งกายตามโทนสีที่กำหนด"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>โทนสี (คลิกเพื่อเพิ่ม/ลบ)</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(invitation.dress_code_colors as string[] || []).map((color: string, i: number) => (
                          <button
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:opacity-70"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              const colors = (invitation.dress_code_colors as string[] || []).filter((_: string, idx: number) => idx !== i);
                              updateInvitation.mutate({ id: invitation.id, dress_code_colors: colors } as any);
                            }}
                            title="คลิกเพื่อลบ"
                          />
                        ))}
                        <Input
                          type="color"
                          className="w-8 h-8 p-0 cursor-pointer border-dashed"
                          onChange={e => {
                            const colors = [...(invitation.dress_code_colors as string[] || []), e.target.value];
                            updateInvitation.mutate({ id: invitation.id, dress_code_colors: colors } as any);
                          }}
                          title="เพิ่มสี"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Accommodation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ที่พัก (Accommodation)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={invitation.accommodation_info || ''}
                      onChange={e => updateInvitation.mutate({ id: invitation.id, accommodation_info: e.target.value || null } as any)}
                      placeholder="ข้อมูลที่พักใกล้สถานที่จัดงาน"
                      rows={3}
                    />
                    <div className="space-y-2">
                      <Label>ลิงก์จองที่พัก</Label>
                      {(invitation.accommodation_links as AccommodationLink[] || []).map((link: AccommodationLink, i: number) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={link.name}
                            placeholder="ชื่อโรงแรม"
                            onChange={e => {
                              const links = [...(invitation.accommodation_links as AccommodationLink[] || [])];
                              links[i] = { ...links[i], name: e.target.value };
                              updateInvitation.mutate({ id: invitation.id, accommodation_links: links } as any);
                            }}
                          />
                          <Input
                            value={link.url}
                            placeholder="https://..."
                            onChange={e => {
                              const links = [...(invitation.accommodation_links as AccommodationLink[] || [])];
                              links[i] = { ...links[i], url: e.target.value };
                              updateInvitation.mutate({ id: invitation.id, accommodation_links: links } as any);
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const links = (invitation.accommodation_links as AccommodationLink[] || []).filter((_: any, idx: number) => idx !== i);
                              updateInvitation.mutate({ id: invitation.id, accommodation_links: links } as any);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const links = [...(invitation.accommodation_links as AccommodationLink[] || []), { name: '', url: '' }];
                          updateInvitation.mutate({ id: invitation.id, accommodation_links: links } as any);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" /> เพิ่มที่พัก
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Registry */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wedding Registry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>คำอธิบาย</Label>
                      <Textarea
                        value={invitation.registry_info || ''}
                        onChange={e => updateInvitation.mutate({ id: invitation.id, registry_info: e.target.value || null } as any)}
                        placeholder="ข้อมูลเกี่ยวกับของขวัญ/registry"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ลิงก์ Registry</Label>
                      <Input
                        value={invitation.registry_url || ''}
                        onChange={e => updateInvitation.mutate({ id: invitation.id, registry_url: e.target.value || null } as any)}
                        placeholder="https://..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section Backgrounds */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">รูปพื้นหลังแต่ละส่วน</CardTitle>
                    <CardDescription>อัปโหลดรูปพื้นหลังและปรับความโปร่งใสสำหรับแต่ละส่วนของการ์ดเชิญ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'hero', label: 'ส่วนหัว (Hero)' },
                      { key: 'countdown', label: 'นับถอยหลัง (Countdown)' },
                      { key: 'venue', label: 'สถานที่ (Venue)' },
                      { key: 'timeline', label: 'กำหนดการ (Timeline)' },
                      { key: 'details', label: 'รายละเอียด (Details)' },
                      { key: 'message', label: 'ข้อความ (Message)' },
                      { key: 'registry', label: 'ของขวัญ (Registry)' },
                      { key: 'rsvp', label: 'ตอบรับ (RSVP)' },
                      { key: 'footer', label: 'ท้ายการ์ด (Footer)' },
                    ].map(section => {
                      const backgrounds = (invitation.section_backgrounds || {}) as Record<string, { image_url: string; opacity: number }>;
                      const bg = backgrounds[section.key];
                      return (
                        <div key={section.key} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium text-sm">{section.label}</Label>
                            {bg?.image_url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 h-7"
                                onClick={() => {
                                  const updated = { ...backgrounds };
                                  delete updated[section.key];
                                  updateInvitation.mutate({ id: invitation.id, section_backgrounds: updated } as any);
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-1" /> ลบ
                              </Button>
                            )}
                          </div>
                          {bg?.image_url ? (
                            <div className="space-y-2">
                              <div className="relative h-20 rounded overflow-hidden">
                                <img src={bg.image_url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-white" style={{ opacity: 1 - (bg.opacity ?? 0.3) }} />
                              </div>
                              <div className="flex items-center gap-3">
                                <Label className="text-xs whitespace-nowrap">ความโปร่งใส: {Math.round((bg.opacity ?? 0.3) * 100)}%</Label>
                                <Slider
                                  value={[Math.round((bg.opacity ?? 0.3) * 100)]}
                                  min={5}
                                  max={100}
                                  step={5}
                                  onValueCommit={(val) => {
                                    const updated = { ...backgrounds, [section.key]: { ...bg, opacity: val[0] / 100 } };
                                    updateInvitation.mutate({ id: invitation.id, section_backgrounds: updated } as any);
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          ) : (
                            <label className="block">
                              <div className="border border-dashed rounded p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                <ImageIcon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">คลิกเพื่ออัปโหลดรูปพื้นหลัง</p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const form = new FormData();
                                    form.append('file', file);
                                    form.append('folder', `invitation/${invitation.id}/backgrounds`);
                                    const res = await supabase.functions.invoke('r2-storage?action=upload', { body: form });
                                    if (res.error) throw res.error;
                                    const updated = { ...backgrounds, [section.key]: { image_url: res.data.url, opacity: 0.3 } };
                                    updateInvitation.mutate({ id: invitation.id, section_backgrounds: updated } as any);
                                    toast.success('อัปโหลดสำเร็จ');
                                  } catch (err: any) {
                                    toast.error('อัปโหลดไม่สำเร็จ: ' + err.message);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ข้อมูลติดต่อ</CardTitle>
                    <CardDescription>แสดงในการ์ดเชิญให้แขกติดต่อ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>อีเมล</Label>
                        <Input
                          value={invitation.contact_email || ''}
                          onChange={e => updateInvitation.mutate({ id: invitation.id, contact_email: e.target.value || null } as any)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>เบอร์โทร</Label>
                        <Input
                          value={invitation.contact_phone || ''}
                          onChange={e => updateInvitation.mutate({ id: invitation.id, contact_phone: e.target.value || null } as any)}
                          placeholder="08x-xxx-xxxx"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>แกลเลอรี่</CardTitle>
                  <CardDescription>
                    รูปภาพคู่บ่าวสาว
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="block">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
                      {isUploadingGallery ? (
                        <Loader2 className="mx-auto animate-spin" />
                      ) : (
                        <>
                          <Plus className="mx-auto mb-2" />
                          <p>คลิกเพื่อเพิ่มรูป</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={handleGalleryUpload}
                    />
                  </label>

                  {galleryImages && galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map(img => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.image_url}
                            className="rounded-lg object-cover"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              deleteImage.mutate({
                                id: img.id,
                                invitationId: invitation.id,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      ยังไม่มีรูป
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rsvp">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {attendingCount}
                    </p>
                    <p className="text-sm">มาร่วมงาน</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {notAttendingCount}
                    </p>
                    <p className="text-sm">ไม่มา</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* SIDEBAR */}
        <div className="lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ลิงก์แชร์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button size="icon" onClick={handleCopyLink}>
                  {copied ? <Check /> : <Copy />}
                </Button>
              </div>
              <Button asChild variant="outline">
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  เปิดดูการ์ด
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>สถิติ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  เข้าชม
                </span>
                <span>{invitation.view_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  ตอบรับ
                </span>
                <span>{rsvps?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
