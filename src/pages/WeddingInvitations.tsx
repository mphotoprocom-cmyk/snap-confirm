import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Heart, Eye, Users, Copy, Check, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useWeddingInvitations, useDeleteInvitation } from '@/hooks/useWeddingInvitations';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

export default function WeddingInvitations() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: invitations, isLoading } = useWeddingInvitations();
  const deleteInvitation = useDeleteInvitation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleCopyLink = async (token: string, id: string) => {
    const url = `${window.location.origin}/invitation/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('คัดลอกลิงก์แล้ว');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteInvitation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const formatThaiDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear() + 543;
    return `${format(d, 'd MMMM', { locale: th })} ${year}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500" />
              การ์ดเชิญงานแต่ง
            </h1>
            <p className="text-muted-foreground mt-1">
              สร้างและจัดการการ์ดเชิญออนไลน์สำหรับลูกค้า
            </p>
          </div>
          <Link to="/invitations/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              สร้างการ์ดเชิญ
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : invitations?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">ยังไม่มีการ์ดเชิญ</h3>
              <p className="text-muted-foreground mb-4">
                เริ่มสร้างการ์ดเชิญงานแต่งออนไลน์ให้ลูกค้าของคุณ
              </p>
              <Link to="/invitations/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างการ์ดเชิญแรก
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invitations?.map((invitation) => (
              <Card key={invitation.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {invitation.groom_name} & {invitation.bride_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatThaiDate(invitation.event_date)}
                      </p>
                    </div>
                    <Badge variant={invitation.is_active ? 'default' : 'secondary'}>
                      {invitation.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {invitation.venue_name && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      📍 {invitation.venue_name}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {invitation.view_count} เข้าชม
                    </span>
                    {invitation.rsvp_enabled && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        RSVP
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCopyLink(invitation.access_token, invitation.id)}
                    >
                      {copiedId === invitation.id ? (
                        <Check className="w-4 h-4 mr-1 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      คัดลอกลิงก์
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`/invitation/${invitation.access_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Link to={`/invitations/${invitation.id}`}>
                      <Button size="sm">จัดการ</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(invitation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบการ์ดเชิญ?</AlertDialogTitle>
            <AlertDialogDescription>
              การ์ดเชิญนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้ รวมถึงข้อมูล RSVP ทั้งหมด
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
