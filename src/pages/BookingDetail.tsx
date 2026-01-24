import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooking, useUpdateBooking, useDeleteBooking, useConfirmDeposit } from '@/hooks/useBookings';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { BookingForm } from '@/components/BookingForm';
import { BookingConfirmation } from '@/components/BookingConfirmation';
import { FacebookQueueGenerator } from '@/components/FacebookQueueGenerator';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  FileText, 
  Calendar as CalendarIcon,
  Loader2,
  X,
  Facebook
} from 'lucide-react';
import { format } from 'date-fns';
import { JOB_TYPE_LABELS } from '@/types/booking';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: booking, isLoading } = useBooking(id);
  const { data: profile } = useProfile();
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();
  const confirmDeposit = useConfirmDeposit();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFacebookQueue, setShowFacebookQueue] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUpdate = async (data: any) => {
    if (!id) return;
    await updateBooking.mutateAsync({ id, ...data });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteBooking.mutateAsync(id);
    navigate('/');
  };

  const handleConfirmDeposit = async () => {
    if (!id) return;
    await confirmDeposit.mutateAsync(id);
  };

  const handleGenerateImage = async () => {
    if (!confirmationRef.current) return;
    
    try {
      const canvas = await html2canvas(confirmationRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = `booking-confirmation-${booking?.booking_number}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      
      toast.success('Confirmation image downloaded');
    } catch (error) {
      toast.error('Failed to generate image');
    }
  };

  const handleAddToCalendar = () => {
    if (!booking) return;
    
    const startDate = new Date(booking.event_date);
    if (booking.time_start) {
      const [hours, minutes] = booking.time_start.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes));
    }
    
    const endDate = new Date(booking.event_date);
    if (booking.time_end) {
      const [hours, minutes] = booking.time_end.split(':');
      endDate.setHours(parseInt(hours), parseInt(minutes));
    } else {
      endDate.setHours(startDate.getHours() + 2);
    }

    const formatGoogleDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const details = encodeURIComponent(`Client: ${booking.client_name}\nJob Type: ${JOB_TYPE_LABELS[booking.job_type]}\n${booking.notes || ''}`);
    const location = encodeURIComponent(booking.location || '');
    const title = encodeURIComponent(`📷 ${JOB_TYPE_LABELS[booking.job_type]} - ${booking.client_name}`);
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${details}&location=${location}`;
    
    window.open(googleUrl, '_blank');
    toast.success('Opening Google Calendar');
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <h1 className="text-xl font-semibold">Booking not found</h1>
          <Link to="/">
            <Button className="mt-4">Back to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

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

        {/* Booking Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="page-title mb-0">{booking.client_name}</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-muted-foreground">{booking.booking_number}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this booking? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="card-elevated p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-medium">Edit Booking</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <BookingForm
              booking={booking}
              onSubmit={handleUpdate}
              isSubmitting={updateBooking.isPending}
            />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-elevated p-6">
                <h2 className="font-display text-lg font-medium mb-4">Event Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium">{JOB_TYPE_LABELS[booking.job_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(booking.event_date), 'MMMM d, yyyy')}</p>
                  </div>
                  {(booking.time_start || booking.time_end) && (
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {formatTime(booking.time_start)}
                        {booking.time_end && ` - ${formatTime(booking.time_end)}`}
                      </p>
                    </div>
                  )}
                  {booking.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{booking.location}</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="card-elevated p-6">
                <h2 className="font-display text-lg font-medium mb-4">Client Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{booking.client_name}</p>
                  </div>
                  {booking.client_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{booking.client_phone}</p>
                    </div>
                  )}
                  {booking.client_email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{booking.client_email}</p>
                    </div>
                  )}
                </div>
              </Card>

              {booking.notes && (
                <Card className="card-elevated p-6">
                  <h2 className="font-display text-lg font-medium mb-4">Notes</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card className="card-elevated p-6">
                <h2 className="font-display text-lg font-medium mb-4">Payment</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-semibold">${booking.total_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="font-medium">${booking.deposit_amount.toLocaleString()}</span>
                  </div>
                  {booking.deposit_received_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deposit Date</span>
                      <span>{format(new Date(booking.deposit_received_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-medium">Balance Due</span>
                    <span className="font-semibold">
                      ${(booking.total_price - booking.deposit_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card className="card-elevated p-6">
                <h2 className="font-display text-lg font-medium mb-4">Actions</h2>
                <div className="space-y-3">
                  {(booking.status === 'draft' || booking.status === 'waiting_deposit') && (
                    <Button
                      onClick={handleConfirmDeposit}
                      disabled={confirmDeposit.isPending}
                      className="w-full gap-2"
                    >
                      {confirmDeposit.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Confirm Deposit
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(true)}
                    disabled={booking.status !== 'booked'}
                    className="w-full gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Confirmation
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleAddToCalendar}
                    disabled={booking.status !== 'booked'}
                    className="w-full gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Add to Calendar
                  </Button>
                </div>
                
                {/* Separator */}
                <div className="border-t my-4" />
                
                {/* Optional: Social Media */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Social Media</p>
                  <Button
                    variant="secondary"
                    onClick={() => setShowFacebookQueue(true)}
                    disabled={booking.status !== 'booked'}
                    className="w-full gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Create FB Queue Image
                  </Button>
                </div>
                
                {booking.status !== 'booked' && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Confirm deposit to enable confirmation and calendar features.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && booking.status === 'booked' && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-medium">Booking Confirmation</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerateImage}>
                    Download JPG
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowConfirmation(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <BookingConfirmation
                  ref={confirmationRef}
                  booking={booking}
                  profile={profile || null}
                />
              </div>
            </div>
          </div>
        )}

        {/* Facebook Queue Generator Modal */}
        {showFacebookQueue && booking.status === 'booked' && (
          <FacebookQueueGenerator
            booking={booking}
            onClose={() => setShowFacebookQueue(false)}
          />
        )}
      </main>
    </div>
  );
}
