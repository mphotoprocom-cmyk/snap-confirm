import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShareToken {
  id: string;
  booking_id: string | null;
  quotation_id: string | null;
  token: string;
  created_at: string;
  expires_at: string;
}

// Get or create share token for a booking
export function useBookingShareToken(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['share-token', 'booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      
      // First check if token exists
      const { data: existing, error: fetchError } = await supabase
        .from('share_tokens')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (existing) return existing as ShareToken;
      
      return null;
    },
    enabled: !!bookingId,
  });
}

// Get or create share token for a quotation
export function useQuotationShareToken(quotationId: string | undefined) {
  return useQuery({
    queryKey: ['share-token', 'quotation', quotationId],
    queryFn: async () => {
      if (!quotationId) return null;
      
      // First check if token exists
      const { data: existing, error: fetchError } = await supabase
        .from('share_tokens')
        .select('*')
        .eq('quotation_id', quotationId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (existing) return existing as ShareToken;
      
      return null;
    },
    enabled: !!quotationId,
  });
}

// Create share token for booking
export function useCreateBookingShareToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from('share_tokens')
        .insert({ booking_id: bookingId })
        .select()
        .single();
      
      if (error) throw error;
      return data as ShareToken;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['share-token', 'booking', data.booking_id] });
      toast.success('สร้างลิงก์แชร์สำเร็จ');
    },
    onError: (error) => {
      toast.error('ไม่สามารถสร้างลิงก์แชร์ได้: ' + error.message);
    },
  });
}

// Create share token for quotation
export function useCreateQuotationShareToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quotationId: string) => {
      const { data, error } = await supabase
        .from('share_tokens')
        .insert({ quotation_id: quotationId })
        .select()
        .single();
      
      if (error) throw error;
      return data as ShareToken;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['share-token', 'quotation', data.quotation_id] });
      toast.success('สร้างลิงก์แชร์สำเร็จ');
    },
    onError: (error) => {
      toast.error('ไม่สามารถสร้างลิงก์แชร์ได้: ' + error.message);
    },
  });
}

// Get shared data by token (public - no auth required)
export function useSharedData(token: string | undefined) {
  return useQuery({
    queryKey: ['shared-data', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase.rpc('get_share_data', {
        share_token: token,
      });
      
      if (error) throw error;
      return data as {
        type: 'booking' | 'quotation';
        data: any;
        profile: any;
      } | null;
    },
    enabled: !!token,
  });
}

// Accept quotation by token (public - no auth required)
export function useAcceptQuotation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc('accept_quotation_by_token', {
        share_token: token,
      });
      
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: (success, token) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['shared-data', token] });
        toast.success('ยืนยันรับใบเสนอราคาสำเร็จ!');
      } else {
        toast.error('ไม่สามารถยืนยันได้');
      }
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}
