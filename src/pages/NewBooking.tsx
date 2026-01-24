import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BookingForm } from '@/components/BookingForm';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewBooking() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const createBooking = useCreateBooking();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Button>
          </Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">New Booking</h1>
          <p className="page-subtitle">Create a new photography session booking</p>
        </div>

        <div className="card-elevated p-6 animate-fade-in">
          <BookingForm
            onSubmit={handleSubmit}
            isSubmitting={createBooking.isPending}
          />
        </div>
      </main>
    </div>
  );
}
