import { useParams } from 'react-router-dom';
import { useSharedData, useAcceptQuotation } from '@/hooks/useShareTokens';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, Calendar, MapPin, Clock, Phone, Mail, User } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { JOB_TYPE_LABELS, JobType } from '@/types/booking';
import { QUOTATION_STATUS_LABELS, QuotationStatus } from '@/types/package';
import { StatusBadge } from '@/components/StatusBadge';
import { BookingStatus } from '@/types/booking';

const toBuddhistYear = (date: Date) => date.getFullYear() + 543;

const formatThaiDate = (date: Date) => {
  const day = format(date, 'd', { locale: th });
  const month = format(date, 'MMMM', { locale: th });
  const year = toBuddhistYear(date);
  return `${day} ${month} ${year}`;
};

const formatTime = (time: string | null) => {
  if (!time) return null;
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes} น.`;
};

export default function ShareView() {
  const { token } = useParams<{ token: string }>();
  const { data: sharedData, isLoading, error } = useSharedData(token);
  const acceptQuotation = useAcceptQuotation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl">🔗</span>
          </div>
          <h1 className="text-xl font-semibold mb-2">ลิงก์ไม่ถูกต้องหรือหมดอายุ</h1>
          <p className="text-muted-foreground">
            กรุณาติดต่อช่างภาพเพื่อขอลิงก์ใหม่
          </p>
        </Card>
      </div>
    );
  }

  const { type, data, profile } = sharedData;
  const isBooking = type === 'booking';
  const isQuotation = type === 'quotation';

  const handleAccept = async () => {
    if (token) {
      await acceptQuotation.mutateAsync(token);
    }
  };

  const canAccept = isQuotation && data.status !== 'accepted' && data.status !== 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          {profile?.logo_url && (
            <img 
              src={profile.logo_url} 
              alt={profile.studio_name} 
              className="h-16 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl font-display font-bold text-foreground">
            {profile?.studio_name || 'Photography Studio'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBooking ? 'ใบยืนยันการจอง' : 'ใบเสนอราคา'}
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-6 shadow-lg">
          {/* Status & Number */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                {isBooking ? 'หมายเลขการจอง' : 'หมายเลขใบเสนอราคา'}
              </p>
              <p className="font-mono font-medium">
                {isBooking ? data.booking_number : data.quotation_number}
              </p>
            </div>
            {isBooking ? (
              <StatusBadge status={data.status as BookingStatus} />
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.status === 'accepted' ? 'bg-green-100 text-green-700' :
                data.status === 'rejected' ? 'bg-red-100 text-red-700' :
                data.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {QUOTATION_STATUS_LABELS[data.status as QuotationStatus] || data.status}
              </span>
            )}
          </div>

          {/* Client Info */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              ข้อมูลลูกค้า
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">ชื่อ</p>
                <p className="font-medium">{data.client_name}</p>
              </div>
              {data.client_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">เบอร์โทร</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {data.client_phone}
                  </p>
                </div>
              )}
              {data.client_email && (
                <div>
                  <p className="text-sm text-muted-foreground">อีเมล</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {data.client_email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="border-t mt-6 pt-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              รายละเอียดงาน
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">ประเภทงาน</p>
                <p className="font-medium">{JOB_TYPE_LABELS[data.job_type as JobType]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันที่</p>
                <p className="font-medium">
                  {data.event_date ? formatThaiDate(new Date(data.event_date)) : '-'}
                </p>
              </div>
              {(data.time_start || data.time_end) && (
                <div>
                  <p className="text-sm text-muted-foreground">เวลา</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatTime(data.time_start)}
                    {data.time_end && ` - ${formatTime(data.time_end)}`}
                  </p>
                </div>
              )}
              {data.location && (
                <div>
                  <p className="text-sm text-muted-foreground">สถานที่</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {data.location}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="border-t mt-6 pt-6 space-y-4">
            <h2 className="font-semibold text-lg">💰 ราคา</h2>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ราคารวม</span>
                <span className="font-bold text-lg">฿{data.total_price?.toLocaleString() || 0}</span>
              </div>
              {isBooking && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">มัดจำ</span>
                    <span>฿{data.deposit_amount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">ยอดคงเหลือ</span>
                    <span className="font-semibold">
                      ฿{((data.total_price || 0) - (data.deposit_amount || 0)).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="border-t mt-6 pt-6">
              <h2 className="font-semibold text-lg mb-2">📝 หมายเหตุ</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}

          {/* Service Details */}
          {profile?.service_details && (
            <div className="border-t mt-6 pt-6">
              <h2 className="font-semibold text-lg mb-2">📋 รายละเอียดบริการ</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">{profile.service_details}</p>
            </div>
          )}

          {/* Accept Button for Quotation */}
          {canAccept && (
            <div className="border-t mt-6 pt-6">
              <Button 
                onClick={handleAccept} 
                disabled={acceptQuotation.isPending}
                className="w-full gap-2"
                size="lg"
              >
                {acceptQuotation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                ยืนยันรับใบเสนอราคา
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                กดปุ่มเพื่อยืนยันการรับใบเสนอราคานี้
              </p>
            </div>
          )}

          {/* Already Accepted Message */}
          {isQuotation && data.status === 'accepted' && (
            <div className="border-t mt-6 pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-800">ยืนยันรับใบเสนอราคาแล้ว</p>
                <p className="text-sm text-green-600 mt-1">ทางสตูดิโอจะติดต่อกลับเพื่อยืนยันการจองในเร็วๆ นี้</p>
              </div>
            </div>
          )}
        </Card>

        {/* Contact */}
        {(profile?.phone || profile?.email) && (
          <div className="text-center mt-8 space-y-2">
            <p className="text-sm text-muted-foreground">ติดต่อสอบถาม</p>
            <div className="flex justify-center gap-4">
              {profile.phone && (
                <a 
                  href={`tel:${profile.phone}`} 
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </a>
              )}
              {profile.email && (
                <a 
                  href={`mailto:${profile.email}`} 
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>Powered by Photographer Booking System</p>
        </div>
      </div>
    </div>
  );
}
