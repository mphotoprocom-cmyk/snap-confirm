import { Booking, JOB_TYPE_LABELS } from '@/types/booking';
import { StatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  return (
    <Link to={`/bookings/${booking.id}`}>
      <Card className="card-elevated card-hover p-5 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {booking.booking_number}
            </p>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {booking.client_name}
            </h3>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-secondary">
              <Calendar className="w-3 h-3" />
            </span>
            <span>{format(new Date(booking.event_date), 'MMM d, yyyy')}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">
              {JOB_TYPE_LABELS[booking.job_type]}
            </span>
          </div>

          {(booking.time_start || booking.time_end) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-secondary">
                <Clock className="w-3 h-3" />
              </span>
              <span>
                {formatTime(booking.time_start)}
                {booking.time_end && ` - ${formatTime(booking.time_end)}`}
              </span>
            </div>
          )}

          {booking.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-secondary">
                <MapPin className="w-3 h-3" />
              </span>
              <span className="truncate">{booking.location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold text-foreground">
              ${booking.total_price.toLocaleString()}
            </p>
          </div>
          {booking.deposit_amount > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Deposit</p>
              <p className="text-sm font-medium text-foreground">
                ${booking.deposit_amount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
