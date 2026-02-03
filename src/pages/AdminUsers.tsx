import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin, useAllUsers, useUpdateUserRole, useToggleUserBlock, useDeleteUser, UserWithRole } from '@/hooks/useUserManagement';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Shield, ShieldOff, Ban, CheckCircle, Trash2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const updateRole = useUpdateUserRole();
  const toggleBlock = useToggleUserBlock();
  const deleteUser = useDeleteUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  // Show loading
  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }
  
  // Redirect if not admin
  if (!isAdmin) {
    navigate('/');
    toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    return null;
  }
  
  const handleSetRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      await updateRole.mutateAsync({ userId, role });
      toast.success(`เปลี่ยนบทบาทเป็น ${role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'} สำเร็จ`);
    } catch (error) {
      toast.error('ไม่สามารถเปลี่ยนบทบาทได้');
    }
  };
  
  const handleToggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    try {
      await toggleBlock.mutateAsync({ userId, isBlocked: !currentlyBlocked });
      toast.success(currentlyBlocked ? 'ปลดบล็อกผู้ใช้สำเร็จ' : 'บล็อกผู้ใช้สำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถเปลี่ยนสถานะบล็อกได้');
    }
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser.mutateAsync(userToDelete.user_id);
      toast.success('ลบบัญชีผู้ใช้สำเร็จ');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error('ไม่สามารถลบบัญชีผู้ใช้ได้');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
              จัดการผู้ใช้งาน
            </h1>
            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              ดูรายชื่อ กำหนดบทบาท และจัดการผู้ใช้ในระบบ
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4`}>
          <div className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>ผู้ใช้ทั้งหมด</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{users?.length ?? 0}</div>
        </div>
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4`}>
          <div className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>ผู้ดูแลระบบ</div>
          <div className="text-2xl font-bold text-emerald-400">{users?.filter(u => u.role === 'admin').length ?? 0}</div>
        </div>
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4`}>
          <div className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>ถูกบล็อก</div>
          <div className="text-2xl font-bold text-red-400">{users?.filter(u => u.is_blocked).length ?? 0}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className={`${isDark ? 'glass-card' : 'light-glass-card'} overflow-hidden`}>
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>ชื่อสตูดิโอ</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((userItem) => (
                  <TableRow key={userItem.id} className={userItem.is_blocked ? 'opacity-60' : ''}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{userItem.full_name || '-'}</div>
                        <div className="text-sm text-muted-foreground">{userItem.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{userItem.studio_name || '-'}</TableCell>
                    <TableCell>
                      {userItem.role === 'admin' ? (
                        <Badge variant="default" className="bg-accent">
                          <Shield className="w-3 h-3 mr-1" />
                          ผู้ดูแล
                        </Badge>
                      ) : (
                        <Badge variant="secondary">ผู้ใช้ทั่วไป</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {userItem.is_blocked ? (
                        <Badge variant="destructive">
                          <Ban className="w-3 h-3 mr-1" />
                          ถูกบล็อก
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          ใช้งานได้
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(userItem.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={userItem.user_id === user?.id}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {userItem.role !== 'admin' && (
                            <DropdownMenuItem onClick={() => handleSetRole(userItem.user_id, 'admin')}>
                              <Shield className="w-4 h-4 mr-2" />
                              ตั้งเป็นผู้ดูแล
                            </DropdownMenuItem>
                          )}
                          {userItem.role === 'admin' && (
                            <DropdownMenuItem onClick={() => handleSetRole(userItem.user_id, 'user')}>
                              <ShieldOff className="w-4 h-4 mr-2" />
                              ลดเป็นผู้ใช้ทั่วไป
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleBlock(userItem.user_id, userItem.is_blocked)}>
                            {userItem.is_blocked ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                ปลดบล็อก
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                บล็อกผู้ใช้
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setUserToDelete(userItem);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบบัญชี
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ไม่พบผู้ใช้ในระบบ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบบัญชี</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของ <strong>{userToDelete?.email}</strong>? 
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              ลบบัญชี
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
