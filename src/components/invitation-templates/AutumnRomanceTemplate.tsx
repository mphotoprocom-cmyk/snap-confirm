import { WeddingInvitation, TimelineEvent, AccommodationLink } from '@/hooks/useWeddingInvitations';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MapPin, Clock, Navigation, Check, Loader2, Heart, Mail, Phone, ChevronDown, Flower2, UtensilsCrossed, Camera, Music, Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageGallery } from './ImageGallery';

interface InvitationImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

interface AutumnRomanceTemplateProps {
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

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  ceremony: <Heart className="w-5 h-5" />,
  cocktail: <Wine className="w-5 h-5" />,
  photo: <Camera className="w-5 h-5" />,
  dinner: <UtensilsCrossed className="w-5 h-5" />,
  party: <Music className="w-5 h-5" />,
  default: <Clock className="w-5 h-5" />,
};

export function AutumnRomanceTemplate({
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
}: AutumnRomanceTemplateProps) {
  const themeColor = invitation.theme_color || '#c4662b';
  const timelineEvents = (invitation.timeline_events || []) as TimelineEvent[];
  const dressCodeColors = (invitation.dress_code_colors || []) as string[];
  const accommodationLinks = (invitation.accommodation_links || []) as AccommodationLink[];

  const formatDate = (date: string) => {
    const d = new Date(date);
    return {
      month: format(d, 'MMMM', { locale: th }).toUpperCase(),
      day: format(d, 'd'),
      year: (d.getFullYear() + 543).toString(),
      weekday: format(d, 'EEEE', { locale: th }),
    };
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes} น.`;
  };

  const dateInfo = formatDate(invitation.event_date);

  // Floral SVG decoration
  const FloralCorner = ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="8" fill={themeColor} opacity="0.3" />
      <circle cx="40" cy="12" r="5" fill={themeColor} opacity="0.4" />
      <circle cx="12" cy="40" r="6" fill={themeColor} opacity="0.2" />
      <circle cx="55" cy="25" r="4" fill={themeColor} opacity="0.3" />
      <circle cx="25" cy="55" r="5" fill={themeColor} opacity="0.2" />
      <path d="M10 10 Q30 5 50 15 Q35 25 10 10Z" fill={themeColor} opacity="0.15" />
      <path d="M5 30 Q20 20 35 30 Q20 40 5 30Z" fill={themeColor} opacity="0.1" />
    </svg>
  );

  const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="text-center mb-8">
      <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: themeColor }}>
        ─── ✿ ───
      </p>
      <h2
        className="text-4xl md:text-5xl mb-2"
        style={{ fontFamily: 'Great Vibes, cursive', color: themeColor }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm tracking-wider uppercase" style={{ color: '#8a7060' }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#faf5ef', fontFamily: 'Lato, sans-serif' }}>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Cover image as background */}
        {invitation.cover_image_url && (
          <div className="w-full aspect-[3/4] md:aspect-[16/10] relative">
            <img
              src={invitation.cover_image_url}
              alt="Wedding"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
          </div>
        )}

        {/* Hero content overlay */}
        <div className="relative px-4 py-12" style={{ background: 'linear-gradient(180deg, #faf5ef 0%, #f5ebe0 100%)' }}>
          {/* Floral decorations */}
          <FloralCorner className="absolute top-0 right-0 w-28 h-28 opacity-60" />
          <FloralCorner className="absolute top-0 left-0 w-28 h-28 opacity-60 -scale-x-100" />

          <div className="max-w-md mx-auto text-center">
            {/* We Do */}
            <div className="mb-6">
              <p
                className="text-5xl md:text-6xl"
                style={{ fontFamily: 'Great Vibes, cursive', color: themeColor }}
              >
                we{' '}
                <Heart
                  className="inline w-8 h-8 md:w-10 md:h-10 -mt-2"
                  style={{ color: themeColor }}
                  fill={themeColor}
                />
                {' '}do
              </p>
            </div>

            <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#8a7060' }}>
              ขอเชิญร่วมเป็นเกียรติในงานแต่งงานของ
            </p>

            {/* Couple Names */}
            <h1
              className="text-4xl md:text-5xl mb-1"
              style={{ fontFamily: 'Great Vibes, cursive', color: '#4a3728' }}
            >
              {invitation.groom_name}
            </h1>
            <p className="text-2xl my-2" style={{ fontFamily: 'Great Vibes, cursive', color: themeColor }}>
              and
            </p>
            <h1
              className="text-4xl md:text-5xl mb-8"
              style={{ fontFamily: 'Great Vibes, cursive', color: '#4a3728' }}
            >
              {invitation.bride_name}
            </h1>

            {/* Date Display */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <p className="text-xs tracking-wider uppercase" style={{ color: '#8a7060' }}>
                  {dateInfo.month}
                </p>
              </div>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: themeColor }}
              >
                {dateInfo.day}
              </div>
              <div className="text-center">
                <p className="text-xs tracking-wider" style={{ color: '#8a7060' }}>
                  {formatTime(invitation.event_time) || dateInfo.weekday}
                </p>
              </div>
            </div>

            {/* Scroll indicator */}
            <ChevronDown className="w-6 h-6 mx-auto animate-bounce" style={{ color: themeColor }} />
          </div>
        </div>
      </section>

      {/* ===== COUNTDOWN SECTION ===== */}
      <section className="py-16 px-4" style={{ background: '#f5ebe0' }}>
        <div className="max-w-lg mx-auto">
          <SectionTitle title="Countdown" subtitle="นับถอยหลังสู่วันสำคัญ" />

          <div className="flex items-center justify-center gap-3">
            {[
              { value: countdown.days, label: 'วัน' },
              { value: countdown.hours, label: 'ชั่วโมง' },
              { value: countdown.minutes, label: 'นาที' },
              { value: countdown.seconds, label: 'วินาที' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-center">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mb-1"
                    style={{ backgroundColor: themeColor }}
                  >
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {String(item.value).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[10px] tracking-wider uppercase" style={{ color: '#8a7060' }}>
                    {item.label}
                  </p>
                </div>
                {i < 3 && (
                  <span className="text-2xl font-bold -mt-5" style={{ color: themeColor }}>:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY (between countdown and venue) ===== */}
      {images.length > 0 && (
        <section className="py-8">
          <ImageGallery images={images} themeColor={themeColor} variant="classic" />
        </section>
      )}

      {/* ===== VENUE SECTION ===== */}
      {(invitation.venue_name || invitation.venue_address) && (
        <section className="py-16 px-4" style={{ background: '#faf5ef' }}>
          <div className="max-w-lg mx-auto">
            <SectionTitle title="Venue" subtitle={invitation.venue_name || 'สถานที่จัดงาน'} />

            {invitation.google_maps_url && (
              <div className="text-center mb-6">
                <Button
                  className="rounded-full gap-2 px-6"
                  style={{ backgroundColor: themeColor }}
                  asChild
                >
                  <a href={invitation.google_maps_url} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4" />
                    Google Maps
                  </a>
                </Button>
              </div>
            )}

            {invitation.venue_address && (
              <p className="text-center text-sm mb-6" style={{ color: '#8a7060' }}>
                {invitation.venue_address}
              </p>
            )}

            {invitation.google_maps_embed_url && (
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
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
        </section>
      )}

      {/* ===== THE DAY - TIMELINE ===== */}
      {timelineEvents.length > 0 && (
        <section className="py-16 px-4" style={{ background: '#f5ebe0' }}>
          <div className="max-w-md mx-auto">
            <SectionTitle title="The Day" subtitle="กำหนดการ" />

            <div className="space-y-6">
              {timelineEvents.map((event, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                  >
                    {TIMELINE_ICONS[event.icon || 'default'] || TIMELINE_ICONS.default}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: themeColor }}>
                      {event.time}
                    </p>
                    <p className="text-sm" style={{ color: '#4a3728' }}>
                      {event.title}
                    </p>
                  </div>
                  {/* Floral accent */}
                  <Flower2 className="w-5 h-5 opacity-30" style={{ color: themeColor }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SCHEDULE (ceremony/reception if no timeline) ===== */}
      {timelineEvents.length === 0 && (invitation.ceremony_time || invitation.reception_time) && (
        <section className="py-16 px-4" style={{ background: '#f5ebe0' }}>
          <div className="max-w-md mx-auto">
            <SectionTitle title="The Day" subtitle="กำหนดการ" />
            <div className="space-y-4">
              {invitation.ceremony_time && (
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                  >
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: themeColor }}>
                      {formatTime(invitation.ceremony_time)}
                    </p>
                    <p className="text-sm" style={{ color: '#4a3728' }}>พิธีมงคลสมรส</p>
                  </div>
                </div>
              )}
              {invitation.reception_time && (
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                  >
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: themeColor }}>
                      {formatTime(invitation.reception_time)}
                    </p>
                    <p className="text-sm" style={{ color: '#4a3728' }}>งานเลี้ยงรับรอง</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== THE DETAILS ===== */}
      {(invitation.dress_code || invitation.accommodation_info) && (
        <section className="py-16 px-4" style={{ background: '#faf5ef' }}>
          <div className="max-w-md mx-auto">
            <SectionTitle title="Details" subtitle="รายละเอียด" />

            {/* Dress Code */}
            {invitation.dress_code && (
              <div className="mb-8 text-center">
                <p className="text-xs tracking-[0.2em] uppercase font-bold mb-3" style={{ color: themeColor }}>
                  Dress Code
                </p>
                {dressCodeColors.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {dressCodeColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm" style={{ color: '#4a3728' }}>
                  {invitation.dress_code}
                </p>
              </div>
            )}

            {/* Accommodation */}
            {invitation.accommodation_info && (
              <div className="text-center">
                <p className="text-xs tracking-[0.2em] uppercase font-bold mb-3" style={{ color: themeColor }}>
                  Accommodation
                </p>
                <p className="text-sm mb-4 whitespace-pre-wrap" style={{ color: '#4a3728' }}>
                  {invitation.accommodation_info}
                </p>
                {accommodationLinks.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {accommodationLinks.map((link, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        style={{ borderColor: themeColor, color: themeColor }}
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== MESSAGE ===== */}
      {invitation.message && (
        <section className="py-16 px-4" style={{ background: '#f5ebe0' }}>
          <div className="max-w-md mx-auto text-center">
            <p
              className="text-lg leading-relaxed whitespace-pre-wrap italic"
              style={{ fontFamily: 'Lato, sans-serif', color: '#4a3728' }}
            >
              "{invitation.message}"
            </p>
          </div>
        </section>
      )}

      {/* ===== WEDDING REGISTRY ===== */}
      {(invitation.registry_info || invitation.registry_url) && (
        <section className="py-16 px-4" style={{ background: '#faf5ef' }}>
          <div className="max-w-md mx-auto text-center">
            <SectionTitle title="Wedding Registry" />

            {invitation.registry_info && (
              <p className="text-sm mb-6 whitespace-pre-wrap" style={{ color: '#4a3728' }}>
                {invitation.registry_info}
              </p>
            )}

            {invitation.registry_url && (
              <Button
                className="rounded-full gap-2 px-6"
                style={{ backgroundColor: themeColor }}
                asChild
              >
                <a href={invitation.registry_url} target="_blank" rel="noopener noreferrer">
                  ดูรายการของขวัญ
                </a>
              </Button>
            )}

            <p
              className="text-3xl mt-8"
              style={{ fontFamily: 'Great Vibes, cursive', color: themeColor }}
            >
              thank you
            </p>
          </div>
        </section>
      )}

      {/* ===== RSVP SECTION ===== */}
      {rsvpEnabled && (
        <section className="py-16 px-4" style={{ background: 'linear-gradient(180deg, #f5ebe0 0%, #faf5ef 100%)' }}>
          <div className="max-w-md mx-auto">
            {/* Big RSVP Typography */}
            <div className="text-center mb-6">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-2"
                style={{ fontFamily: 'Great Vibes, cursive', color: themeColor, fontSize: '1.2rem' }}
              >
                please
              </p>
              <h2
                className="text-7xl md:text-8xl font-black leading-none mb-2"
                style={{ color: themeColor, fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em' }}
              >
                RSVP
              </h2>
              {invitation.rsvp_deadline && (
                <p className="text-xs" style={{ color: '#8a7060' }}>
                  กรุณาตอบรับภายใน {format(new Date(invitation.rsvp_deadline), 'd MMMM yyyy', { locale: th })}
                </p>
              )}
            </div>

            {rsvpSubmitted ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  <Check className="w-8 h-8" style={{ color: themeColor }} />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: '#4a3728' }}>
                  ขอบคุณสำหรับการตอบรับ
                </h3>
                <p className="text-sm" style={{ color: '#8a7060' }}>
                  เราได้รับการตอบรับของท่านแล้ว
                </p>
              </div>
            ) : showRsvpForm ? (
              <div
                className="rounded-2xl p-6 shadow-lg"
                style={{ background: 'white' }}
              >
                <form onSubmit={onSubmitRsvp} className="space-y-4">
                  <div className="space-y-2">
                    <Label style={{ color: '#4a3728' }}>ชื่อ-นามสกุล *</Label>
                    <Input
                      value={rsvpForm.guest_name}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_name: e.target.value })}
                      required
                      className="rounded-full border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label style={{ color: '#4a3728' }}>เบอร์โทรศัพท์</Label>
                    <Input
                      value={rsvpForm.guest_phone}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_phone: e.target.value })}
                      className="rounded-full border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label style={{ color: '#4a3728' }}>ท่านจะเข้าร่วมงานหรือไม่? *</Label>
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
                      <Label style={{ color: '#4a3728' }}>จำนวนผู้เข้าร่วม</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={rsvpForm.guest_count}
                        onChange={e => setRsvpForm({ ...rsvpForm, guest_count: parseInt(e.target.value) || 1 })}
                        className="rounded-full border-gray-200"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label style={{ color: '#4a3728' }}>ข้อความถึงคู่บ่าวสาว</Label>
                    <Textarea
                      value={rsvpForm.message}
                      onChange={e => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                      rows={3}
                      className="rounded-xl border-gray-200"
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
                      className="flex-1 rounded-full text-white"
                      disabled={isSubmitting}
                      style={{ backgroundColor: themeColor }}
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      ส่งการตอบรับ
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={() => setShowRsvpForm(true)}
                  size="lg"
                  className="rounded-full gap-2 px-8 text-white shadow-lg"
                  style={{ backgroundColor: themeColor }}
                >
                  <ChevronDown className="w-4 h-4" />
                  RSVP
                </Button>
              </div>
            )}

            {/* Contact info */}
            {(invitation.contact_email || invitation.contact_phone) && (
              <div className="mt-8 text-center space-y-2">
                <p className="text-xs font-bold tracking-wider uppercase" style={{ color: themeColor }}>
                  {invitation.groom_name} & {invitation.bride_name}'s Wedding
                </p>
                {invitation.contact_email && (
                  <p className="text-xs flex items-center justify-center gap-1" style={{ color: '#8a7060' }}>
                    <Mail className="w-3 h-3" />
                    {invitation.contact_email}
                  </p>
                )}
                {invitation.contact_phone && (
                  <p className="text-xs flex items-center justify-center gap-1" style={{ color: '#8a7060' }}>
                    <Phone className="w-3 h-3" />
                    {invitation.contact_phone}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <section className="py-12 px-4 text-center" style={{ background: '#faf5ef' }}>
        <p
          className="text-sm tracking-wider mb-2"
          style={{ fontFamily: 'Lato, sans-serif', color: '#8a7060' }}
        >
          with love
        </p>
        <p
          className="text-3xl"
          style={{ fontFamily: 'Great Vibes, cursive', color: themeColor }}
        >
          {invitation.groom_name} & {invitation.bride_name}
        </p>
        {profile?.studio_name && (
          <p className="text-xs mt-6" style={{ color: '#c4b8a8' }}>
            Invitation by {profile.studio_name}
          </p>
        )}
      </section>
    </div>
  );
}
