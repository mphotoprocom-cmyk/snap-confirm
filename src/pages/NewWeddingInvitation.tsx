import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { useCreateInvitation } from '@/hooks/useWeddingInvitations';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';

export default function NewWeddingInvitation() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const createInvitation = useCreateInvitation();
  const { data: bookings } = useBookings();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Filter wedding bookings only
  const weddingBookings = bookings?.filter(b => b.job_type === 'wedding') || [];

  const [formData, setFormData] = useState({
    booking_id: '',
    groom_name: '',
    bride_name: '',
    event_date: '',
    event_time: '',
    ceremony_time: '',
    reception_time: '',
    venue_name: '',
    venue_address: '',
    google_maps_url: '',
    message: '',
    rsvp_enabled: true,
    rsvp_deadline: '',
    theme_color: '#d4af37',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleBookingSelect = (bookingId: string) => {
    const booking = weddingBookings.find(b => b.id === bookingId);
    if (booking) {
      setFormData(prev => ({
        ...prev,
        booking_id: bookingId,
        event_date: booking.event_date,
        event_time: booking.time_start || '',
        venue_name: booking.location || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createInvitation.mutateAsync({
        ...formData,
        booking_id: formData.booking_id || null,
        event_time: formData.event_time || null,
        ceremony_time: formData.ceremony_time || null,
        reception_time: formData.reception_time || null,
        venue_name: formData.venue_name || null,
        venue_address: formData.venue_address || null,
        google_maps_url: formData.google_maps_url || null,
        message: formData.message || null,
        rsvp_deadline: formData.rsvp_deadline || null,
      });

      navigate(`/invitations/${result.id}`);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link to="/invitations">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-pink-500" />
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>สร้างการ์ดเชิญใหม่</h1>
          <p className={isDark ? 'text-white/50' : 'text-gray-500'}>กรอกข้อมูลเพื่อสร้างการ์ดเชิญงานแต่งออนไลน์</p>
        </div>
      </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Link to Booking */}
          {weddingBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">เชื่อมกับ Booking</CardTitle>
                <CardDescription>เลือก Booking งานแต่งที่มีอยู่เพื่อดึงข้อมูลอัตโนมัติ (ไม่บังคับ)</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={formData.booking_id} onValueChange={handleBookingSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Booking (ไม่บังคับ)" />
                  </SelectTrigger>
                  <SelectContent>
                    {weddingBookings.map(booking => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.client_name} - {booking.event_date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Couple Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลคู่บ่าวสาว</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groom_name">ชื่อเจ้าบ่าว *</Label>
                  <Input
                    id="groom_name"
                    value={formData.groom_name}
                    onChange={e => setFormData(prev => ({ ...prev, groom_name: e.target.value }))}
                    placeholder="ชื่อเจ้าบ่าว"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_name">ชื่อเจ้าสาว *</Label>
                  <Input
                    id="bride_name"
                    value={formData.bride_name}
                    onChange={e => setFormData(prev => ({ ...prev, bride_name: e.target.value }))}
                    placeholder="ชื่อเจ้าสาว"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายละเอียดงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">วันที่จัดงาน *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={e => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_time">เวลางาน</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={e => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceremony_time">เวลาพิธีการ</Label>
                  <Input
                    id="ceremony_time"
                    type="time"
                    value={formData.ceremony_time}
                    onChange={e => setFormData(prev => ({ ...prev, ceremony_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reception_time">เวลาเลี้ยงรับรอง</Label>
                  <Input
                    id="reception_time"
                    type="time"
                    value={formData.reception_time}
                    onChange={e => setFormData(prev => ({ ...prev, reception_time: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สถานที่จัดงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name">ชื่อสถานที่</Label>
                <Input
                  id="venue_name"
                  value={formData.venue_name}
                  onChange={e => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                  placeholder="เช่น โรงแรม ABC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue_address">ที่อยู่</Label>
                <Textarea
                  id="venue_address"
                  value={formData.venue_address}
                  onChange={e => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                  placeholder="ที่อยู่เต็มของสถานที่จัดงาน"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_maps_url">ลิงก์ Google Maps</Label>
                <Input
                  id="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={e => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อความเชิญ</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="เช่น ด้วยความยินดียิ่ง ขอเชิญท่านร่วมเป็นเกียรติ..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* RSVP Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">การตอบรับ (RSVP)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>เปิดให้แขกตอบรับ</Label>
                  <p className="text-sm text-muted-foreground">แขกสามารถกดปุ่มตอบรับว่าจะมาหรือไม่มา</p>
                </div>
                <Switch
                  checked={formData.rsvp_enabled}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, rsvp_enabled: checked }))}
                />
              </div>

              {formData.rsvp_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="rsvp_deadline">กำหนดตอบรับภายใน</Label>
                  <Input
                    id="rsvp_deadline"
                    type="date"
                    value={formData.rsvp_deadline}
                    onChange={e => setFormData(prev => ({ ...prev, rsvp_deadline: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สีธีม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="color"
                  value={formData.theme_color}
                  onChange={e => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  สีหลักที่จะใช้ในการ์ดเชิญ
                </span>
              </div>
            </CardContent>
          </Card>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/invitations')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
          >
            ยกเลิก
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            สร้างการ์ดเชิญ
          </button>
        </div>
      </form>
    </>
  );
}
