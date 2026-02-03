import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/BookingCard';
import { BookingCalendar } from '@/components/BookingCalendar';
import { DashboardStats } from '@/components/DashboardStats';
import { BookingStatus } from '@/types/booking';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useIsAdmin } from '@/hooks/useUserManagement';
import {
  Plus, Search, Calendar, CheckCircle, Clock, FileX, Loader2,
  LayoutGrid, CalendarDays, BarChart3, Camera, LogOut, Settings,
  Users, Package, FileText, Image, FolderOpen, Heart, Bell
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type ViewMode = 'grid' | 'calendar' | 'stats';

const statusFilters: { value: BookingStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'ทั้งหมด', icon: null },
  { value: 'draft', label: 'ร่าง', icon: <FileX className="w-3.5 h-3.5" /> },
  { value: 'waiting_deposit', label: 'รอมัดจำ', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'booked', label: 'จองแล้ว', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { value: 'completed', label: 'เสร็จสิ้น', icon: <Calendar className="w-3.5 h-3.5" /> },
];

const sidebarNav = [
  { to: '/', label: 'Dashboard', icon: BarChart3, active: true },
  { to: '/quotations', label: 'ใบเสนอราคา', icon: FileText },
  { to: '/packages', label: 'แพ็กเกจ', icon: Package },
  { to: '/portfolio', label: 'Portfolio', icon: Image },
  { to: '/deliveries', label: 'ส่งงาน', icon: FolderOpen },
  { to: '/invitations', label: 'การ์ดเชิญ', icon: Heart },
];

export default function Dashboard() {
  const { data: bookings, isLoading } = useBookings();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const location = useLocation();

  const filteredBookings = bookings?.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch =
      booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="dashboard-bg">
      {/* Top Header Bar */}
      <header className="glass-header sticky top-0 z-50 px-6 py-3 flex items-center justify-between relative" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-semibold text-white">
              {profile?.studio_name || 'Snap Confirm'}
            </span>
            <p className="text-[10px] text-white/40 -mt-0.5">Photography Management</p>
          </div>
        </div>

        {/* Center Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2 text-sm outline-none"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 font-medium hidden sm:inline">
              {user?.email?.split('@')[0]}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              Pro
            </span>
          </div>
          <button className="relative p-2 glass-btn rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <div className="flex relative" style={{ zIndex: 1 }}>
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 p-4 shrink-0">
          <nav className="glass-sidebar p-3 space-y-1 sticky top-20">
            {sidebarNav.map((item) => {
              const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'glass-btn-active'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin/users"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
              >
                <Users className="w-4 h-4" />
                จัดการผู้ใช้
              </Link>
            )}

            <div className="glow-line my-3" />

            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่า
            </Link>

            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white font-display">รายการจอง</h1>
              <p className="text-sm text-white/40">จัดการการจองถ่ายภาพของคุณ</p>
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
                    viewMode === mode ? 'glass-btn-active' : 'glass-btn'
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

          {/* Mobile Search */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2 text-sm outline-none"
              />
            </div>
          </div>

          {/* Content */}
          {viewMode === 'stats' ? (
            <DashboardStats bookings={bookings || []} />
          ) : viewMode === 'calendar' ? (
            <div className="glass-card p-4">
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
                        ? 'glass-btn-active'
                        : 'glass-btn'
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
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-white/30" />
                  </div>
                  <h3 className="text-lg font-medium text-white/80 mb-2">
                    {searchQuery || statusFilter !== 'all' ? 'ไม่พบการจอง' : 'ยังไม่มีการจอง'}
                  </h3>
                  <p className="text-white/40 mb-6 text-sm">
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

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-header px-2 py-2 flex justify-around z-50">
            {sidebarNav.slice(0, 5).map((item) => {
              const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] ${
                    isActive ? 'text-emerald-400' : 'text-white/40'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </main>
      </div>
    </div>
  );
}
