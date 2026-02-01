import { WeddingInvitation } from '@/hooks/useWeddingInvitations';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MapPin, Clock, Navigation, Users, Check, Loader2 } from 'lucide-react';
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

interface MinimalTemplateProps {
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

export function MinimalTemplate({
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
}: MinimalTemplateProps) {
  const formatThaiDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear() + 543;
    return `${format(d, 'd MMMM', { locale: th })} ${year}`;
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero - Ultra Minimal */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-xs tracking-[0.3em] text-gray-400 mb-12">THE WEDDING OF</p>

        <h1
          className="text-6xl md:text-8xl font-extralight tracking-wider text-center"
          style={{ fontFamily: 'Bodoni Moda, serif' }}
        >
          {invitation.groom_name}
        </h1>

        <div className="my-8 text-gray-300 text-2xl">&</div>

        <h1
          className="text-6xl md:text-8xl font-extralight tracking-wider text-center"
          style={{ fontFamily: 'Bodoni Moda, serif' }}
        >
          {invitation.bride_name}
        </h1>

        <div className="mt-16 text-center">
          <p className="text-sm tracking-widest text-gray-400">
            {formatThaiDate(invitation.event_date)}
          </p>
        </div>
      </div>

      {/* Cover Image - Full Width */}
      {invitation.cover_image_url && (
        <div className="w-full">
          <img
            src={invitation.cover_image_url}
            alt="Wedding"
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Countdown - Simple */}
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-12 md:gap-24">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Sec' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p
                  className="text-5xl md:text-7xl font-extralight"
                  style={{ fontFamily: 'Bodoni Moda, serif' }}
                >
                  {String(item.value).padStart(2, '0')}
                </p>
                <p className="text-[10px] tracking-[0.3em] text-gray-400 mt-4 uppercase">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {invitation.message && (
        <div className="py-20 px-4 bg-gray-50">
          <div className="max-w-xl mx-auto text-center">
            <p
              className="text-lg leading-loose text-gray-600 font-light"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {invitation.message}
            </p>
          </div>
        </div>
      )}

      {/* Gallery - Masonry-like */}
      {images.length > 0 && (
        <ImageGallery images={images} themeColor="#1a1a1a" variant="minimal" />
      )}

      {/* Details - Grid */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          {/* Date */}
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-400 mb-4">DATE</p>
            <p className="text-lg font-light">{formatThaiDate(invitation.event_date)}</p>
          </div>

          {/* Time */}
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-400 mb-4">TIME</p>
            {invitation.ceremony_time && (
              <p className="text-lg font-light">
                Ceremony {formatTime(invitation.ceremony_time)}
              </p>
            )}
            {invitation.reception_time && (
              <p className="text-lg font-light">
                Reception {formatTime(invitation.reception_time)}
              </p>
            )}
          </div>

          {/* Venue */}
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-400 mb-4">VENUE</p>
            {invitation.venue_name && (
              <p className="text-lg font-light">{invitation.venue_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      {invitation.google_maps_embed_url && (
        <div className="aspect-[21/9]">
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

      {/* RSVP */}
      {rsvpEnabled && (
        <div className="py-24 px-4">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[10px] tracking-[0.3em] text-gray-400 mb-8">RSVP</p>

            {rsvpSubmitted ? (
              <div className="py-8">
                <Check className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-light">Thank you for responding</p>
              </div>
            ) : showRsvpForm ? (
              <form onSubmit={onSubmitRsvp} className="space-y-6 text-left">
                <div className="space-y-2">
                  <Label className="text-[10px] tracking-widest text-gray-400">NAME</Label>
                  <Input
                    value={rsvpForm.guest_name}
                    onChange={e => setRsvpForm({ ...rsvpForm, guest_name: e.target.value })}
                    required
                    className="border-0 border-b rounded-none px-0 focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] tracking-widest text-gray-400">PHONE</Label>
                  <Input
                    value={rsvpForm.guest_phone}
                    onChange={e => setRsvpForm({ ...rsvpForm, guest_phone: e.target.value })}
                    className="border-0 border-b rounded-none px-0 focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] tracking-widest text-gray-400">ATTENDING</Label>
                  <RadioGroup
                    value={rsvpForm.attending}
                    onValueChange={value => setRsvpForm({ ...rsvpForm, attending: value })}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="font-light">Accept</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="font-light">Decline</Label>
                    </div>
                  </RadioGroup>
                </div>

                {rsvpForm.attending === 'yes' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] tracking-widest text-gray-400">GUESTS</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={rsvpForm.guest_count}
                      onChange={e => setRsvpForm({ ...rsvpForm, guest_count: parseInt(e.target.value) || 1 })}
                      className="border-0 border-b rounded-none px-0 focus-visible:ring-0 w-20"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] tracking-widest text-gray-400">MESSAGE</Label>
                  <Textarea
                    value={rsvpForm.message}
                    onChange={e => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                    rows={3}
                    className="border-0 border-b rounded-none px-0 focus-visible:ring-0 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-8">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowRsvpForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setShowRsvpForm(true)}
                variant="outline"
                size="lg"
                className="border-gray-900"
              >
                Respond
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-12 text-center border-t">
        {profile?.studio_name && (
          <p className="text-[10px] tracking-[0.2em] text-gray-400">
            {profile.studio_name}
          </p>
        )}
      </div>
    </div>
  );
}
