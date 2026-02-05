import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Booking, JobType, BookingStatus, JOB_TYPE_LABELS, STATUS_LABELS } from '@/types/booking';
import { useActivePackages } from '@/hooks/usePackages';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const bookingSchema = z.object({
  client_name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า').max(100),
  client_phone: z.string().max(20).optional(),
  client_note: z.string().max(500).optional(),
  job_type: z.enum(['wedding', 'event', 'corporate', 'portrait', 'other']),
  event_date: z.string().min(1, 'กรุณาเลือกวันที่'),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  location: z.string().max(200).optional(),
  total_price: z.coerce.number().min(0, 'ราคาต้องไม่ติดลบ'),
  deposit_amount: z.coerce.number().min(0, 'มัดจำต้องไม่ติดลบ'),
  notes: z.string().max(1000).optional(),
  status: z.enum(['draft', 'waiting_deposit', 'booked', 'completed', 'cancelled']),
  package_id: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  booking?: Booking;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function BookingForm({ booking, onSubmit, isSubmitting }: BookingFormProps) {
  const { data: packages } = useActivePackages();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      client_name: booking?.client_name || '',
      client_phone: booking?.client_phone || '',
      client_note: booking?.client_note || '',
      job_type: booking?.job_type || 'event',
      event_date: booking?.event_date || '',
      time_start: booking?.time_start || '',
      time_end: booking?.time_end || '',
      location: booking?.location || '',
      total_price: booking?.total_price || 0,
      deposit_amount: booking?.deposit_amount || 0,
      notes: booking?.notes || '',
      status: booking?.status || 'draft',
      package_id: (booking as any)?.package_id || '',
    },
  });

  const selectedPackageId = form.watch('package_id');

  useEffect(() => {
    if (selectedPackageId && packages && !booking) {
      const selectedPackage = packages.find(p => p.id === selectedPackageId);
      if (selectedPackage) {
        form.setValue('total_price', selectedPackage.price);
        if (selectedPackage.job_type) {
          form.setValue('job_type', selectedPackage.job_type as JobType);
        }
      }
    }
  }, [selectedPackageId, packages, form, booking]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Package Selection */}
          {packages && packages.length > 0 && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-display text-lg font-medium">เลือกแพ็กเกจ</h3>
              <FormField
                control={form.control}
                name="package_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>แพ็กเกจบริการ</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger className="input-elegant">
                          <SelectValue placeholder="เลือกแพ็กเกจ (ไม่บังคับ)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">ไม่เลือกแพ็กเกจ</SelectItem>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - ฿{pkg.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Client Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-display text-lg font-medium">ข้อมูลลูกค้า</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อลูกค้า *</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อ นามสกุล" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client_phone"
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
                name="client_note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ข้อมูลเพิ่มเติม</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Line ID, Facebook, หมายเหตุ" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-display text-lg font-medium">รายละเอียดงาน</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="job_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภทงาน *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-elegant">
                          <SelectValue placeholder="เลือกประเภทงาน" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((type) => (
                          <SelectItem key={type} value={type}>
                            {JOB_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่จัดงาน *</FormLabel>
                    <FormControl>
                      <Input type="date" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เวลาเริ่ม</FormLabel>
                    <FormControl>
                      <Input type="time" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เวลาสิ้นสุด</FormLabel>
                    <FormControl>
                      <Input type="time" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>สถานที่</FormLabel>
                    <FormControl>
                      <Input placeholder="ที่อยู่สถานที่จัดงาน" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-display text-lg font-medium">ราคา</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="total_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ราคารวม (฿)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deposit_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ค่ามัดจำ (฿)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" className="input-elegant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานะ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-elegant">
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>หมายเหตุ</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับการจอง..."
                    className="input-elegant min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : booking ? (
              'อัพเดทการจอง'
            ) : (
              'สร้างการจอง'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
