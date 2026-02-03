import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

export default function WeddingInvitations() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: invitations, isLoading } = useWeddingInvitations();
  const deleteInvitation = useDeleteInvitation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (authLoading) {
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
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-semibold font-display flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Heart className="w-6 h-6 text-pink-500" />
            การ์ดเชิญงานแต่ง
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            สร้างและจัดการการ์ดเชิญออนไลน์สำหรับลูกค้า
          </p>
        </div>
        <Link to="/invitations/new">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20">
            <Plus className="w-4 h-4" />
            สร้างการ์ดเชิญ
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : invitations?.length === 0 ? (
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-12 text-center`}>
          <Heart className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
            ยังไม่มีการ์ดเชิญ
          </h3>
          <p className={`mb-4 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            เริ่มสร้างการ์ดเชิญงานแต่งออนไลน์ให้ลูกค้าของคุณ
          </p>
          <Link to="/invitations/new">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white mx-auto">
              <Plus className="w-4 h-4" />
              สร้างการ์ดเชิญแรก
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invitations?.map((invitation) => (
            <div key={invitation.id} className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {invitation.groom_name} & {invitation.bride_name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    {formatThaiDate(invitation.event_date)}
                  </p>
                </div>
                <Badge variant={invitation.is_active ? 'default' : 'secondary'} className={invitation.is_active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}>
                  {invitation.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </Badge>
              </div>

              {invitation.venue_name && (
                <p className={`text-sm mb-3 line-clamp-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  📍 {invitation.venue_name}
                </p>
              )}

              <div className={`flex items-center gap-4 text-sm mb-4 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
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

              <div className="flex items-center gap-2">
                <button
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                  onClick={() => handleCopyLink(invitation.access_token, invitation.id)}
                >
                  {copiedId === invitation.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  คัดลอกลิงก์
                </button>
                <a
                  href={`/invitation/${invitation.access_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link to={`/invitations/${invitation.id}`}>
                  <button className="px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    จัดการ
                  </button>
                </Link>
                <button
                  className={`p-2 rounded-lg text-red-400 ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                  onClick={() => setDeleteId(invitation.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </>
  );
}
