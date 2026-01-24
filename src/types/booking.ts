export type JobType = 'wedding' | 'event' | 'corporate' | 'portrait' | 'other';

export type BookingStatus = 'draft' | 'waiting_deposit' | 'booked' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  job_type: JobType;
  event_date: string;
  time_start: string | null;
  time_end: string | null;
  location: string | null;
  total_price: number;
  deposit_amount: number;
  deposit_received_date: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  studio_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  wedding: 'Wedding',
  event: 'Event',
  corporate: 'Corporate',
  portrait: 'Portrait',
  other: 'Other',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  draft: 'Draft',
  waiting_deposit: 'Waiting for Deposit',
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
