import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePublicInvitation, useSubmitRsvp, InvitationImage } from '@/hooks/useWeddingInvitations';
import { TemplateType } from '@/components/invitation-templates/types';
import { ClassicTemplate } from '@/components/invitation-templates/ClassicTemplate';
import { ModernTemplate } from '@/components/invitation-templates/ModernTemplate';
import { FloralTemplate } from '@/components/invitation-templates/FloralTemplate';
import { MinimalTemplate } from '@/components/invitation-templates/MinimalTemplate';
import { LuxuryTemplate } from '@/components/invitation-templates/LuxuryTemplate';

export default function PublicWeddingInvitation() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = usePublicInvitation(token);
  const submitRsvp = useSubmitRsvp();

  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [rsvpForm, setRsvpForm] = useState({
    guest_name: '',
    guest_phone: '',
    attending: 'yes',
    guest_count: 1,
    message: '',
  });

  // Countdown timer
  useEffect(() => {
    if (!data?.invitation?.event_date) return;

    const eventDate = new Date(data.invitation.event_date);
    if (data.invitation.event_time) {
      const [hours, minutes] = data.invitation.event_time.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes));
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data?.invitation?.event_date, data?.invitation?.event_time]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <Card className="max-w-md mx-4 text-center">
          <CardContent className="pt-8 pb-8">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">ไม่พบการ์ดเชิญ</h2>
            <p className="text-muted-foreground">ลิงก์อาจไม่ถูกต้องหรือการ์ดเชิญหมดอายุแล้ว</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invitation, images, profile } = data;
  const template = (invitation.template || 'classic') as TemplateType;

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRsvp.mutateAsync({
      invitation_id: invitation.id,
      guest_name: rsvpForm.guest_name,
      guest_phone: rsvpForm.guest_phone || undefined,
      attending: rsvpForm.attending === 'yes',
      guest_count: rsvpForm.attending === 'yes' ? rsvpForm.guest_count : 1,
      message: rsvpForm.message || undefined,
    });
    setRsvpSubmitted(true);
    setShowRsvpForm(false);
  };

  const templateProps = {
    invitation,
    images: images || [],
    countdown,
    rsvpEnabled: invitation.rsvp_enabled,
    showRsvpForm,
    rsvpSubmitted,
    rsvpForm,
    setRsvpForm,
    setShowRsvpForm,
    onSubmitRsvp: handleSubmitRsvp,
    isSubmitting: submitRsvp.isPending,
    profile,
  };

  // Render template based on selection
  switch (template) {
    case 'modern':
      return <ModernTemplate {...templateProps} />;
    case 'floral':
      return <FloralTemplate {...templateProps} />;
    case 'minimal':
      return <MinimalTemplate {...templateProps} />;
    case 'luxury':
      return <LuxuryTemplate {...templateProps} />;
    case 'classic':
    default:
      return <ClassicTemplate {...templateProps} />;
  }
}
