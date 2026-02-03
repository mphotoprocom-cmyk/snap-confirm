import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookingForm } from '@/components/BookingForm';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewBooking() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const createBooking = useCreateBooking();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: any) => {
    const booking = await createBooking.mutateAsync(data);
    navigate(`/bookings/${booking.id}`);
  };

  return (
    <>
      <div className="mb-6">
        <Link to="/">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ArrowLeft className="w-4 h-4" />
            กลับไปรายการจอง
          </button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
          สร้างการจองใหม่
        </h1>
        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          สร้างการจองถ่ายภาพใหม่
        </p>
      </div>

      <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6`}>
        <BookingForm
          onSubmit={handleSubmit}
          isSubmitting={createBooking.isPending}
        />
      </div>
    </>
  );
}
