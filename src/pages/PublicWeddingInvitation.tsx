import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, MapPin, Calendar, Clock, Loader2, Check, Users, Navigation } from 'lucide-react';
import { usePublicInvitation, useSubmitRsvp } from '@/hooks/useWeddingInvitations';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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

  const { invitation, profile } = data;
  const themeColor = invitation.theme_color || '#d4af37';

  const formatThaiDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear() + 543;
    return `${format(d, 'EEEE ที่ d MMMM', { locale: th })} พ.ศ. ${year}`;
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes} น.`;
  };

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

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${themeColor}10 0%, ${themeColor}05 50%, white 100%)`,
      }}
    >
      {/* Cover Image */}
      {invitation.cover_image_url && (
        <div className="relative h-[60vh] min-h-[400px]">
          <img
            src={invitation.cover_image_url}
            alt="Wedding"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 50%, ${themeColor}90 100%)`,
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 text-center pb-12 text-white">
            <p className="text-lg tracking-widest mb-2">THE WEDDING OF</p>
            <h1 className="text-4xl md:text-6xl font-serif">
              {invitation.groom_name} & {invitation.bride_name}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container max-w-2xl py-12 px-4">
        {!invitation.cover_image_url && (
          <div className="text-center mb-12">
            <Heart
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: themeColor }}
            />
            <p className="text-lg tracking-widest mb-2" style={{ color: themeColor }}>
              THE WEDDING OF
            </p>
            <h1 className="text-4xl md:text-5xl font-serif">
              {invitation.groom_name} & {invitation.bride_name}
            </h1>
          </div>
        )}

        {/* Countdown */}
        <Card className="mb-8 overflow-hidden">
          <div
            className="p-6 text-center text-white"
            style={{ backgroundColor: themeColor }}
          >
            <p className="text-sm uppercase tracking-widest mb-4">นับถอยหลังสู่วันสำคัญ</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-3xl md:text-4xl font-bold">{countdown.days}</p>
                <p className="text-xs uppercase">วัน</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold">{countdown.hours}</p>
                <p className="text-xs uppercase">ชั่วโมง</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold">{countdown.minutes}</p>
                <p className="text-xs uppercase">นาที</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold">{countdown.seconds}</p>
                <p className="text-xs uppercase">วินาที</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Invitation Message */}
        {invitation.message && (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <p className="whitespace-pre-wrap leading-relaxed">{invitation.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Event Details */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2" style={{ color: themeColor }}>
              <Calendar className="w-5 h-5" />
              วันและเวลา
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg font-medium">{formatThaiDate(invitation.event_date)}</p>

            {(invitation.ceremony_time || invitation.reception_time) && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {invitation.ceremony_time && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: themeColor }} />
                    <p className="font-medium">พิธีการ</p>
                    <p className="text-muted-foreground">{formatTime(invitation.ceremony_time)}</p>
                  </div>
                )}
                {invitation.reception_time && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: themeColor }} />
                    <p className="font-medium">เลี้ยงรับรอง</p>
                    <p className="text-muted-foreground">{formatTime(invitation.reception_time)}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Venue */}
        {(invitation.venue_name || invitation.venue_address) && (
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2" style={{ color: themeColor }}>
                <MapPin className="w-5 h-5" />
                สถานที่จัดงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {invitation.venue_name && (
                <p className="text-lg font-medium">{invitation.venue_name}</p>
              )}
              {invitation.venue_address && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {invitation.venue_address}
                </p>
              )}

              {invitation.google_maps_url && (
                <Button
                  variant="outline"
                  className="gap-2"
                  asChild
                >
                  <a href={invitation.google_maps_url} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4" />
                    นำทาง Google Maps
                  </a>
                </Button>
              )}

              {invitation.google_maps_embed_url && (
                <div className="mt-4 aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={invitation.google_maps_embed_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* RSVP */}
        {invitation.rsvp_enabled && (
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2" style={{ color: themeColor }}>
                <Users className="w-5 h-5" />
                ตอบรับเข้าร่วมงาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rsvpSubmitted ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${themeColor}20` }}
                  >
                    <Check className="w-8 h-8" style={{ color: themeColor }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">ขอบคุณสำหรับการตอบรับ</h3>
                  <p className="text-muted-foreground">
                    เราได้รับการตอบรับของท่านแล้ว
                  </p>
                </div>
              ) : showRsvpForm ? (
                <form onSubmit={handleSubmitRsvp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>ชื่อ-นามสกุล *</Label>
                    <Input
                      value={rsvpForm.guest_name}
                      onChange={e => setRsvpForm(prev => ({ ...prev, guest_name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>เบอร์โทรศัพท์</Label>
                    <Input
                      value={rsvpForm.guest_phone}
                      onChange={e => setRsvpForm(prev => ({ ...prev, guest_phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ท่านจะเข้าร่วมงานหรือไม่? *</Label>
                    <RadioGroup
                      value={rsvpForm.attending}
                      onValueChange={value => setRsvpForm(prev => ({ ...prev, attending: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">ยินดีเข้าร่วม</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">ไม่สามารถเข้าร่วมได้</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {rsvpForm.attending === 'yes' && (
                    <div className="space-y-2">
                      <Label>จำนวนผู้เข้าร่วม</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={rsvpForm.guest_count}
                        onChange={e => setRsvpForm(prev => ({ ...prev, guest_count: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>ข้อความถึงคู่บ่าวสาว</Label>
                    <Textarea
                      value={rsvpForm.message}
                      onChange={e => setRsvpForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowRsvpForm(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={submitRsvp.isPending}
                      style={{ backgroundColor: themeColor }}
                    >
                      {submitRsvp.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      ส่งการตอบรับ
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  {invitation.rsvp_deadline && (
                    <p className="text-sm text-muted-foreground mb-4">
                      กรุณาตอบรับภายใน {formatThaiDate(invitation.rsvp_deadline)}
                    </p>
                  )}
                  <Button
                    onClick={() => setShowRsvpForm(true)}
                    size="lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    ตอบรับเข้าร่วมงาน
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        {profile?.studio_name && (
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>Wedding Invitation by</p>
            <p className="font-medium">{profile.studio_name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
