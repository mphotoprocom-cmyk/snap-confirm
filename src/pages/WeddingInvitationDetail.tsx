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
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="template">เทมเพลต</TabsTrigger>
              <TabsTrigger value="details">รายละเอียด</TabsTrigger>
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
