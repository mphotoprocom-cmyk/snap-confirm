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

  const formatThaiDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear() + 543;
    return `${format(d, 'd MMMM', { locale: th })} ${year}`;
  };

  const attendingCount =
    rsvps?.filter(r => r.attending).reduce((sum, r) => sum + r.guest_count, 0) || 0;
  const notAttendingCount = rsvps?.filter(r => !r.attending).length || 0;

  return (
    <>
      {/* Back */}
      <div className="mb-6">
        <Link to="/invitations">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        </Link>
      </div>

      {/* MAIN + SIDEBAR */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* MAIN */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {invitation.groom_name} & {invitation.bride_name}
                </h1>
                <p className={isDark ? 'text-white/50' : 'text-gray-500'}>
                  {formatThaiDate(invitation.event_date)}
                </p>
              </div>
            </div>
            <Badge variant={invitation.is_active ? 'default' : 'secondary'}>
              {invitation.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </Badge>
          </div>

          {/* TABS */}
          <Tabs defaultValue="template" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="template">เทมเพลต</TabsTrigger>
              <TabsTrigger value="details">รายละเอียด</TabsTrigger>
              <TabsTrigger value="gallery">แกลเลอรี่</TabsTrigger>
              <TabsTrigger value="rsvp">RSVP</TabsTrigger>
            </TabsList>

            <TabsContent value="template">
              <Card>
                <CardHeader>
                  <CardTitle>เลือกเทมเพลต</CardTitle>
                  <CardDescription>เลือกดีไซน์การ์ดเชิญ</CardDescription>
                </CardHeader>
                <CardContent>
                  <TemplateSelector
                    value={selectedTemplate}
                    onChange={async t => {
                      setSelectedTemplate(t);
                      await updateInvitation.mutateAsync({ id: invitation.id, template: t });
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลคู่บ่าวสาว</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Input
                    value={formData.groom_name}
                    onChange={e => setFormData(p => ({ ...p, groom_name: e.target.value }))}
                  />
                  <Input
                    value={formData.bride_name}
                    onChange={e => setFormData(p => ({ ...p, bride_name: e.target.value }))}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>แกลเลอรี่</CardTitle>
                </CardHeader>
                <CardContent>
                  {galleryImages?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map(img => (
                        <div key={img.id} className="relative">
                          <img src={img.image_url} className="rounded-lg object-cover" />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              deleteImage.mutateAsync({ id: img.id, invitationId: invitation.id })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">ยังไม่มีรูป</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rsvp">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-green-600">{attendingCount}</p>
                    <p className="text-sm text-muted-foreground">มาร่วมงาน</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-red-600">{notAttendingCount}</p>
                    <p className="text-sm text-muted-foreground">ไม่มา</p>
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
                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                  {copied ? <Check /> : <Copy />}
                </Button>
              </div>
              <Button asChild variant="outline" className="w-full">
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
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex gap-2 items-center">
                  <Eye className="w-4 h-4" /> เข้าชม
                </span>
                <span>{invitation.view_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex gap-2 items-center">
                  <Users className="w-4 h-4" /> ตอบรับ
                </span>
                <span>{rsvps?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
