import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useIsAdmin } from '@/hooks/useUserManagement';
import { Camera, LogOut, Settings, Plus, Users, Package, FileText, Image, FolderOpen, Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
            <Camera className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">
            {profile?.studio_name || 'Photo Studio'}
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/quotations">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <FileText className="w-4 h-4" />
              ใบเสนอราคา
            </Button>
          </Link>
          
          <Link to="/packages">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <Package className="w-4 h-4" />
              แพ็กเกจ
            </Button>
          </Link>

          <Link to="/portfolio">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <Image className="w-4 h-4" />
              Portfolio
            </Button>
          </Link>

          <Link to="/deliveries">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <FolderOpen className="w-4 h-4" />
              ส่งงาน
            </Button>
          </Link>

          <Link to="/invitations">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <Heart className="w-4 h-4" />
              การ์ดเชิญ
            </Button>
          </Link>

          <Link to="/bookings/new">
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">สร้างการจอง</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-foreground">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.studio_name}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="sm:hidden">
                <Link to="/quotations" className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  ใบเสนอราคา
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="sm:hidden">
                <Link to="/packages" className="cursor-pointer">
                  <Package className="w-4 h-4 mr-2" />
                  แพ็กเกจ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="sm:hidden">
                <Link to="/portfolio" className="cursor-pointer">
                  <Image className="w-4 h-4 mr-2" />
                  Portfolio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="sm:hidden">
                <Link to="/deliveries" className="cursor-pointer">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  ส่งงาน
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="sm:hidden">
                <Link to="/invitations" className="cursor-pointer">
                  <Heart className="w-4 h-4 mr-2" />
                  การ์ดเชิญ
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/users" className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    จัดการผู้ใช้
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  ตั้งค่า
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
