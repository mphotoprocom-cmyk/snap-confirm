import { WeddingInvitation } from '@/hooks/useWeddingInvitations';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MapPin, Calendar, Clock, Navigation, Users, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface ClassicTemplateProps {
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

export function ClassicTemplate({
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
}: ClassicTemplateProps) {
  const themeColor = invitation.theme_color || '#c9a227';

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
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Decorative top border */}
      <div
        className="h-2"
        style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)` }}
      />

      {/* Hero Section */}
      <div className="relative py-20 px-4">
        {/* Corner decorations */}
        <div
          className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 opacity-50"
          style={{ borderColor: themeColor }}
        />
        <div
          className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 opacity-50"
          style={{ borderColor: themeColor }}
        />
        <div
          className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 opacity-50"
          style={{ borderColor: themeColor }}
        />
        <div
          className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 opacity-50"
          style={{ borderColor: themeColor }}
        />

        <div className="max-w-2xl mx-auto text-center">
          <p
            className="text-sm tracking-[0.4em] mb-6"
            style={{ color: themeColor, fontFamily: 'Cormorant Garamond, serif' }}
          >
            THE WEDDING OF
          </p>

          <h1
            className="text-5xl md:text-7xl mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a2e' }}
          >
            {invitation.groom_name}
          </h1>

          <div
            className="flex items-center justify-center gap-4 my-6"
            style={{ color: themeColor }}
          >
            <div className="w-16 h-px" style={{ background: themeColor }} />
            <span className="text-3xl">&</span>
            <div className="w-16 h-px" style={{ background: themeColor }} />
          </div>

          <h1
            className="text-5xl md:text-7xl mb-8"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a2e' }}
          >
            {invitation.bride_name}
          </h1>

          <p
            className="text-lg tracking-wider"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#666' }}
          >
            {formatThaiDate(invitation.event_date)}
          </p>
        </div>
      </div>

      {/* Cover Image */}
      {invitation.cover_image_url && (
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="relative">
            <div
              className="absolute -inset-4 border opacity-30"
              style={{ borderColor: themeColor }}
            />
            <img
              src={invitation.cover_image_url}
              alt="Wedding"
              className="w-full aspect-[3/2] object-cover"
            />
          </div>
        </div>
      )}

      {/* Countdown */}
      <div className="max-w-2xl mx-auto px-4 mb-16">
        <div
          className="p-8 text-center border"
          style={{ borderColor: themeColor, background: 'rgba(201, 162, 39, 0.05)' }}
        >
          <p
            className="text-sm tracking-[0.3em] mb-6"
            style={{ color: themeColor }}
          >
            นับถอยหลังสู่วันสำคัญ
          </p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { value: countdown.days, label: 'วัน' },
              { value: countdown.hours, label: 'ชั่วโมง' },
              { value: countdown.minutes, label: 'นาที' },
              { value: countdown.seconds, label: 'วินาที' },
            ].map((item, i) => (
              <div key={i}>
                <p
                  className="text-4xl md:text-5xl font-light"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a2e' }}
                >
                  {item.value}
                </p>
                <p className="text-xs tracking-wider text-gray-500 mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {invitation.message && (
        <div className="max-w-2xl mx-auto px-4 mb-16 text-center">
          <div className="relative py-8">
            <div
              className="absolute left-1/2 top-0 transform -translate-x-1/2 text-4xl"
              style={{ color: themeColor }}
            >
              ❧
            </div>
            <p
              className="text-lg leading-relaxed whitespace-pre-wrap pt-8"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: '#444' }}
            >
              {invitation.message}
            </p>
          </div>
        </div>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mb-16">
          <h2
            className="text-center text-2xl mb-8 tracking-wider"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a2e' }}
          >
            Our Story
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative group overflow-hidden">
                <img
                  src={img.image_url}
                  alt={img.caption || ''}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-center px-4">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="max-w-2xl mx-auto px-4 mb-16">
        <div className="text-center mb-8">
          <Calendar className="w-6 h-6 mx-auto mb-4" style={{ color: themeColor }} />
          <h2
            className="text-2xl tracking-wider"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a2e' }}
          >
            กำหนดการ
          </h2>
        </div>

        {(invitation.ceremony_time || invitation.reception_time) && (
          <div className="grid grid-cols-2 gap-6">
            {invitation.ceremony_time && (
              <div
                className="p-6 text-center border"
                style={{ borderColor: themeColor }}
              >
                <Clock className="w-5 h-5 mx-auto mb-3" style={{ color: themeColor }} />
                <p className="font-medium mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  พิธีการ
                </p>
                <p className="text-gray-600">{formatTime(invitation.ceremony_time)}</p>
              </div>
            )}
            {invitation.reception_time && (
              <div
                className="p-6 text-center border"
                style={{ borderColor: themeColor }}
              >
                <Clock className="w-5 h-5 mx-auto mb-3" style={{ color: themeColor }} />
                <p className="font-medium mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  เลี้ยงรับรอง
                </p>
                <p className="text-gray-600">{formatTime(invitation.reception_time)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Venue */}
      {(invitation.venue_name || invitation.venue_address) && (
        <div className="max-w-2xl mx-auto px-4 mb-16">
          <div className="text-center mb-8">
            <MapPin className="w-6 h-6 mx-auto mb-4" style={{ color: themeColor }} />
            <h2
              className="text-2xl tracking-wider"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a2e' }}
            >
              สถานที่จัดงาน
            </h2>
          </div>

          <div className="text-center">
            {invitation.venue_name && (
              <p
                className="text-xl mb-2"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                {invitation.venue_name}
              </p>
            )}
            {invitation.venue_address && (
              <p className="text-gray-600 whitespace-pre-wrap mb-6">
                {invitation.venue_address}
              </p>
            )}

            {invitation.google_maps_url && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={invitation.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <Navigation className="w-4 h-4" />
                  นำทาง
                </a>
              </Button>
            )}

            {invitation.google_maps_embed_url && (
              <div className="mt-6 aspect-video rounded-lg overflow-hidden border">
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
        </div>
      )}

      {/* RSVP Section */}
      {rsvpEnabled && (
        <div className="max-w-xl mx-auto px-4 mb-16">
          <Card className="border" style={{ borderColor: themeColor }}>
            <CardHeader className="text-center">
              <Users className="w-6 h-6 mx-auto mb-2" style={{ color: themeColor }} />
              <CardTitle
                className="text-2xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>เบอร์โทรศัพท์</Label>
                    <Input
                      value={rsvpForm.guest_phone}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_phone: e.target.value })}
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
                        onChange={e => setRsvpForm({ ...rsvpForm, guest_count: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>ข้อความถึงคู่บ่าวสาว</Label>
                    <Textarea
                      value={rsvpForm.message}
                      onChange={e => setRsvpForm({ ...rsvpForm, message: e.target.value })}
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
                      disabled={isSubmitting}
                      style={{ backgroundColor: themeColor }}
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
                    style={{ backgroundColor: themeColor }}
                  >
                    ตอบรับเข้าร่วมงาน
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-12 border-t">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-px bg-gray-300" />
          <span style={{ color: themeColor }}>❧</span>
          <div className="w-12 h-px bg-gray-300" />
        </div>
        {profile?.studio_name && (
          <p className="text-sm text-gray-500">
            Wedding Invitation by <span className="font-medium">{profile.studio_name}</span>
          </p>
        )}
      </div>
    </div>
  );
}
