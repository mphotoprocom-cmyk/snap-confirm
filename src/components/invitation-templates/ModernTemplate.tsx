import { WeddingInvitation } from '@/hooks/useWeddingInvitations';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MapPin, Calendar, Clock, Navigation, Users, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ModernTemplateProps {
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

export function ModernTemplate({
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
}: ModernTemplateProps) {
  const accentColor = invitation.theme_color || '#b8860b';

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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Split Layout */}
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="md:w-1/2 relative">
          {invitation.cover_image_url ? (
            <img
              src={invitation.cover_image_url}
              alt="Wedding"
              className="w-full h-64 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-full bg-gray-100" />
          )}
        </div>

        {/* Right side - Content */}
        <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16">
          <div className="text-center">
            <div className="w-16 h-0.5 mx-auto mb-8" style={{ backgroundColor: accentColor }} />

            <p className="text-xs tracking-[0.4em] text-gray-400 mb-4">
              THE WEDDING OF
            </p>

            <h1
              className="text-5xl md:text-6xl tracking-wide mb-2"
              style={{ fontFamily: 'Italiana, serif' }}
            >
              {invitation.groom_name}
            </h1>

            <p className="text-3xl my-4" style={{ color: accentColor }}>&</p>

            <h1
              className="text-5xl md:text-6xl tracking-wide mb-8"
              style={{ fontFamily: 'Italiana, serif' }}
            >
              {invitation.bride_name}
            </h1>

            <div className="w-16 h-0.5 mx-auto mb-8" style={{ backgroundColor: accentColor }} />

            <p className="text-lg text-gray-600 tracking-wider">
              {formatThaiDate(invitation.event_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Countdown - Minimal */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Seconds' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p
                  className="text-5xl md:text-7xl font-light"
                  style={{ fontFamily: 'Italiana, serif' }}
                >
                  {item.value}
                </p>
                <p className="text-xs tracking-[0.2em] text-gray-400 mt-2 uppercase">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {invitation.message && (
        <div className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="text-xl leading-relaxed text-gray-600 whitespace-pre-wrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {invitation.message}
            </p>
          </div>
        </div>
      )}

      {/* Gallery - Grid */}
      {images.length > 0 && (
        <div className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl text-center mb-12 tracking-wider"
              style={{ fontFamily: 'Italiana, serif' }}
            >
              Our Gallery
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative group overflow-hidden aspect-square">
                  <img
                    src={img.image_url}
                    alt={img.caption || ''}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event Details - Two Column */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Schedule */}
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-4" style={{ color: accentColor }} />
              <h3
                className="text-2xl mb-8 tracking-wider"
                style={{ fontFamily: 'Italiana, serif' }}
              >
                Schedule
              </h3>

              <div className="space-y-6">
                {invitation.ceremony_time && (
                  <div>
                    <p className="text-sm text-gray-400 tracking-wider uppercase">Ceremony</p>
                    <p className="text-xl">{formatTime(invitation.ceremony_time)}</p>
                  </div>
                )}
                {invitation.reception_time && (
                  <div>
                    <p className="text-sm text-gray-400 tracking-wider uppercase">Reception</p>
                    <p className="text-xl">{formatTime(invitation.reception_time)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Venue */}
            {(invitation.venue_name || invitation.venue_address) && (
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-4" style={{ color: accentColor }} />
                <h3
                  className="text-2xl mb-8 tracking-wider"
                  style={{ fontFamily: 'Italiana, serif' }}
                >
                  Venue
                </h3>

                {invitation.venue_name && (
                  <p className="text-xl mb-2">{invitation.venue_name}</p>
                )}
                {invitation.venue_address && (
                  <p className="text-gray-500 whitespace-pre-wrap text-sm">
                    {invitation.venue_address}
                  </p>
                )}

                {invitation.google_maps_url && (
                  <Button
                    variant="outline"
                    className="mt-6 gap-2"
                    style={{ borderColor: accentColor, color: accentColor }}
                    asChild
                  >
                    <a href={invitation.google_maps_url} target="_blank" rel="noopener noreferrer">
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {invitation.google_maps_embed_url && (
            <div className="mt-12 aspect-[21/9] overflow-hidden">
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

      {/* RSVP */}
      {rsvpEnabled && (
        <div className="py-20 px-4 bg-black text-white">
          <div className="max-w-xl mx-auto text-center">
            <Users className="w-8 h-8 mx-auto mb-4" style={{ color: accentColor }} />
            <h2
              className="text-3xl mb-8 tracking-wider"
              style={{ fontFamily: 'Italiana, serif' }}
            >
              RSVP
            </h2>

            {rsvpSubmitted ? (
              <div className="py-8">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Check className="w-8 h-8" style={{ color: accentColor }} />
                </div>
                <h3 className="text-lg mb-2">Thank You</h3>
                <p className="text-gray-400">We've received your response</p>
              </div>
            ) : showRsvpForm ? (
              <form onSubmit={onSubmitRsvp} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label className="text-gray-300">Name *</Label>
                  <Input
                    value={rsvpForm.guest_name}
                    onChange={e => setRsvpForm({ ...rsvpForm, guest_name: e.target.value })}
                    required
                    className="bg-transparent border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Phone</Label>
                  <Input
                    value={rsvpForm.guest_phone}
                    onChange={e => setRsvpForm({ ...rsvpForm, guest_phone: e.target.value })}
                    className="bg-transparent border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Attending? *</Label>
                  <RadioGroup
                    value={rsvpForm.attending}
                    onValueChange={value => setRsvpForm({ ...rsvpForm, attending: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" className="border-gray-600" />
                      <Label htmlFor="yes" className="text-gray-300">Yes, I'll be there</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" className="border-gray-600" />
                      <Label htmlFor="no" className="text-gray-300">Sorry, can't make it</Label>
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
                      className="bg-transparent border-gray-700 text-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-gray-300">Message</Label>
                  <Textarea
                    value={rsvpForm.message}
                    onChange={e => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                    rows={3}
                    className="bg-transparent border-gray-700 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300"
                    onClick={() => setShowRsvpForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                    style={{ backgroundColor: accentColor, color: 'black' }}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setShowRsvpForm(true)}
                size="lg"
                style={{ backgroundColor: accentColor, color: 'black' }}
              >
                RSVP NOW
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-12 text-center">
        <div className="w-16 h-0.5 mx-auto mb-6" style={{ backgroundColor: accentColor }} />
        {profile?.studio_name && (
          <p className="text-sm text-gray-400">
            Designed by {profile.studio_name}
          </p>
        )}
      </div>
    </div>
  );
}
