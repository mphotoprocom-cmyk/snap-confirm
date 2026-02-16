-- =============================================
-- DATA EXPORT - All Tables
-- Project: SnapConfirm Flow
-- Generated: 2026-02-16
-- =============================================
-- NOTE: Run schema-export.sql FIRST before running this file
-- NOTE: user_id references auth.users - you need to create users first

-- =============================================
-- 1. PROFILES (2 records)
-- =============================================
INSERT INTO public.profiles (id, user_id, studio_name, full_name, email, phone, address, logo_url, signature_url, show_signature, is_blocked, service_details, booking_terms, created_at, updated_at) VALUES
('e983b257-35af-40d0-8a45-0a6fe60ab658', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'MPHOTO', 'saknarin', 'demo@mail.com', '', NULL, 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/profile/1769964122308-e76db257.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/profile/1769964124925-4603164e.png', true, false, '• ถ่ายภาพไม่จำกัดจำนวน
• ปรับโทน/แสง/สี ทุกภาพ
• ส่ง Demo 30-80 ภาพใน 24 ชั่วโมง
• ส่งไฟล์ภาพทั้งหมดภายใน 3-7 วัน
• ส่งไฟล์ภาพทาง Google Drive / Google Photos
• Backup ไฟล์ไว้ให้ 1 ปี', '• ใบยืนยันการจองนี้มีผลเมื่อได้รับการชำระค่ามัดจำแล้ว
• ยอดคงเหลือชำระในวันงาน หรือก่อนวันงาน
• นโยบายการยกเลิกการจองจะไม่คืนมัดจำ
• กรุณาติดต่อเราหากต้องการเปลี่ยนแปลงรายละเอียดการจอง', '2026-01-24 01:55:25.727241+00', '2026-02-05 07:53:10.814104+00'),
('15202533-db9b-40e0-bfd3-d4ff7bffe07b', 'a22c8ea2-57a9-412c-af8e-a0f9c10baa06', 'My Photography Studio', NULL, 'user@mail.com', NULL, NULL, NULL, NULL, false, false, '• ถ่ายภาพไม่จำกัดจำนวน
• ปรับโทน/แสง/สี ทุกภาพ
• ส่ง Demo 30-80 ภาพใน 24 ชั่วโมง
• ส่งไฟล์ภาพทั้งหมดภายใน 3-7 วัน
• ส่งไฟล์ภาพทาง Google Drive / Google Photos
• Backup ไฟล์ไว้ให้ 1 ปี', '• ใบยืนยันการจองนี้มีผลเมื่อได้รับการชำระค่ามัดจำแล้ว
• ยอดคงเหลือชำระในวันงาน หรือก่อนวันงาน
• นโยบายการยกเลิกการจองจะไม่คืนมัดจำ
• กรุณาติดต่อเราหากต้องการเปลี่ยนแปลงรายละเอียดการจอง', '2026-02-06 03:35:34.648056+00', '2026-02-06 03:35:34.648056+00');

-- =============================================
-- 2. USER_ROLES (1 record)
-- =============================================
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
('eb0a1e73-056f-475a-ba45-98fc85826c32', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'admin', '2026-01-26 01:24:09.960214+00');

-- =============================================
-- 3. PACKAGES (3 records)
-- =============================================
INSERT INTO public.packages (id, user_id, name, description, price, job_type, is_active, sort_order, created_at, updated_at) VALUES
('f0ee050c-2868-49a8-906e-0f7653aff80c', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'Silver Package', 'งานเช้า 07.00-12.00น.
✅ที่สำคัญการันตีเรื่องส่งงานเร็ว  (3-7วันเท่านั้น)
✅ถ่ายไม่จำกัดจำนวน
✅ปรับโทน /แสง/ สี / ทุกภาพสวยงาม
✅มีชุดไฟพร้อม
✅ส่งภาพ Demo 30-50ภาพ ภายใน 24ชัวโมง
✅ส่งไฟล์ภาพทาง google photo หรือ Google drive
✅Blackup ไฟล์ไว้ให้ 1ปีในคอม
✅ฟรีค่าเดินทาง 50กม.ครับ', 5500, 'wedding', true, 0, '2026-02-05 07:27:53.411483+00', '2026-02-05 07:29:27.679352+00'),
('3892b24d-219f-48d5-854f-fcdf0ec54ad2', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'Gold Package', 'งานเช้า 07.00-14.00น.
✅ที่สำคัญการันตีเรื่องส่งงานเร็ว  (3-7วันเท่านั้น)
✅ถ่ายไม่จำกัดจำนวน
✅ปรับโทน /แสง/ สี / ทุกภาพสวยงาม
✅มีชุดไฟพร้อม
✅ส่งภาพ Demo 30-50ภาพ ภายใน 24ชัวโมง
✅ส่งไฟล์ภาพทาง google photo หรือ Google drive
✅Blackup ไฟล์ไว้ให้ 1ปีในคอม
✅ฟรีค่าเดินทาง 50กม.ครับ', 7000, 'wedding', true, 0, '2026-02-05 07:29:21.436409+00', '2026-02-05 07:29:37.677984+00'),
('3a6d9d8b-a808-4836-8401-1d33d91a33f9', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'Platinum Package', 'งานเช้า 07.00-12.00น.
งานเย็น 17.00-21.00น.

✅ที่สำคัญการันตีเรื่องส่งงานเร็ว  (3-7วันเท่านั้น)
✅ถ่ายไม่จำกัดจำนวน
✅ปรับโทน /แสง/ สี / ทุกภาพสวยงาม
✅มีชุดไฟพร้อม
✅ส่งภาพ Demo 30-50ภาพ ภายใน 24ชัวโมง
✅ส่งไฟล์ภาพทาง google photo หรือ Google drive
✅Blackup ไฟล์ไว้ให้ 1ปีในคอม
✅ฟรีค่าเดินทาง 50กม.ครับ', 9900, NULL, true, 0, '2026-02-05 07:31:08.486642+00', '2026-02-05 07:31:08.486642+00');

-- =============================================
-- 4. BOOKINGS (2 records)
-- =============================================
INSERT INTO public.bookings (id, user_id, booking_number, client_name, client_phone, client_email, client_note, job_type, event_date, time_start, time_end, location, notes, package_id, total_price, deposit_amount, deposit_received_date, status, created_at, updated_at) VALUES
('a5063105-38b5-49a0-b480-dcff6bd322e5', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'BK-20260205-5775', 'คุณจูน', '0619480183', NULL, 'https://www.facebook.com/june.juthamat.636421#', 'wedding', '2026-03-28', '07:00:00', '12:00:00', 'อ ลำปลายมาศ', 'ช่างภาพ 2 คน', NULL, 5500.00, 1000.00, NULL, 'booked', '2026-02-05 07:20:36.123711+00', '2026-02-05 07:20:36.123711+00'),
('12830ee0-b73a-4a39-880a-400683d96e4b', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'BK-20260205-7511', 'คุณนุ่น', '0934652172 ', NULL, 'https://www.facebook.com/si.ra.wrrn.dech.phr#', 'wedding', '2026-02-22', '07:00:00', '12:00:00', 'นางรอง', 'ช่างภาพ 2 คน', NULL, 5500.00, 1000.00, NULL, 'booked', '2026-02-05 07:07:03.829769+00', '2026-02-05 07:48:44.073789+00');

-- =============================================
-- 5. QUOTATIONS (0 records)
-- =============================================
-- No data

-- =============================================
-- 6. SHARE_TOKENS (0 records)
-- =============================================
-- No data

-- =============================================
-- 7. PORTFOLIO_IMAGES (0 records)
-- =============================================
-- No data

-- =============================================
-- 8. DELIVERY_GALLERIES (2 records)
-- =============================================
INSERT INTO public.delivery_galleries (id, user_id, title, client_name, client_email, client_phone, description, booking_id, access_token, layout, cover_image_url, show_cover, face_search_enabled, fullscreen_mode, full_width_layout, is_active, download_count, expires_at, created_at, updated_at) VALUES
('1805fbab-3187-4af4-964b-a565c6596af2', '2f01c984-12ca-42ea-b753-f59eb17f1a44', '555', '5555', NULL, NULL, NULL, NULL, '31440122a3fe7793f7fcc7676c3f4be5', 'mosaic', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1805fbab-3187-4af4-964b-a565c6596af2/1769963822618-1f918cd5.png', true, false, false, false, true, 23, '2026-03-03 16:36:55.104+00', '2026-02-01 16:36:55.327392+00', '2026-02-10 04:02:55.472687+00'),
('137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'Test', 'คุณสวย', NULL, NULL, NULL, NULL, '7567c8ee0d42b26654614fe7ce8c7304', 'grid-4', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964163348-deb7ebd3.png', true, true, false, true, true, 187, '2026-03-03 14:49:16.365+00', '2026-02-01 14:49:17.09401+00', '2026-02-12 04:43:31.494968+00');

-- =============================================
-- 9. DELIVERY_IMAGES (many records - showing all)
-- NOTE: There are many delivery images. Below are representative entries.
-- The full data is available from the query results.
-- =============================================
INSERT INTO public.delivery_images (id, gallery_id, user_id, filename, image_url, thumbnail_url, file_size, sort_order, created_at) VALUES
('45ea93df-e75f-4051-a08c-6a5b9160bc01', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_090746_fff98969-9fc5-4e89-9283-7ea42f14efe1.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964025099-72ebb1a0.png', NULL, 1202381, 0, '2026-02-01 14:49:37.560368+00'),
('85b1f833-34ae-4b85-ad79-1844c29d7ff1', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_090750_e2c71ee3-e4e3-4eb3-a011-a579322890d0.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964027543-a0617aa6.png', NULL, 1293682, 0, '2026-02-01 14:49:38.730138+00'),
('d7d2b318-8172-49d1-a152-734fa53cbaea', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_090803_b99bfb0d-a581-421a-b7bb-b59f22d21186.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964029477-e1e3c20a.png', NULL, 1936216, 0, '2026-02-01 14:49:39.969777+00'),
('7de29a82-dcad-463e-87cc-f78d5a232bf2', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_090807_03bad746-c2c5-49a1-8acc-7d5848dd0f75.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964032436-eb7ffb98.png', NULL, 1839383, 0, '2026-02-01 14:49:41.061113+00'),
('adfe76b5-14b9-4154-b019-ac98226594ac', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_090826_d4fa3950-3286-463c-8a0b-38a3f017f181.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964034245-1d933993.png', NULL, 1307988, 0, '2026-02-01 14:49:42.420076+00'),
('ccf06934-6679-4152-935e-d8224c8c243c', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_090830_159adb2f-e8c6-49ba-a119-c928d49e3459.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964038227-57520e7e.png', NULL, 1738160, 0, '2026-02-01 14:49:43.682072+00'),
('1454f119-224f-47c2-b483-38a49949ef17', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_090848_477ea215-799c-4d21-9d49-b53353a6500a.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964040188-43f39633.png', NULL, 1252612, 0, '2026-02-01 14:49:44.888141+00'),
('efe6c260-13a8-4027-8186-84eae70408a4', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_091139_ea57ab83-a9cf-4c31-8cca-e28b1f205a6e.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964042723-ef78c248.png', NULL, 1716621, 0, '2026-02-01 14:49:46.243366+00'),
('f99741c8-3eff-4ff6-8e5b-81bb59a25957', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_091154_19649fcc-2525-4422-ac39-7e0b7f844144.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964046060-8b64a111.png', NULL, 1938512, 0, '2026-02-01 14:49:47.628259+00'),
('4b0d3ee3-7de3-41e4-a665-613a22ecdb41', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_091201_cb430eca-7015-430d-b8ec-4bfd13a62984.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964048133-02c85ad7.png', NULL, 1980530, 0, '2026-02-01 14:49:49.267362+00'),
('6d511d2a-2d06-41c5-a70d-a2ee9b06b837', '137727fa-eed4-4c10-bb11-898ee14909a0', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'hf_20260128_091232_12d0573e-c816-449c-89c0-76b4537db4fa.png', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/delivery/1769964049862-690f8255.png', NULL, 2048608, 0, '2026-02-01 14:49:50.458568+00');

-- =============================================
-- 10. WEDDING_INVITATIONS (2 records)
-- =============================================
INSERT INTO public.wedding_invitations (id, user_id, booking_id, groom_name, bride_name, event_date, event_time, ceremony_time, reception_time, venue_name, venue_address, google_maps_url, google_maps_embed_url, message, cover_image_url, template, theme_color, access_token, is_active, rsvp_enabled, rsvp_deadline, dress_code, dress_code_colors, registry_info, registry_url, accommodation_info, accommodation_links, contact_email, contact_phone, timeline_events, section_backgrounds, view_count, created_at, updated_at) VALUES
('73c72605-1cc7-4baf-b514-3f4523c15500', '2f01c984-12ca-42ea-b753-f59eb17f1a44', NULL, 'แปแ', 'แปแปแ', '2026-03-14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'classic', '#d4af37', '2d1ba8fb695280ab7f0ed2a4880fbac8', true, true, NULL, NULL, '[]', NULL, NULL, NULL, '[]', NULL, NULL, '[{"icon":"default","time":"09:00","title":"ต้อนรับแขก / ลงทะเบียน"},{"icon":"ceremony","time":"09:30","title":"พิธีหมั้น"},{"icon":"ceremony","time":"10:30","title":"พิธีรดน้ำสังข์"},{"icon":"photo","time":"11:30","title":"ถ่ายภาพหมู่ครอบครัว"},{"icon":"dinner","time":"12:00","title":"ร่วมรับประทานอาหารกลางวัน"},{"icon":"cocktail","time":"17:00","title":"ค็อกเทล ต้อนรับแขกงานเลี้ยง"},{"icon":"ceremony","time":"18:00","title":"พิธีแต่งงาน"},{"icon":"party","time":"18:30","title":"เปิดตัวคู่บ่าวสาว & First Dance"},{"icon":"dinner","time":"19:00","title":"ร่วมรับประทานอาหารเย็น"},{"icon":"party","time":"20:00","title":"ตัดเค้ก & เปิดแชมเปญ"},{"icon":"party","time":"21:00","title":"After Party"}]', '{}', 8, '2026-02-14 03:54:48.345771+00', '2026-02-14 05:07:25.558954+00'),
('f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', NULL, 'Saknarin', 'Supansa', '2026-02-14', '06:00:00', '09:29:00', '10:59:00', 'ประโคนชัย', NULL, 'https://maps.app.goo.gl/ZbDxvQUnjWt6U2nY8', NULL, 'ขอเชิญท่านเป็นเกียติ', NULL, 'autumn', '#eecd63', 'c6434ef9b17b991cfb379f52faedc109', true, true, '2026-02-13', NULL, '[]', NULL, NULL, NULL, '[]', NULL, NULL, '[{"icon":"ceremony","time":"06.00","title":"ทานข้าว"},{"icon":"party","time":"12.00","title":"ฉลอง"},{"icon":"default","time":"","title":""}]', '{"countdown":{"image_url":"https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/backgrounds/1771044135551-26bfe517.png","opacity":0.3},"details":{"image_url":"https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/backgrounds/1771044164963-1ad3f8ed.png","opacity":0.3},"footer":{"image_url":"https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/backgrounds/1771044171327-819c365d.png","opacity":0.3},"hero":{"image_url":"https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/backgrounds/1771044124293-22f2c62a.png","opacity":0.3},"rsvp":{"image_url":"https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/backgrounds/1771044175611-6818d94e.png","opacity":0.3},"timeline":{"image_url":"https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/backgrounds/1771044156860-80bab905.png","opacity":0.3},"venue":{"image_url":"https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/backgrounds/1771044145728-ef728d85.png","opacity":0.3}}', 7, '2026-02-13 03:25:19.342704+00', '2026-02-14 05:07:25.178463+00');

-- =============================================
-- 11. INVITATION_IMAGES (8 records)
-- =============================================
INSERT INTO public.invitation_images (id, invitation_id, user_id, image_url, caption, sort_order, created_at) VALUES
('152c792a-fb3c-4d77-88f7-e1dd87f5002b', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953217465-57b5bad0.png', NULL, 0, '2026-02-13 03:26:58.678325+00'),
('531a2429-8038-44f7-936d-7d6a9fd6641d', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953219157-07ac8190.png', NULL, 1, '2026-02-13 03:27:00.313479+00'),
('1688b9c8-2e8c-4e08-b3e4-ade6e66ce1bb', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953220866-dfb7b300.png', NULL, 2, '2026-02-13 03:27:02.015574+00'),
('dfd6eeef-9d57-46c4-b823-dde964f736b4', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953222883-371a7fcc.png', NULL, 3, '2026-02-13 03:27:04.158897+00'),
('55b98982-65ff-459b-93a5-f582f1ddc09d', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953224929-6908ccd1.png', NULL, 4, '2026-02-13 03:27:05.992713+00'),
('5d14c874-5698-465c-a5f1-5a80d769d81d', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953226535-23cc2791.png', NULL, 5, '2026-02-13 03:27:07.849354+00'),
('38a85275-6e07-457b-8280-ecdfd99b1f5b', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953228640-76c42acf.png', NULL, 6, '2026-02-13 03:27:09.841274+00'),
('323cf49c-bf54-4a3a-9485-f2e77d1536b3', 'f8489f9d-5a81-4152-8e1e-9ef1099ee435', '2f01c984-12ca-42ea-b753-f59eb17f1a44', 'https://pub-966655422ff642f1a97b057758c57e87.r2.dev/2f01c984-12ca-42ea-b753-f59eb17f1a44/invitation/f8489f9d-5a81-4152-8e1e-9ef1099ee435/gallery/1770953230371-a6c22b77.png', NULL, 7, '2026-02-13 03:27:11.074229+00');

-- =============================================
-- 12. INVITATION_RSVPS (0 records)
-- =============================================
-- No data

-- =============================================
-- 13. ZIP_UPLOAD_JOBS (1 record)
-- =============================================
INSERT INTO public.zip_upload_jobs (id, user_id, gallery_id, status, progress, total_files, processed_files, uploaded_files, error, created_at, updated_at) VALUES
('ae2249ce-c2d7-4174-93ba-78b628f16cc8', '2f01c984-12ca-42ea-b753-f59eb17f1a44', '137727fa-eed4-4c10-bb11-898ee14909a0', 'pending', 0, 0, 0, '[]', NULL, '2026-02-02 01:52:32.204519+00', '2026-02-02 01:52:32.204519+00');
