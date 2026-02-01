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

interface LuxuryTemplateProps {
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

export function LuxuryTemplate({
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
}: LuxuryTemplateProps) {
  const goldColor = '#ffd700';
  const navyColor = '#0d0d1a';

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
    <div className="min-h-screen" style={{ background: navyColor }}>
      {/* Animated gradient border */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${goldColor}, transparent)`,
        }}
      />

      {/* Hero Section with Cover */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background image */}
        {invitation.cover_image_url && (
          <div className="absolute inset-0">
            <img
              src={invitation.cover_image_url}
              alt="Wedding"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d1a]/70 to-[#0d0d1a]" />
          </div>
        )}

        {/* Decorative frame */}
        <div className="absolute inset-8 md:inset-16 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2"
            style={{ borderColor: goldColor }}
          />
          <div
            className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2"
            style={{ borderColor: goldColor }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2"
            style={{ borderColor: goldColor }}
          />
          <div
            className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2"
            style={{ borderColor: goldColor }}
          />
          {/* Corner diamonds */}
          <div
            className="absolute top-0 left-0 w-3 h-3 transform -translate-x-1 -translate-y-1 rotate-45"
            style={{ backgroundColor: goldColor }}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 transform translate-x-1 -translate-y-1 rotate-45"
            style={{ backgroundColor: goldColor }}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 transform -translate-x-1 translate-y-1 rotate-45"
            style={{ backgroundColor: goldColor }}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 transform translate-x-1 translate-y-1 rotate-45"
            style={{ backgroundColor: goldColor }}
          />
        </div>

        {/* Content */}
        <div className="relative text-center px-4 py-20">
          <p
            className="text-xs tracking-[0.5em] mb-8"
            style={{ color: goldColor, fontFamily: 'Cinzel, serif' }}
          >
            ✦ THE WEDDING CELEBRATION OF ✦
          </p>

          <h1
            className="text-6xl md:text-8xl mb-4 text-white"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {invitation.groom_name}
          </h1>

          <div className="flex items-center justify-center gap-6 my-8">
            <div
              className="w-24 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${goldColor})` }}
            />
            <span className="text-4xl" style={{ color: goldColor }}>♦</span>
            <div
              className="w-24 h-px"
              style={{ background: `linear-gradient(270deg, transparent, ${goldColor})` }}
            />
          </div>

          <h1
            className="text-6xl md:text-8xl mb-12 text-white"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {invitation.bride_name}
          </h1>

          <p className="text-lg text-gray-300 tracking-wider">
            {formatThaiDate(invitation.event_date)}
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div
            className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2"
            style={{ borderColor: goldColor }}
          >
            <div className="w-1 h-2 rounded-full" style={{ backgroundColor: goldColor }} />
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 border" style={{ borderColor: `${goldColor}40` }}>
            <div className="absolute -inset-2 border" style={{ borderColor: `${goldColor}20` }} />

            <p
              className="text-center text-xs tracking-[0.4em] mb-8"
              style={{ color: goldColor }}
            >
              COUNTDOWN TO THE BIG DAY
            </p>

            <div className="grid grid-cols-4 gap-4 md:gap-8">
              {[
                { value: countdown.days, label: 'DAYS' },
                { value: countdown.hours, label: 'HOURS' },
                { value: countdown.minutes, label: 'MINUTES' },
                { value: countdown.seconds, label: 'SECONDS' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div
                    className="aspect-square flex items-center justify-center border mb-4"
                    style={{ borderColor: `${goldColor}40` }}
                  >
                    <p
                      className="text-4xl md:text-6xl font-light text-white"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      {item.value}
                    </p>
                  </div>
                  <p className="text-xs tracking-widest text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {invitation.message && (
        <div className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-px" style={{ backgroundColor: goldColor }} />
              <span className="text-2xl" style={{ color: goldColor }}>❧</span>
              <div className="w-16 h-px" style={{ backgroundColor: goldColor }} />
            </div>
            <p
              className="text-xl leading-relaxed whitespace-pre-wrap text-gray-300"
              style={{ fontFamily: 'EB Garamond, serif' }}
            >
              {invitation.message}
            </p>
          </div>
        </div>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p
              className="text-center text-xs tracking-[0.4em] mb-12"
              style={{ color: goldColor }}
            >
              ✦ OUR MOMENTS ✦
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className={`relative group overflow-hidden ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <div className="absolute inset-0 border border-transparent group-hover:border-[#ffd700] transition-colors z-10" />
                  <img
                    src={img.image_url}
                    alt={img.caption || ''}
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white text-sm">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-center text-xs tracking-[0.4em] mb-12"
            style={{ color: goldColor }}
          >
            ✦ SCHEDULE ✦
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {invitation.ceremony_time && (
              <div
                className="p-8 text-center border"
                style={{ borderColor: `${goldColor}40` }}
              >
                <Clock className="w-8 h-8 mx-auto mb-4" style={{ color: goldColor }} />
                <h3
                  className="text-xl mb-2 text-white"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  CEREMONY
                </h3>
                <p className="text-2xl text-gray-300">{formatTime(invitation.ceremony_time)}</p>
              </div>
            )}
            {invitation.reception_time && (
              <div
                className="p-8 text-center border"
                style={{ borderColor: `${goldColor}40` }}
              >
                <Clock className="w-8 h-8 mx-auto mb-4" style={{ color: goldColor }} />
                <h3
                  className="text-xl mb-2 text-white"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  RECEPTION
                </h3>
                <p className="text-2xl text-gray-300">{formatTime(invitation.reception_time)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Venue */}
      {(invitation.venue_name || invitation.venue_address) && (
        <div className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <MapPin className="w-8 h-8 mx-auto mb-4" style={{ color: goldColor }} />
            <h2
              className="text-2xl mb-6 text-white"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              VENUE
            </h2>

            {invitation.venue_name && (
              <p className="text-xl mb-2 text-white">{invitation.venue_name}</p>
            )}
            {invitation.venue_address && (
              <p className="text-gray-400 whitespace-pre-wrap mb-8">
                {invitation.venue_address}
              </p>
            )}

            {invitation.google_maps_url && (
              <Button
                variant="outline"
                className="gap-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#0d0d1a]"
                asChild
              >
                <a href={invitation.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <Navigation className="w-4 h-4" />
                  GET DIRECTIONS
                </a>
              </Button>
            )}

            {invitation.google_maps_embed_url && (
              <div className="mt-8 aspect-video border" style={{ borderColor: `${goldColor}40` }}>
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

      {/* RSVP */}
      {rsvpEnabled && (
        <div className="py-16 px-4">
          <div className="max-w-xl mx-auto">
            <div
              className="p-8 border"
              style={{ borderColor: `${goldColor}40`, background: 'rgba(255,215,0,0.02)' }}
            >
              <div className="text-center mb-8">
                <Users className="w-8 h-8 mx-auto mb-4" style={{ color: goldColor }} />
                <h2
                  className="text-2xl text-white"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  RSVP
                </h2>
                <p className="text-gray-400 mt-2">Kindly respond by the date requested</p>
              </div>

              {rsvpSubmitted ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${goldColor}20` }}
                  >
                    <Check className="w-8 h-8" style={{ color: goldColor }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white">Thank You</h3>
                  <p className="text-gray-400">We have received your response</p>
                </div>
              ) : showRsvpForm ? (
                <form onSubmit={onSubmitRsvp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Name *</Label>
                    <Input
                      value={rsvpForm.guest_name}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_name: e.target.value })}
                      required
                      className="bg-transparent border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Phone</Label>
                    <Input
                      value={rsvpForm.guest_phone}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_phone: e.target.value })}
                      className="bg-transparent border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Will you attend? *</Label>
                    <RadioGroup
                      value={rsvpForm.attending}
                      onValueChange={value => setRsvpForm({ ...rsvpForm, attending: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" className="border-gray-600" />
                        <Label htmlFor="yes" className="text-gray-300">Joyfully Accept</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" className="border-gray-600" />
                        <Label htmlFor="no" className="text-gray-300">Regretfully Decline</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {rsvpForm.attending === 'yes' && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Number of Guests</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={rsvpForm.guest_count}
                        onChange={e => setRsvpForm({ ...rsvpForm, guest_count: parseInt(e.target.value) || 1 })}
                        className="bg-transparent border-gray-600 text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-300">Message for the Couple</Label>
                    <Textarea
                      value={rsvpForm.message}
                      onChange={e => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                      rows={3}
                      className="bg-transparent border-gray-600 text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300"
                      onClick={() => setShowRsvpForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                      style={{ backgroundColor: goldColor, color: navyColor }}
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <Button
                    onClick={() => setShowRsvpForm(true)}
                    size="lg"
                    style={{ backgroundColor: goldColor, color: navyColor }}
                  >
                    RESPOND NOW
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-12 text-center border-t" style={{ borderColor: `${goldColor}20` }}>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-2xl" style={{ color: goldColor }}>♦</span>
        </div>
        {profile?.studio_name && (
          <p className="text-sm text-gray-500">
            Crafted with love by <span style={{ color: goldColor }}>{profile.studio_name}</span>
          </p>
        )}
      </div>
    </div>
  );
}
