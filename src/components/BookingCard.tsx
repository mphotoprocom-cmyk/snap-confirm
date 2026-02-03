import { Booking, JOB_TYPE_LABELS } from '@/types/booking';
import { StatusBadge } from './StatusBadge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

interface BookingCardProps {
  booking: Booking;
}

const toBuddhistYear = (date: Date) => {
  return date.getFullYear() + 543;
};

const formatThaiDate = (date: Date) => {
  const day = format(date, 'd', { locale: th });
  const month = format(date, 'MMM', { locale: th });
  const year = toBuddhistYear(date);
  return `${day} ${month} ${year}`;
};

export function BookingCard({ booking }: BookingCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'HH:mm น.');
  };

  return (
    <Link to={`/bookings/${booking.id}`}>
      <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-5 cursor-pointer`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-[10px] font-medium mb-1 tracking-wide uppercase ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              {booking.booking_number}
            </p>
            <h3 className={`font-display text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {booking.client_name}
            </h3>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="space-y-2 text-sm">
          <div className={`flex items-center gap-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Calendar className="w-3 h-3" />
            </span>
            <span>{formatThaiDate(new Date(booking.event_date))}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {JOB_TYPE_LABELS[booking.job_type]}
            </span>
          </div>

          {(booking.time_start || booking.time_end) && (
            <div className={`flex items-center gap-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <Clock className="w-3 h-3" />
              </span>
              <span>
                {formatTime(booking.time_start)}
                {booking.time_end && ` - ${formatTime(booking.time_end)}`}
              </span>
            </div>
          )}

          {booking.location && (
            <div className={`flex items-center gap-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <MapPin className="w-3 h-3" />
              </span>
              <span className="truncate">{booking.location}</span>
            </div>
          )}
        </div>

        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <div>
            <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>ราคารวม</p>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ฿{booking.total_price.toLocaleString()}
            </p>
          </div>
          {booking.deposit_amount > 0 && (
            <div className="text-right">
              <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>มัดจำ</p>
              <p className="text-sm font-medium text-emerald-400">
                ฿{booking.deposit_amount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
