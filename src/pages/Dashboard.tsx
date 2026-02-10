import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/BookingCard';
import { BookingCalendar } from '@/components/BookingCalendar';
import { DashboardStats } from '@/components/DashboardStats';
import { BookingStatus } from '@/types/booking';
import { useTheme } from '@/hooks/useTheme';
import {
  Plus, Search, Calendar, CheckCircle, Clock, FileX, Loader2,
  LayoutGrid, CalendarDays, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ViewMode = 'grid' | 'calendar' | 'stats';

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
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const filteredBookings = bookings?.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch =
      booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
            รายการจอง
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            จัดการการจองถ่ายภาพของคุณ
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { mode: 'stats' as ViewMode, icon: BarChart3, title: 'สถิติ' },
            { mode: 'grid' as ViewMode, icon: LayoutGrid, title: 'การ์ด' },
            { mode: 'calendar' as ViewMode, icon: CalendarDays, title: 'ปฏิทิน' },
          ].map(({ mode, icon: Icon, title }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={title}
              className={`p-2 rounded-lg transition-all ${
                viewMode === mode
                  ? isDark ? 'glass-btn-active' : 'light-glass-btn-active'
                  : isDark ? 'glass-btn' : 'light-glass-btn'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}

          <Link to="/bookings/new">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">สร้างการจอง</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${isDark ? 'glass-input' : 'light-glass-input'} w-full pl-10 pr-4 py-2 text-sm outline-none`}
          />
        </div>
      </div>

      {/* Content */}
      {viewMode === 'stats' ? (
        <DashboardStats
          bookings={bookings || []}
          onNavigateToBookings={(filter) => {
            if (filter === 'booked') {
              setStatusFilter('booked');
            } else {
              setStatusFilter('all');
            }
            setViewMode('grid');
          }}
        />
      ) : viewMode === 'calendar' ? (
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4`}>
          <BookingCalendar bookings={bookings || []} />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === filter.value
                    ? isDark ? 'glass-btn-active' : 'light-glass-btn-active'
                    : isDark ? 'glass-btn' : 'light-glass-btn'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>

          {/* Bookings Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
          ) : filteredBookings && filteredBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-12 text-center`}>
              <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-4`}>
                <Calendar className={`w-8 h-8 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                {searchQuery || statusFilter !== 'all' ? 'ไม่พบการจอง' : 'ยังไม่มีการจอง'}
              </h3>
              <p className={`mb-6 text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {searchQuery || statusFilter !== 'all'
                  ? 'ลองปรับเปลี่ยนตัวกรองดู'
                  : 'สร้างการจองแรกของคุณเพื่อเริ่มต้น'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link to="/bookings/new">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mx-auto">
                    <Plus className="w-4 h-4" />
                    สร้างการจอง
                  </button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
