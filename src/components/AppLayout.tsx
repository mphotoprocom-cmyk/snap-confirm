import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useIsAdmin } from '@/hooks/useUserManagement';
import { useTheme } from '@/hooks/useTheme';
import {
  Camera, LogOut, Settings, Users, Package, FileText, Image,
  FolderOpen, Heart, Bell, BarChart3, Sun, Moon, Search
} from 'lucide-react';

const sidebarNav = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/quotations', label: 'ใบเสนอราคา', icon: FileText },
  { to: '/packages', label: 'แพ็กเกจ', icon: Package },
  { to: '/portfolio', label: 'Portfolio', icon: Image },
  { to: '/deliveries', label: 'ส่งงาน', icon: FolderOpen },
  { to: '/invitations', label: 'การ์ดเชิญ', icon: Heart },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) return <Outlet />;

  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'dashboard-bg' : 'light-dashboard-bg'}>
      {/* Header */}
      <header className={`${isDark ? 'glass-header' : 'light-glass-header'} sticky top-0 z-50 px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className={`font-display text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {profile?.studio_name || 'Snap Confirm'}
            </span>
            <p className={`text-[10px] -mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              Photography Management
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${isDark ? 'glass-btn' : 'light-glass-btn'}`}
            title={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium hidden sm:inline ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              {user?.email?.split('@')[0]}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              Pro
            </span>
          </div>

          <button className={`relative p-2 rounded-lg ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
        </div>
      </header>

      <div className="flex relative" style={{ zIndex: 1 }}>
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 p-4 shrink-0">
          <nav className={`${isDark ? 'glass-sidebar' : 'light-glass-sidebar'} p-3 space-y-1 sticky top-20`}>
            {sidebarNav.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? isDark ? 'glass-btn-active' : 'light-glass-btn-active'
                      : isDark
                        ? 'text-white/50 hover:text-white/80 hover:bg-white/5'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80'
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isDark
                    ? 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80'
                }`}
              >
                <Users className="w-4 h-4" />
                จัดการผู้ใช้
              </Link>
            )}

            <div className={isDark ? 'glow-line my-3' : 'h-px bg-gray-200 my-3'} />

            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80'
              }`}
            >
              <Settings className="w-4 h-4" />
              ตั้งค่า
            </Link>

            <button
              onClick={signOut}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full ${
                isDark
                  ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/5'
                  : 'text-red-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 ${isDark ? 'glass-header' : 'light-glass-header'} px-2 py-2 flex justify-around z-50`}>
        {sidebarNav.slice(0, 5).map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] ${
                isActive
                  ? 'text-emerald-400'
                  : isDark ? 'text-white/40' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
