import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WeddingInvitation {
  id: string;
  user_id: string;
  booking_id: string | null;
  access_token: string;
  is_active: boolean;
  groom_name: string;
  bride_name: string;
  event_date: string;
  event_time: string | null;
  ceremony_time: string | null;
  reception_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  google_maps_url: string | null;
  google_maps_embed_url: string | null;
  cover_image_url: string | null;
  theme_color: string;
  message: string | null;
  rsvp_enabled: boolean;
  rsvp_deadline: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvitationRsvp {
  id: string;
  invitation_id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  attending: boolean;
  guest_count: number;
  message: string | null;
  dietary_requirements: string | null;
  created_at: string;
}

export function useWeddingInvitations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wedding-invitations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wedding_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WeddingInvitation[];
    },
    enabled: !!user,
  });
}

export function useWeddingInvitation(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wedding-invitation', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('wedding_invitations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as WeddingInvitation;
    },
    enabled: !!user && !!id,
  });
}

export function useInvitationRsvps(invitationId: string | undefined) {
  return useQuery({
    queryKey: ['invitation-rsvps', invitationId],
    queryFn: async () => {
      if (!invitationId) return [];
      const { data, error } = await supabase
        .from('invitation_rsvps')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvitationRsvp[];
    },
    enabled: !!invitationId,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (invitation: Omit<Partial<WeddingInvitation>, 'id' | 'user_id' | 'access_token' | 'created_at' | 'updated_at' | 'view_count'> & { groom_name: string; bride_name: string; event_date: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wedding_invitations')
        .insert({
          groom_name: invitation.groom_name,
          bride_name: invitation.bride_name,
          event_date: invitation.event_date,
          user_id: user.id,
          booking_id: invitation.booking_id || null,
          event_time: invitation.event_time || null,
          ceremony_time: invitation.ceremony_time || null,
          reception_time: invitation.reception_time || null,
          venue_name: invitation.venue_name || null,
          venue_address: invitation.venue_address || null,
          google_maps_url: invitation.google_maps_url || null,
          google_maps_embed_url: invitation.google_maps_embed_url || null,
          cover_image_url: invitation.cover_image_url || null,
          theme_color: invitation.theme_color || '#d4af37',
          message: invitation.message || null,
          rsvp_enabled: invitation.rsvp_enabled ?? true,
          rsvp_deadline: invitation.rsvp_deadline || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WeddingInvitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-invitations'] });
      toast.success('สร้างการ์ดเชิญสำเร็จ');
    },
    onError: (error) => {
      toast.error('ไม่สามารถสร้างการ์ดเชิญได้: ' + error.message);
    },
  });
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WeddingInvitation> & { id: string }) => {
      const { data, error } = await supabase
        .from('wedding_invitations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as WeddingInvitation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wedding-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['wedding-invitation', data.id] });
      toast.success('บันทึกการเปลี่ยนแปลงแล้ว');
    },
    onError: (error) => {
      toast.error('ไม่สามารถบันทึกได้: ' + error.message);
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wedding_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-invitations'] });
      toast.success('ลบการ์ดเชิญแล้ว');
    },
    onError: (error) => {
      toast.error('ไม่สามารถลบได้: ' + error.message);
    },
  });
}

// Public function - get invitation by token
export function usePublicInvitation(token: string | undefined) {
  return useQuery({
    queryKey: ['public-invitation', token],
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await supabase.rpc('get_invitation_by_token', {
        p_access_token: token,
      });

      if (error) throw error;
      if (!data) return null;
      
      return data as unknown as {
        invitation: WeddingInvitation;
        rsvp_count: { attending: number; not_attending: number };
        profile: any;
      };
    },
    enabled: !!token,
  });
}

// Public function - submit RSVP
export function useSubmitRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rsvp: {
      invitation_id: string;
      guest_name: string;
      guest_phone?: string;
      guest_email?: string;
      attending: boolean;
      guest_count?: number;
      message?: string;
      dietary_requirements?: string;
    }) => {
      const { data, error } = await supabase
        .from('invitation_rsvps')
        .insert({
          ...rsvp,
          guest_count: rsvp.guest_count || 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data as InvitationRsvp;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['public-invitation'] });
      queryClient.invalidateQueries({ queryKey: ['invitation-rsvps', data.invitation_id] });
      toast.success('ส่งการตอบรับเรียบร้อยแล้ว');
    },
    onError: (error) => {
      toast.error('ไม่สามารถส่งการตอบรับได้: ' + error.message);
    },
  });
}
