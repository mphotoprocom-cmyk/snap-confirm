import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuotations, useDeleteQuotation, useConvertToBooking } from '@/hooks/useQuotations';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { QUOTATION_STATUS_LABELS, QuotationStatus } from '@/types/package';
import { JOB_TYPE_LABELS, JobType } from '@/types/booking';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Plus, FileText, Loader2, ArrowRight, Trash2, Eye } from 'lucide-react';
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

const getStatusColor = (status: QuotationStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-secondary text-secondary-foreground';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

export default function Quotations() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: quotations, isLoading } = useQuotations();
  const deleteQuotation = useDeleteQuotation();
  const convertToBooking = useConvertToBooking();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [convertConfirmQuotation, setConvertConfirmQuotation] = useState<any>(null);

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

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteQuotation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleConvert = async () => {
    if (convertConfirmQuotation) {
      const booking = await convertToBooking.mutateAsync(convertConfirmQuotation);
      setConvertConfirmQuotation(null);
      navigate(`/bookings/${booking.id}`);
    }
  };

  const toBuddhistYear = (date: Date) => date.getFullYear() + 543;
  const formatThaiDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${format(date, 'd MMM', { locale: th })} ${toBuddhistYear(date)}`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ใบเสนอราคา
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            จัดการใบเสนอราคาและแปลงเป็นการจอง
          </p>
        </div>

        <Link to="/quotations/new">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" />
            สร้างใบเสนอราคา
          </button>
        </Link>
      </div>

      {quotations && quotations.length > 0 ? (
        <div className="space-y-3">
          {quotations.map((quotation) => (
            <div key={quotation.id} className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {quotation.client_name}
                    </h3>
                    <Badge className={getStatusColor(quotation.status as QuotationStatus)}>
                      {QUOTATION_STATUS_LABELS[quotation.status as QuotationStatus]}
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    <span>{quotation.quotation_number}</span>
                    <span>•</span>
                    <span>{JOB_TYPE_LABELS[quotation.job_type as JobType]}</span>
                    {quotation.event_date && (
                      <>
                        <span>•</span>
                        <span>{formatThaiDate(quotation.event_date)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ฿{quotation.total_price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Link to={`/quotations/${quotation.id}`}>
                    <button className={`p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
                  {quotation.status !== 'accepted' && quotation.status !== 'rejected' && (
                    <button
                      className={`p-2 rounded-lg text-emerald-400 ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                      onClick={() => setConvertConfirmQuotation(quotation)}
                      title="แปลงเป็นการจอง"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className={`p-2 rounded-lg text-red-400 ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
                    onClick={() => setDeleteConfirmId(quotation.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-12 text-center`}>
          <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
            ยังไม่มีใบเสนอราคา
          </h3>
          <p className={`mb-4 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            สร้างใบเสนอราคาเพื่อส่งให้ลูกค้าของคุณ
          </p>
          <Link to="/quotations/new">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mx-auto">
              <Plus className="w-4 h-4" />
              สร้างใบเสนอราคาแรก
            </button>
          </Link>
        </div>
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบใบเสนอราคานี้หรือไม่?
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

      <AlertDialog open={!!convertConfirmQuotation} onOpenChange={() => setConvertConfirmQuotation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>แปลงเป็นการจอง</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการแปลงใบเสนอราคานี้เป็นการจองหรือไม่? สถานะใบเสนอราคาจะเปลี่ยนเป็น "ตอบรับแล้ว"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvert}>
              แปลงเป็นการจอง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
