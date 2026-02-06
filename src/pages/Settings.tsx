import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X, Camera, Signature, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const DEFAULT_SERVICE_DETAILS = `• ถ่ายภาพไม่จำกัดจำนวน
• ปรับโทน/แสง/สี ทุกภาพ
• ส่ง Demo 30-80 ภาพใน 24 ชั่วโมง
• ส่งไฟล์ภาพทั้งหมดภายใน 3-7 วัน
• ส่งไฟล์ภาพทาง Google Drive / Google Photos
• Backup ไฟล์ไว้ให้ 1 ปี`;

const DEFAULT_BOOKING_TERMS = `• ใบยืนยันการจองนี้มีผลเมื่อได้รับการชำระค่ามัดจำแล้ว
• ยอดคงเหลือชำระในวันงาน หรือก่อนวันงาน
• นโยบายการยกเลิกการจองจะไม่คืนมัดจำ
• กรุณาติดต่อเราหากต้องการเปลี่ยนแปลงรายละเอียดการจอง`;

const profileSchema = z.object({
  studio_name: z.string().min(1, 'กรุณากรอกชื่อสตูดิโอ').max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  address: z.string().max(200).optional(),
  full_name: z.string().max(100).optional(),
  show_signature: z.boolean().optional(),
  service_details: z.string().max(2000).optional(),
  booking_terms: z.string().max(2000).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [logoUploading, setLogoUploading] = useState(false);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      studio_name: '',
      phone: '',
      email: '',
      address: '',
      full_name: '',
      show_signature: false,
      service_details: DEFAULT_SERVICE_DETAILS,
      booking_terms: DEFAULT_BOOKING_TERMS,
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      form.reset({
        studio_name: profile.studio_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
        full_name: profile.full_name || '',
        show_signature: profile.show_signature || false,
        service_details: profile.service_details || DEFAULT_SERVICE_DETAILS,
        booking_terms: profile.booking_terms || DEFAULT_BOOKING_TERMS,
      });
    }
  }, [profile, form]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync(data);
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    setPasswordChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
      passwordForm.reset();
    } catch (error: any) {
      toast.error(`ไม่สามารถเปลี่ยนรหัสผ่านได้: ${error.message}`);
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleFileUpload = async (
    file: File, 
    type: 'logo' | 'signature'
  ) => {
    if (!user) return;
    
    const setUploading = type === 'logo' ? setLogoUploading : setSignatureUploading;
    setUploading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'profile');

      const response = await supabase.functions.invoke('r2-storage?action=upload', {
        body: formData,
      });

      if (response.error) {
        throw response.error;
      }

      const publicUrl = response.data.url;

      const updateData = type === 'logo' 
        ? { logo_url: publicUrl } 
        : { signature_url: publicUrl };
      
      await updateProfile.mutateAsync(updateData);
      await refetch();
      
      toast.success(type === 'logo' ? 'อัปโหลดโลโก้สำเร็จ' : 'อัปโหลดลายเซ็นสำเร็จ');
    } catch (error: any) {
      toast.error(`ไม่สามารถอัปโหลดได้: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (type: 'logo' | 'signature') => {
    const updateData = type === 'logo' 
      ? { logo_url: null } 
      : { signature_url: null };
    
    await updateProfile.mutateAsync(updateData);
    await refetch();
    toast.success(type === 'logo' ? 'ลบโลโก้แล้ว' : 'ลบลายเซ็นแล้ว');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
          ตั้งค่าสตูดิโอ
        </h1>
        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          กำหนดข้อมูลสตูดิโอสำหรับใบยืนยันการจอง
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo & Signature Upload */}
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6`}>
          <h3 className={`font-display text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            โลโก้และลายเซ็น
          </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label>โลโก้สตูดิโอ</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {profile?.logo_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={profile.logo_url} 
                        alt="โลโก้สตูดิโอ" 
                        className="h-20 w-auto object-contain mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => handleRemoveImage('logo')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">ยังไม่มีโลโก้</p>
                    </div>
                  )}
                  
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    disabled={logoUploading}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {profile?.logo_url ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้'}
                  </Button>
                </div>
              </div>

              {/* Signature Upload */}
              <div className="space-y-3">
                <Label>ลายเซ็น</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {profile?.signature_url ? (
                    <div className="relative inline-block">
                      <img 
                        src={profile.signature_url} 
                        alt="ลายเซ็น" 
                        className="h-16 w-auto object-contain mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => handleRemoveImage('signature')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Signature className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">ยังไม่มีลายเซ็น</p>
                    </div>
                  )}
                  
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'signature');
                    }}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    disabled={signatureUploading}
                    onClick={() => signatureInputRef.current?.click()}
                  >
                    {signatureUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {profile?.signature_url ? 'เปลี่ยนลายเซ็น' : 'อัปโหลดลายเซ็น'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

        {/* Profile Form */}
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6`}>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="studio_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อสตูดิโอ *</FormLabel>
                      <FormControl>
                        <Input placeholder="ชื่อสตูดิโอถ่ายภาพ" className="input-elegant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เบอร์โทรศัพท์</FormLabel>
                        <FormControl>
                          <Input placeholder="0XX-XXX-XXXX" className="input-elegant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>อีเมล</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="studio@email.com" className="input-elegant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ที่อยู่สตูดิโอ"
                          className="input-elegant"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Signature Settings */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-display text-lg font-medium">ตั้งค่าลายเซ็น</h3>
                  
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อ-นามสกุล (สำหรับลายเซ็น)</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อจริง นามสกุล" className="input-elegant" {...field} />
                        </FormControl>
                        <FormDescription>
                          จะแสดงใต้ลายเซ็นในใบยืนยันการจอง
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="show_signature"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">แสดงลายเซ็นในใบยืนยัน</FormLabel>
                          <FormDescription>
                            เปิดใช้งานเพื่อแสดงลายเซ็นและชื่อในใบยืนยันการจอง
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Service Details & Booking Terms */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-display text-lg font-medium">รายละเอียดบริการและเงื่อนไขการจอง</h3>
                  <p className="text-sm text-muted-foreground">ข้อความเหล่านี้จะแสดงในใบยืนยันการจอง</p>
                  
                  <FormField
                    control={form.control}
                    name="service_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รายละเอียดบริการ</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="รายละเอียดบริการ..."
                            className="input-elegant min-h-[150px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          ใส่รายละเอียดบริการที่ลูกค้าจะได้รับ (ขึ้นบรรทัดใหม่ได้)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="booking_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เงื่อนไขการจอง</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="เงื่อนไขการจอง..."
                            className="input-elegant min-h-[120px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          ระบุเงื่อนไขและนโยบายการจอง (ขึ้นบรรทัดใหม่ได้)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.setValue('service_details', DEFAULT_SERVICE_DETAILS);
                      form.setValue('booking_terms', DEFAULT_BOOKING_TERMS);
                    }}
                  >
                    รีเซ็ตเป็นค่าเริ่มต้น
                  </Button>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={updateProfile.isPending} className="min-w-[120px]">
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      'บันทึกการตั้งค่า'
                    )}
                  </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Password Change Section */}
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6`}>
          <h3 className={`font-display text-lg font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Lock className="w-5 h-5" />
            เปลี่ยนรหัสผ่าน
          </h3>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่านใหม่</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                          className="input-elegant pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="ยืนยันรหัสผ่านใหม่"
                          className="input-elegant pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={passwordChanging} className="min-w-[120px]">
                  {passwordChanging ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังเปลี่ยน...
                    </>
                  ) : (
                    'เปลี่ยนรหัสผ่าน'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
