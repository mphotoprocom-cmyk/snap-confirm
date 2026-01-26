-- Add service details and booking terms columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS service_details TEXT DEFAULT '• ถ่ายภาพไม่จำกัดจำนวน
• ปรับโทน/แสง/สี ทุกภาพ
• ส่ง Demo 30-80 ภาพใน 24 ชั่วโมง
• ส่งไฟล์ภาพทั้งหมดภายใน 3-7 วัน
• ส่งไฟล์ภาพทาง Google Drive / Google Photos
• Backup ไฟล์ไว้ให้ 1 ปี',
ADD COLUMN IF NOT EXISTS booking_terms TEXT DEFAULT '• ใบยืนยันการจองนี้มีผลเมื่อได้รับการชำระค่ามัดจำแล้ว
• ยอดคงเหลือชำระในวันงาน หรือก่อนวันงาน
• นโยบายการยกเลิกการจองจะไม่คืนมัดจำ
• กรุณาติดต่อเราหากต้องการเปลี่ยนแปลงรายละเอียดการจอง';