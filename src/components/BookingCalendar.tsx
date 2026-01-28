import { useState } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking, BookingStatus, JOB_TYPE_LABELS } from '@/types/booking';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BookingCalendarProps {
  bookings: Booking[];
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  waiting_deposit: 'bg-warning/20 text-warning border border-warning/30',
  booked: 'bg-success/20 text-success border border-success/30',
  completed: 'bg-primary/20 text-primary border border-primary/30',
  cancelled: 'bg-destructive/20 text-destructive border border-destructive/30',
};

export function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDay = (day: Date) => {
    return bookings.filter((booking) => 
      isSameDay(new Date(booking.event_date), day)
    );
  };

  const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="card-elevated p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: th })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            วันนี้
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day, idx) => {
          const dayBookings = getBookingsForDay(day);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[80px] sm:min-h-[100px] p-1 border rounded-lg transition-colors',
                isCurrentMonth ? 'bg-background' : 'bg-muted/30',
                isToday && 'border-primary'
              )}
            >
              <div
                className={cn(
                  'text-sm font-medium mb-1 text-center',
                  !isCurrentMonth && 'text-muted-foreground',
                  isToday && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayBookings.slice(0, 2).map((booking) => (
                  <Tooltip key={booking.id}>
                    <TooltipTrigger asChild>
                      <Link to={`/bookings/${booking.id}`}>
                        <div
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity',
                            STATUS_COLORS[booking.status]
                          )}
                        >
                          <span className="hidden sm:inline">{booking.client_name}</span>
                          <span className="sm:hidden">{booking.client_name.slice(0, 3)}</span>
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="font-medium">{booking.client_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {JOB_TYPE_LABELS[booking.job_type]}
                      </p>
                      {booking.time_start && (
                        <p className="text-xs text-muted-foreground">
                          {booking.time_start} - {booking.time_end || '?'}
                        </p>
                      )}
                      {booking.location && (
                        <p className="text-xs text-muted-foreground truncate">
                          📍 {booking.location}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayBookings.length - 2} อื่นๆ
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">ร่าง</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/30 border border-warning/50" />
          <span className="text-xs text-muted-foreground">รอมัดจำ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/30 border border-success/50" />
          <span className="text-xs text-muted-foreground">จองแล้ว</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/30 border border-primary/50" />
          <span className="text-xs text-muted-foreground">เสร็จสิ้น</span>
        </div>
      </div>
    </div>
  );
}
