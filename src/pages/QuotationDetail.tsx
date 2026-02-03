import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { QuotationForm } from '@/components/QuotationForm';
import { QuotationDocument } from '@/components/QuotationDocument';
import { ShareButtons } from '@/components/ShareButtons';
import { useQuotation, useUpdateQuotation, useDeleteQuotation, useConvertToBooking } from '@/hooks/useQuotations';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, FileText, Download, Loader2, Trash2, ArrowRight, Pencil } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: quotation, isLoading } = useQuotation(id);
  const { data: profile } = useProfile();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();
  const convertToBooking = useConvertToBooking();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const documentRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  if (!user || !quotation) {
    return null;
  }

  const handleUpdate = async (data: any) => {
    await updateQuotation.mutateAsync({ id: quotation.id, ...data });
  };

  const handleDelete = async () => {
    await deleteQuotation.mutateAsync(quotation.id);
    navigate('/quotations');
  };

  const handleConvert = async () => {
    const booking = await convertToBooking.mutateAsync(quotation);
    setShowConvertConfirm(false);
    navigate(`/bookings/${booking.id}`);
  };

  const handleExportPDF = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`ใบเสนอราคา-${quotation.quotation_number}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link to="/quotations">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ArrowLeft className="w-4 h-4" />
            กลับไปรายการใบเสนอราคา
          </button>
        </Link>
          <div className="flex gap-2">
            {quotation.event_date && (
              <ShareButtons
                type="quotation"
                id={quotation.id}
                clientName={quotation.client_name}
                jobType={quotation.job_type}
                eventDate={quotation.event_date}
                studioName={profile?.studio_name}
                totalPrice={quotation.total_price}
              />
            )}
            {quotation.status !== 'accepted' && quotation.status !== 'rejected' && (
              <Button
                variant="outline"
                onClick={() => setShowConvertConfirm(true)}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                แปลงเป็นการจอง
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
      </div>

      <div className="mb-6">
        <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>{quotation.quotation_number}</h1>
        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>ใบเสนอราคาสำหรับ {quotation.client_name}</p>
      </div>

      <Tabs defaultValue="edit" className="mt-6">
          <TabsList>
            <TabsTrigger value="edit" className="gap-2">
              <Pencil className="w-4 h-4" />
              แก้ไข
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <FileText className="w-4 h-4" />
              ใบเสนอราคา
            </TabsTrigger>
          </TabsList>

        <TabsContent value="edit" className="mt-6">
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6`}>
            <QuotationForm
              quotation={quotation}
              onSubmit={handleUpdate}
              isSubmitting={updateQuotation.isPending}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <div className="mb-4 flex justify-end">
            <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              ดาวน์โหลด PDF
            </button>
          </div>
          <div className={`${isDark ? 'glass-card' : 'light-glass-card'} overflow-hidden`}>
            <QuotationDocument ref={documentRef} quotation={quotation} profile={profile || null} />
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
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

      <AlertDialog open={showConvertConfirm} onOpenChange={setShowConvertConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>แปลงเป็นการจอง</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการแปลงใบเสนอราคานี้เป็นการจองหรือไม่?
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
