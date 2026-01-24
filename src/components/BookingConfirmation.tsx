import { forwardRef } from 'react';
import { Booking, JOB_TYPE_LABELS } from '@/types/booking';
import { Profile } from '@/types/booking';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Camera } from 'lucide-react';

interface BookingConfirmationProps {
  booking: Booking;
  profile: Profile | null;
}

// Helper function to convert to Buddhist Era
const toBuddhistYear = (date: Date) => {
  return date.getFullYear() + 543;
};

const formatThaiDate = (date: Date) => {
  const day = format(date, 'd', { locale: th });
  const month = format(date, 'MMMM', { locale: th });
  const year = toBuddhistYear(date);
  return `${day} ${month} ${year}`;
};

export const BookingConfirmation = forwardRef<HTMLDivElement, BookingConfirmationProps>(
  ({ booking, profile }, ref) => {
    const formatTime = (time: string | null) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'HH:mm น.');
    };

    return (
      <div
        ref={ref}
        className="bg-white p-8 max-w-2xl mx-auto"
        style={{ fontFamily: 'Sarabun, Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="text-center border-b pb-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              {profile?.studio_name || 'Photography Studio'}
            </h1>
          </div>
          {profile?.phone && <p className="text-sm text-gray-600">{profile.phone}</p>}
          {profile?.email && <p className="text-sm text-gray-600">{profile.email}</p>}
          {profile?.address && <p className="text-sm text-gray-600">{profile.address}</p>}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            ใบยืนยันการจอง
          </h2>
          <p className="text-sm text-gray-500">เลขที่อ้างอิง: {booking.booking_number}</p>
        </div>

        {/* Client Details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">ข้อมูลลูกค้า</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">{booking.client_name}</p>
            {booking.client_phone && <p className="text-sm text-gray-600">{booking.client_phone}</p>}
            {booking.client_email && <p className="text-sm text-gray-600">{booking.client_email}</p>}
          </div>
        </div>

        {/* Event Details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">รายละเอียดงาน</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">ประเภทงาน:</span>
              <span className="font-medium text-gray-900">{JOB_TYPE_LABELS[booking.job_type]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">วันที่:</span>
              <span className="font-medium text-gray-900">{formatThaiDate(new Date(booking.event_date))}</span>
            </div>
            {(booking.time_start || booking.time_end) && (
              <div className="flex justify-between">
                <span className="text-gray-600">เวลา:</span>
                <span className="font-medium text-gray-900">
                  {formatTime(booking.time_start)}
                  {booking.time_end && ` - ${formatTime(booking.time_end)}`}
                </span>
              </div>
            )}
            {booking.location && (
              <div className="flex justify-between">
                <span className="text-gray-600">สถานที่:</span>
                <span className="font-medium text-gray-900">{booking.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">รายละเอียดบริการ</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm text-gray-700">
            <p>• ถ่ายภาพไม่จำกัดจำนวน</p>
            <p>• ปรับโทน/แสง/สี ทุกภาพ</p>
            <p>• ส่ง Demo 30-80 ภาพใน 24 ชั่วโมง</p>
            <p>• ส่งไฟล์ภาพทั้งหมดภายใน 3-7 วัน</p>
            <p>• ส่งไฟล์ภาพทาง Google Drive / Google Photos</p>
            <p>• Backup ไฟล์ไว้ให้ 1 ปี</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">สรุปการชำระเงิน</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">ราคารวม:</span>
              <span className="font-medium text-gray-900">฿{booking.total_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">มัดจำที่ชำระแล้ว:</span>
              <span className="font-medium text-gray-900">฿{booking.deposit_amount.toLocaleString()}</span>
            </div>
            {booking.deposit_received_date && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">วันที่ชำระมัดจำ:</span>
                <span className="font-medium text-gray-900">{formatThaiDate(new Date(booking.deposit_received_date))}</span>
              </div>
            )}
            <div className="border-t mt-3 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">ยอดคงเหลือ:</span>
              <span className="font-semibold text-gray-900">฿{(booking.total_price - booking.deposit_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-500 border-t pt-4 space-y-1">
          <p className="font-medium text-gray-700">เงื่อนไขการจอง:</p>
          <p>• ใบยืนยันการจองนี้มีผลเมื่อได้รับการชำระค่ามัดจำแล้ว</p>
          <p>• ยอดคงเหลือชำระในวันงาน หรือก่อนวันงาน</p>
          <p>• นโยบายการยกเลิกเป็นไปตามเงื่อนไขของบริการ</p>
          <p>• กรุณาติดต่อเราหากต้องการเปลี่ยนแปลงรายละเอียดการจอง</p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t">
          <p className="text-xs text-gray-400">
            สร้างเมื่อ {formatThaiDate(new Date())} เวลา {format(new Date(), 'HH:mm น.')}
          </p>
        </div>
      </div>
    );
  }
);

BookingConfirmation.displayName = 'BookingConfirmation';
