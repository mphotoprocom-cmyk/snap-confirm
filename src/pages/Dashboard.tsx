import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/BookingCard';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookingStatus, STATUS_LABELS } from '@/types/booking';
import { Plus, Search, Calendar, CheckCircle, Clock, FileX, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusFilters: { value: BookingStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'ทั้งหมด', icon: null },
  { value: 'draft', label: 'ร่าง', icon: <FileX className="w-3.5 h-3.5" /> },
  { value: 'waiting_deposit', label: 'รอมัดจำ', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'booked', label: 'จองแล้ว', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { value: 'completed', label: 'เสร็จสิ้น', icon: <Calendar className="w-3.5 h-3.5" /> },
];

export default function Dashboard() {
  const { data: bookings, isLoading } = useBookings();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = bookings?.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = 
      booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: bookings?.length || 0,
    booked: bookings?.filter(b => b.status === 'booked').length || 0,
    waiting: bookings?.filter(b => b.status === 'waiting_deposit').length || 0,
    thisMonth: bookings?.filter(b => {
      const eventDate = new Date(b.event_date);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">รายการจอง 56</h1>
          <p className="page-subtitle">จัดการการจองถ่ายภาพของคุณ aa</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">การจองทั้งหมด</p>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">ยืนยันแล้ว</p>
            <p className="text-2xl font-semibold text-success">{stats.booked}</p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">รอมัดจำ</p>
            <p className="text-2xl font-semibold text-warning">{stats.waiting}</p>
          </div>
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">เดือนนี้</p>
            <p className="text-2xl font-semibold text-foreground">{stats.thisMonth}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาการจอง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-elegant"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className="whitespace-nowrap gap-1.5"
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Bookings Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredBookings && filteredBookings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card-elevated">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' ? 'ไม่พบการจอง' : 'ยังไม่มีการจอง'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'ลองปรับเปลี่ยนตัวกรองดู'
                : 'สร้างการจองแรกของคุณเพื่อเริ่มต้น'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/bookings/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  สร้างการจอง
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
