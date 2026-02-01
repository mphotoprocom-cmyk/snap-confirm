import { WeddingInvitation } from '@/hooks/useWeddingInvitations';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MapPin, Calendar, Clock, Navigation, Users, Check, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface InvitationImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

interface FloralTemplateProps {
  invitation: WeddingInvitation;
  images: InvitationImage[];
  countdown: { days: number; hours: number; minutes: number; seconds: number };
  rsvpEnabled: boolean;
  showRsvpForm: boolean;
  rsvpSubmitted: boolean;
  rsvpForm: any;
  setRsvpForm: (form: any) => void;
  setShowRsvpForm: (show: boolean) => void;
  onSubmitRsvp: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  profile: any;
}

export function FloralTemplate({
  invitation,
  images,
  countdown,
  rsvpEnabled,
  showRsvpForm,
  rsvpSubmitted,
  rsvpForm,
  setRsvpForm,
  setShowRsvpForm,
  onSubmitRsvp,
  isSubmitting,
  profile,
}: FloralTemplateProps) {
  const primaryColor = invitation.theme_color || '#8b5a5a';

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

  return (
    <div className="min-h-screen bg-[#fdf8f8]">
      {/* Floral decorations */}
      <div className="fixed top-0 left-0 w-64 h-64 opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ color: primaryColor }}>
          <circle cx="50" cy="50" r="30" fill="currentColor" opacity="0.3" />
          <circle cx="80" cy="30" r="20" fill="currentColor" opacity="0.4" />
          <circle cx="30" cy="80" r="25" fill="currentColor" opacity="0.2" />
          <circle cx="100" cy="60" r="15" fill="currentColor" opacity="0.3" />
          <circle cx="60" cy="100" r="20" fill="currentColor" opacity="0.2" />
        </svg>
      </div>
      <div className="fixed bottom-0 right-0 w-64 h-64 opacity-20 pointer-events-none rotate-180">
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ color: primaryColor }}>
          <circle cx="50" cy="50" r="30" fill="currentColor" opacity="0.3" />
          <circle cx="80" cy="30" r="20" fill="currentColor" opacity="0.4" />
          <circle cx="30" cy="80" r="25" fill="currentColor" opacity="0.2" />
          <circle cx="100" cy="60" r="15" fill="currentColor" opacity="0.3" />
          <circle cx="60" cy="100" r="20" fill="currentColor" opacity="0.2" />
        </svg>
      </div>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <Heart className="w-12 h-12 mx-auto mb-6" style={{ color: primaryColor }} />

          <p
            className="text-sm tracking-widest mb-4"
            style={{ color: primaryColor }}
          >
            We're Getting Married
          </p>

          <h1
            className="text-6xl md:text-8xl mb-4"
            style={{ fontFamily: 'Great Vibes, cursive', color: primaryColor }}
          >
            {invitation.groom_name}
          </h1>

          <p className="text-4xl my-4" style={{ color: primaryColor }}>♥</p>

          <h1
            className="text-6xl md:text-8xl mb-12"
            style={{ fontFamily: 'Great Vibes, cursive', color: primaryColor }}
          >
            {invitation.bride_name}
          </h1>

          <p className="text-lg" style={{ color: '#4a3f3f' }}>
            {formatThaiDate(invitation.event_date)}
          </p>
        </div>
      </div>

      {/* Cover Image */}
      {invitation.cover_image_url && (
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div
            className="relative p-4 rounded-full overflow-hidden mx-auto"
            style={{ maxWidth: '500px' }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
              }}
            />
            <img
              src={invitation.cover_image_url}
              alt="Wedding"
              className="relative rounded-full aspect-square object-cover"
            />
          </div>
        </div>
      )}

      {/* Countdown */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <Card className="bg-white/80 backdrop-blur border-none shadow-xl">
          <CardContent className="p-8">
            <p
              className="text-center text-sm tracking-widest mb-6"
              style={{ color: primaryColor }}
            >
              ♥ Save The Date ♥
            </p>

            <div className="grid grid-cols-4 gap-4">
              {[
                { value: countdown.days, label: 'วัน' },
                { value: countdown.hours, label: 'ชั่วโมง' },
                { value: countdown.minutes, label: 'นาที' },
                { value: countdown.seconds, label: 'วินาที' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div
                    className="aspect-square rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <p
                      className="text-3xl md:text-4xl"
                      style={{ fontFamily: 'Great Vibes, cursive', color: primaryColor }}
                    >
                      {item.value}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message */}
      {invitation.message && (
        <div className="max-w-2xl mx-auto px-4 mb-16 text-center">
          <p
            className="text-lg leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: 'Lato, sans-serif', color: '#4a3f3f' }}
          >
            {invitation.message}
          </p>
        </div>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mb-16">
          <h2
            className="text-center text-4xl mb-8"
            style={{ fontFamily: 'Great Vibes, cursive', color: primaryColor }}
          >
            Our Love Story
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group overflow-hidden rounded-2xl shadow-lg"
              >
                <img
                  src={img.image_url}
                  alt={img.caption || ''}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.caption && (
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4 text-white text-center"
                    style={{ background: `linear-gradient(to top, ${primaryColor}cc, transparent)` }}
                  >
                    <p className="text-sm">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      <div className="max-w-2xl mx-auto px-4 mb-16">
        <h2
          className="text-center text-4xl mb-8"
          style={{ fontFamily: 'Great Vibes, cursive', color: primaryColor }}
        >
          กำหนดการ
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {invitation.ceremony_time && (
            <Card className="bg-white/80 backdrop-blur border-none">
              <CardContent className="p-6 text-center">
                <Clock className="w-6 h-6 mx-auto mb-3" style={{ color: primaryColor }} />
                <p className="font-medium mb-1">พิธีการ</p>
                <p className="text-gray-600">{formatTime(invitation.ceremony_time)}</p>
              </CardContent>
            </Card>
          )}
          {invitation.reception_time && (
            <Card className="bg-white/80 backdrop-blur border-none">
              <CardContent className="p-6 text-center">
                <Clock className="w-6 h-6 mx-auto mb-3" style={{ color: primaryColor }} />
                <p className="font-medium mb-1">เลี้ยงรับรอง</p>
                <p className="text-gray-600">{formatTime(invitation.reception_time)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Venue */}
      {(invitation.venue_name || invitation.venue_address) && (
        <div className="max-w-2xl mx-auto px-4 mb-16 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-4" style={{ color: primaryColor }} />
          <h2
            className="text-4xl mb-6"
            style={{ fontFamily: 'Great Vibes, cursive', color: primaryColor }}
          >
            สถานที่จัดงาน
          </h2>

          {invitation.venue_name && (
            <p className="text-xl mb-2">{invitation.venue_name}</p>
          )}
          {invitation.venue_address && (
            <p className="text-gray-600 whitespace-pre-wrap mb-6">
              {invitation.venue_address}
            </p>
          )}

          {invitation.google_maps_url && (
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              style={{ borderColor: primaryColor, color: primaryColor }}
              asChild
            >
              <a href={invitation.google_maps_url} target="_blank" rel="noopener noreferrer">
                <Navigation className="w-4 h-4" />
                นำทาง
              </a>
            </Button>
          )}

          {invitation.google_maps_embed_url && (
            <div className="mt-6 aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src={invitation.google_maps_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      {/* RSVP */}
      {rsvpEnabled && (
        <div className="max-w-xl mx-auto px-4 mb-16">
          <Card className="bg-white/80 backdrop-blur border-none shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Users className="w-8 h-8 mx-auto mb-2" style={{ color: primaryColor }} />
                <h2
                  className="text-3xl"
                  style={{ fontFamily: 'Great Vibes, cursive', color: primaryColor }}
                >
                  ตอบรับเข้าร่วมงาน
                </h2>
              </div>

              {rsvpSubmitted ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Check className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">ขอบคุณค่ะ/ครับ</h3>
                  <p className="text-gray-500">เราได้รับการตอบรับของท่านแล้ว</p>
                </div>
              ) : showRsvpForm ? (
                <form onSubmit={onSubmitRsvp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>ชื่อ-นามสกุล *</Label>
                    <Input
                      value={rsvpForm.guest_name}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_name: e.target.value })}
                      required
                      className="rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>เบอร์โทรศัพท์</Label>
                    <Input
                      value={rsvpForm.guest_phone}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_phone: e.target.value })}
                      className="rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ท่านจะเข้าร่วมงานหรือไม่? *</Label>
                    <RadioGroup
                      value={rsvpForm.attending}
                      onValueChange={value => setRsvpForm({ ...rsvpForm, attending: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">ยินดีเข้าร่วม ♥</Label>
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
                        onChange={e => setRsvpForm({ ...rsvpForm, guest_count: parseInt(e.target.value) || 1 })}
                        className="rounded-full"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>ข้อความถึงคู่บ่าวสาว</Label>
                    <Textarea
                      value={rsvpForm.message}
                      onChange={e => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                      rows={3}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setShowRsvpForm(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-full"
                      disabled={isSubmitting}
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      ส่งการตอบรับ
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <Button
                    onClick={() => setShowRsvpForm(true)}
                    size="lg"
                    className="rounded-full gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Heart className="w-4 h-4" />
                    ตอบรับเข้าร่วมงาน
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="py-12 text-center">
        <Heart className="w-6 h-6 mx-auto mb-4" style={{ color: primaryColor }} />
        {profile?.studio_name && (
          <p className="text-sm text-gray-500">
            Made with love by {profile.studio_name}
          </p>
        )}
      </div>
    </div>
  );
}
