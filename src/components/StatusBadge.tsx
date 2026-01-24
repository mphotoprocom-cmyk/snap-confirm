import { BookingStatus, STATUS_LABELS } from '@/types/booking';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusClasses: Record<BookingStatus, string> = {
    draft: 'status-draft',
    waiting_deposit: 'status-waiting',
    booked: 'status-booked',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  };

  return (
    <span className={cn('status-badge', statusClasses[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
