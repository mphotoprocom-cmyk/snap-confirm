import { JobType } from './booking';

export interface Package {
  id: string;
  user_id: string;
  name: string;
  price: number;
  description: string | null;
  job_type: JobType | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  user_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  client_note: string | null;
  job_type: JobType;
  event_date: string | null;
  time_start: string | null;
  time_end: string | null;
  location: string | null;
  total_price: number;
  notes: string | null;
  valid_until: string | null;
  status: QuotationStatus;
  package_id: string | null;
  created_at: string;
  updated_at: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'ร่าง',
  sent: 'ส่งแล้ว',
  accepted: 'ตอบรับแล้ว',
  rejected: 'ปฏิเสธ',
  expired: 'หมดอายุ',
};
