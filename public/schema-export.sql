-- =============================================
-- FULL DATABASE SCHEMA EXPORT
-- Project: SnapConfirm Flow
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.booking_status AS ENUM ('draft', 'waiting_deposit', 'booked', 'completed', 'cancelled');
CREATE TYPE public.job_type AS ENUM ('wedding', 'event', 'corporate', 'portrait', 'other');

-- 2. TABLES

-- profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  studio_name text NOT NULL DEFAULT 'My Photography Studio',
  full_name text,
  email text,
  phone text,
  address text,
  logo_url text,
  signature_url text,
  show_signature boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  service_details text DEFAULT '• ถ่ายภาพไม่จำกัดจำนวน
• ปรับโทน/แสง/สี ทุกภาพ
• ส่ง Demo 30-80 ภาพใน 24 ชั่วโมง
• ส่งไฟล์ภาพทั้งหมดภายใน 3-7 วัน
• ส่งไฟล์ภาพทาง Google Drive / Google Photos
• Backup ไฟล์ไว้ให้ 1 ปี',
  booking_terms text DEFAULT '• ใบยืนยันการจองนี้มีผลเมื่อได้รับการชำระค่ามัดจำแล้ว
• ยอดคงเหลือชำระในวันงาน หรือก่อนวันงาน
• นโยบายการยกเลิกการจองจะไม่คืนมัดจำ
• กรุณาติดต่อเราหากต้องการเปลี่ยนแปลงรายละเอียดการจอง',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- packages
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  job_type public.job_type DEFAULT 'event',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- bookings
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  booking_number text NOT NULL,
  client_name text NOT NULL,
  client_phone text,
  client_email text,
  client_note text,
  job_type public.job_type NOT NULL DEFAULT 'event',
  event_date date NOT NULL,
  time_start time,
  time_end time,
  location text,
  notes text,
  package_id uuid REFERENCES public.packages(id),
  total_price numeric NOT NULL DEFAULT 0,
  deposit_amount numeric NOT NULL DEFAULT 0,
  deposit_received_date date,
  status public.booking_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- quotations
CREATE TABLE public.quotations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  quotation_number text NOT NULL,
  client_name text NOT NULL,
  client_phone text,
  client_email text,
  client_note text,
  job_type public.job_type NOT NULL DEFAULT 'event',
  event_date date,
  time_start time,
  time_end time,
  location text,
  notes text,
  package_id uuid REFERENCES public.packages(id),
  total_price numeric NOT NULL DEFAULT 0,
  valid_until date,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- share_tokens
CREATE TABLE public.share_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  booking_id uuid REFERENCES public.bookings(id),
  quotation_id uuid REFERENCES public.quotations(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- portfolio_images
CREATE TABLE public.portfolio_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  title text,
  description text,
  job_type public.job_type NOT NULL DEFAULT 'event',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- delivery_galleries
CREATE TABLE public.delivery_galleries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  description text,
  booking_id uuid REFERENCES public.bookings(id),
  access_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  layout text NOT NULL DEFAULT 'grid-4',
  cover_image_url text,
  show_cover boolean NOT NULL DEFAULT false,
  face_search_enabled boolean NOT NULL DEFAULT true,
  fullscreen_mode boolean NOT NULL DEFAULT false,
  full_width_layout boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  download_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- delivery_images
CREATE TABLE public.delivery_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id uuid NOT NULL REFERENCES public.delivery_galleries(id),
  user_id uuid NOT NULL,
  filename text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  file_size integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- wedding_invitations
CREATE TABLE public.wedding_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  booking_id uuid REFERENCES public.bookings(id),
  groom_name text NOT NULL,
  bride_name text NOT NULL,
  event_date date NOT NULL,
  event_time time,
  ceremony_time time,
  reception_time time,
  venue_name text,
  venue_address text,
  google_maps_url text,
  google_maps_embed_url text,
  message text,
  cover_image_url text,
  template text NOT NULL DEFAULT 'classic',
  theme_color text DEFAULT '#d4af37',
  access_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  rsvp_enabled boolean NOT NULL DEFAULT true,
  rsvp_deadline date,
  dress_code text,
  dress_code_colors jsonb DEFAULT '[]',
  registry_info text,
  registry_url text,
  accommodation_info text,
  accommodation_links jsonb DEFAULT '[]',
  contact_email text,
  contact_phone text,
  timeline_events jsonb DEFAULT '[]',
  section_backgrounds jsonb DEFAULT '{}',
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- invitation_images
CREATE TABLE public.invitation_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id uuid NOT NULL REFERENCES public.wedding_invitations(id),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- invitation_rsvps
CREATE TABLE public.invitation_rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id uuid NOT NULL REFERENCES public.wedding_invitations(id),
  guest_name text NOT NULL,
  guest_phone text,
  guest_email text,
  attending boolean NOT NULL,
  guest_count integer DEFAULT 1,
  message text,
  dietary_requirements text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- zip_upload_jobs
CREATE TABLE public.zip_upload_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  gallery_id uuid NOT NULL REFERENCES public.delivery_galleries(id),
  status text NOT NULL DEFAULT 'pending',
  progress integer NOT NULL DEFAULT 0,
  total_files integer DEFAULT 0,
  processed_files integer DEFAULT 0,
  uploaded_files jsonb DEFAULT '[]',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zip_upload_jobs ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (is_admin(auth.uid()));

-- user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (is_admin(auth.uid()));

-- packages
CREATE POLICY "Users can view their own packages" ON public.packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own packages" ON public.packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own packages" ON public.packages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own packages" ON public.packages FOR DELETE USING (auth.uid() = user_id);

-- bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookings" ON public.bookings FOR DELETE USING (auth.uid() = user_id);

-- quotations
CREATE POLICY "Users can view their own quotations" ON public.quotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quotations" ON public.quotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotations" ON public.quotations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotations" ON public.quotations FOR DELETE USING (auth.uid() = user_id);

-- share_tokens
CREATE POLICY "Users can view own share tokens" ON public.share_tokens FOR SELECT
  USING (
    (booking_id IS NOT NULL AND EXISTS (SELECT 1 FROM bookings WHERE bookings.id = share_tokens.booking_id AND bookings.user_id = auth.uid()))
    OR (quotation_id IS NOT NULL AND EXISTS (SELECT 1 FROM quotations WHERE quotations.id = share_tokens.quotation_id AND quotations.user_id = auth.uid()))
  );
CREATE POLICY "Users can create share tokens for own bookings" ON public.share_tokens FOR INSERT
  WITH CHECK (
    (booking_id IS NOT NULL AND EXISTS (SELECT 1 FROM bookings WHERE bookings.id = share_tokens.booking_id AND bookings.user_id = auth.uid()))
    OR (quotation_id IS NOT NULL AND EXISTS (SELECT 1 FROM quotations WHERE quotations.id = share_tokens.quotation_id AND quotations.user_id = auth.uid()))
  );
CREATE POLICY "Users can delete own share tokens" ON public.share_tokens FOR DELETE
  USING (
    (booking_id IS NOT NULL AND EXISTS (SELECT 1 FROM bookings WHERE bookings.id = share_tokens.booking_id AND bookings.user_id = auth.uid()))
    OR (quotation_id IS NOT NULL AND EXISTS (SELECT 1 FROM quotations WHERE quotations.id = share_tokens.quotation_id AND quotations.user_id = auth.uid()))
  );

-- portfolio_images
CREATE POLICY "Anyone can view portfolio images" ON public.portfolio_images FOR SELECT USING (true);
CREATE POLICY "Users can create their own portfolio images" ON public.portfolio_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio images" ON public.portfolio_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolio images" ON public.portfolio_images FOR DELETE USING (auth.uid() = user_id);

-- delivery_galleries
CREATE POLICY "Users can view their own delivery galleries" ON public.delivery_galleries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own delivery galleries" ON public.delivery_galleries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own delivery galleries" ON public.delivery_galleries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own delivery galleries" ON public.delivery_galleries FOR DELETE USING (auth.uid() = user_id);

-- delivery_images
CREATE POLICY "Users can view their own delivery images" ON public.delivery_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own delivery images" ON public.delivery_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own delivery images" ON public.delivery_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own delivery images" ON public.delivery_images FOR DELETE USING (auth.uid() = user_id);

-- wedding_invitations
CREATE POLICY "Users can view their own invitations" ON public.wedding_invitations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own invitations" ON public.wedding_invitations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invitations" ON public.wedding_invitations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invitations" ON public.wedding_invitations FOR DELETE USING (auth.uid() = user_id);

-- invitation_images
CREATE POLICY "Users can view their own invitation images" ON public.invitation_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own invitation images" ON public.invitation_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invitation images" ON public.invitation_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invitation images" ON public.invitation_images FOR DELETE USING (auth.uid() = user_id);

-- invitation_rsvps
CREATE POLICY "Anyone can submit RSVP" ON public.invitation_rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Invitation owners can view RSVPs" ON public.invitation_rsvps FOR SELECT
  USING (EXISTS (SELECT 1 FROM wedding_invitations WHERE wedding_invitations.id = invitation_rsvps.invitation_id AND wedding_invitations.user_id = auth.uid()));
CREATE POLICY "Invitation owners can delete RSVPs" ON public.invitation_rsvps FOR DELETE
  USING (EXISTS (SELECT 1 FROM wedding_invitations WHERE wedding_invitations.id = invitation_rsvps.invitation_id AND wedding_invitations.user_id = auth.uid()));

-- zip_upload_jobs
CREATE POLICY "Users can view their own jobs" ON public.zip_upload_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own jobs" ON public.zip_upload_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON public.zip_upload_jobs FOR UPDATE USING (auth.uid() = user_id);

-- 5. FUNCTIONS

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.booking_number := 'BK-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.quotation_number := 'QT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_blocked(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

CREATE OR REPLACE FUNCTION public.get_share_data(share_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  token_record RECORD;
BEGIN
  SELECT * INTO token_record FROM public.share_tokens 
  WHERE token = share_token AND (expires_at IS NULL OR expires_at > now());
  IF token_record IS NULL THEN RETURN NULL; END IF;
  IF token_record.booking_id IS NOT NULL THEN
    SELECT json_build_object('type', 'booking', 'data', row_to_json(b), 'profile', row_to_json(p))
    INTO result FROM public.bookings b LEFT JOIN public.profiles p ON p.user_id = b.user_id WHERE b.id = token_record.booking_id;
  ELSE
    SELECT json_build_object('type', 'quotation', 'data', row_to_json(q), 'profile', row_to_json(p))
    INTO result FROM public.quotations q LEFT JOIN public.profiles p ON p.user_id = q.user_id WHERE q.id = token_record.quotation_id;
  END IF;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_quotation_by_token(share_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  token_record RECORD;
BEGIN
  SELECT * INTO token_record FROM public.share_tokens 
  WHERE token = share_token AND quotation_id IS NOT NULL AND (expires_at IS NULL OR expires_at > now());
  IF token_record IS NULL THEN RETURN FALSE; END IF;
  UPDATE public.quotations SET status = 'accepted', updated_at = now() WHERE id = token_record.quotation_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_portfolio_by_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.user_id = p_user_id),
    'images', (SELECT COALESCE(json_agg(row_to_json(i) ORDER BY i.sort_order, i.created_at DESC), '[]'::json) FROM public.portfolio_images i WHERE i.user_id = p_user_id),
    'packages', (SELECT COALESCE(json_agg(row_to_json(pkg) ORDER BY pkg.sort_order), '[]'::json) FROM public.packages pkg WHERE pkg.user_id = p_user_id AND pkg.is_active = true)
  ) INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_delivery_gallery_by_token(p_access_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  gallery_record RECORD;
BEGIN
  SELECT * INTO gallery_record FROM public.delivery_galleries 
  WHERE access_token = p_access_token AND is_active = true AND (expires_at IS NULL OR expires_at > now());
  IF gallery_record IS NULL THEN RETURN NULL; END IF;
  UPDATE public.delivery_galleries SET download_count = download_count + 1 WHERE id = gallery_record.id;
  SELECT json_build_object(
    'gallery', row_to_json(gallery_record),
    'images', (SELECT COALESCE(json_agg(row_to_json(i) ORDER BY i.sort_order, i.created_at), '[]'::json) FROM public.delivery_images i WHERE i.gallery_id = gallery_record.id),
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.user_id = gallery_record.user_id)
  ) INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_access_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  invitation_record RECORD;
BEGIN
  SELECT * INTO invitation_record FROM public.wedding_invitations 
  WHERE access_token = p_access_token AND is_active = true;
  IF invitation_record IS NULL THEN RETURN NULL; END IF;
  UPDATE public.wedding_invitations SET view_count = view_count + 1 WHERE id = invitation_record.id;
  SELECT json_build_object(
    'invitation', row_to_json(invitation_record),
    'images', (SELECT COALESCE(json_agg(row_to_json(i) ORDER BY i.sort_order, i.created_at), '[]'::json) FROM public.invitation_images i WHERE i.invitation_id = invitation_record.id),
    'rsvp_count', (SELECT json_build_object(
      'attending', COALESCE(SUM(CASE WHEN attending THEN guest_count ELSE 0 END), 0),
      'not_attending', COALESCE(COUNT(*) FILTER (WHERE NOT attending), 0)
    ) FROM public.invitation_rsvps WHERE invitation_id = invitation_record.id),
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.user_id = invitation_record.user_id)
  ) INTO result;
  RETURN result;
END;
$$;

-- 6. TRIGGERS

-- Auto-create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate booking number
CREATE TRIGGER generate_booking_number_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.generate_booking_number();

-- Auto-generate quotation number
CREATE TRIGGER generate_quotation_number_trigger
  BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.generate_quotation_number();

-- Auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_galleries_updated_at BEFORE UPDATE ON public.delivery_galleries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wedding_invitations_updated_at BEFORE UPDATE ON public.wedding_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_zip_upload_jobs_updated_at BEFORE UPDATE ON public.zip_upload_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-assets', 'profile-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-images', 'delivery-images', true);
