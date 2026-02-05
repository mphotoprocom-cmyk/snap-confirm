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
import { Quotation, QUOTATION_STATUS_LABELS, QuotationStatus } from '@/types/package';
import { JobType, JOB_TYPE_LABELS } from '@/types/booking';
import { useActivePackages } from '@/hooks/usePackages';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const quotationSchema = z.object({
  client_name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า').max(100),
  client_phone: z.string().max(20).optional(),
  client_email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  client_note: z.string().max(500).optional(),
  job_type: z.enum(['wedding', 'event', 'corporate', 'portrait', 'other']),
  event_date: z.string().optional(),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  location: z.string().max(200).optional(),
  total_price: z.coerce.number().min(0, 'ราคาต้องไม่ติดลบ'),
  notes: z.string().max(1000).optional(),
  valid_until: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']),
  package_id: z.string().optional(),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  quotation?: Quotation;
  onSubmit: (data: QuotationFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function QuotationForm({ quotation, onSubmit, isSubmitting }: QuotationFormProps) {
  const { data: packages } = useActivePackages();

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      client_name: quotation?.client_name || '',
      client_phone: quotation?.client_phone || '',
      client_email: quotation?.client_email || '',
      client_note: quotation?.client_note || '',
      job_type: quotation?.job_type || 'event',
      event_date: quotation?.event_date || '',
      time_start: quotation?.time_start || '07:00',
      time_end: quotation?.time_end || '12:00',
      location: quotation?.location || '',
      total_price: quotation?.total_price || 0,
      notes: quotation?.notes || '',
      valid_until: quotation?.valid_until || '',
      status: quotation?.status || 'draft',
      package_id: quotation?.package_id || '',
    },
  });

  const selectedPackageId = form.watch('package_id');

  useEffect(() => {
    if (selectedPackageId && packages) {
      const selectedPackage = packages.find(p => p.id === selectedPackageId);
      if (selectedPackage) {
        form.setValue('total_price', selectedPackage.price);
        if (selectedPackage.job_type) {
          form.setValue('job_type', selectedPackage.job_type as JobType);
        }
      }
    }
  }, [selectedPackageId, packages, form]);

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
                        <SelectTrigger>
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
                      <Input placeholder="ชื่อ นามสกุล" {...field} />
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
                      <Input placeholder="0XX-XXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client_note"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>ข้อมูลเพิ่มเติม</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Line ID, Facebook, หมายเหตุ" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>วันที่จัดงาน (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Input type="time" {...field} />
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
                      <Input type="time" {...field} />
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
                      <Input placeholder="ที่อยู่สถานที่จัดงาน" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-display text-lg font-medium">ราคาและสถานะ</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="total_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ราคาเสนอ (฿)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ใช้ได้ถึงวันที่</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(QUOTATION_STATUS_LABELS) as QuotationStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>
                            {QUOTATION_STATUS_LABELS[status]}
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
                    placeholder="รายละเอียดเพิ่มเติมสำหรับใบเสนอราคา..."
                    className="min-h-[100px]"
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
            ) : quotation ? (
              'อัพเดทใบเสนอราคา'
            ) : (
              'สร้างใบเสนอราคา'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
