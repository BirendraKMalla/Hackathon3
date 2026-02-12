
-- =============================================
-- Kathmandu Rental Platform - Complete Schema
-- =============================================

-- 1. Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('owner', 'tenant');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  consent_agreed BOOLEAN NOT NULL DEFAULT false,
  trust_score NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. KYC table
CREATE TYPE public.kyc_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE public.kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  citizenship_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;

-- 4. Properties table
CREATE TYPE public.furnished_status AS ENUM ('furnished', 'semi-furnished', 'unfurnished');
CREATE TYPE public.water_facility AS ENUM ('24hr', 'limited', 'tanker');
CREATE TYPE public.preferred_tenant AS ENUM ('family', 'bachelor', 'female', 'married', 'any');
CREATE TYPE public.owner_living AS ENUM ('living_there', 'not_living_there');

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  rooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  kitchen INTEGER NOT NULL DEFAULT 1,
  size_sqft NUMERIC NOT NULL DEFAULT 0,
  floor_number INTEGER NOT NULL DEFAULT 0,
  is_top_floor BOOLEAN DEFAULT false,
  furnished furnished_status NOT NULL DEFAULT 'unfurnished',
  water water_facility NOT NULL DEFAULT 'limited',
  electricity BOOLEAN NOT NULL DEFAULT true,
  wifi BOOLEAN NOT NULL DEFAULT false,
  parking BOOLEAN NOT NULL DEFAULT false,
  distance_highway_km NUMERIC DEFAULT 0,
  owner_family_members INTEGER DEFAULT 0,
  owner_living owner_living NOT NULL DEFAULT 'not_living_there',
  preferred_tenant preferred_tenant NOT NULL DEFAULT 'any',
  rent_amount NUMERIC NOT NULL DEFAULT 0,
  latitude NUMERIC NOT NULL DEFAULT 27.7172,
  longitude NUMERIC NOT NULL DEFAULT 85.3240,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 5. Property images
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- 6. Tenant preferences
CREATE TABLE public.tenant_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferred_lat NUMERIC DEFAULT 27.7172,
  preferred_lng NUMERIC DEFAULT 85.3240,
  search_radius_km NUMERIC NOT NULL DEFAULT 3,
  rooms INTEGER DEFAULT 1,
  furnished_pref furnished_status,
  water_req water_facility,
  wifi_req BOOLEAN DEFAULT false,
  parking_req BOOLEAN DEFAULT false,
  max_rent NUMERIC DEFAULT 50000,
  tenant_type preferred_tenant DEFAULT 'any',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_preferences ENABLE ROW LEVEL SECURITY;

-- 7. Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 8. Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 9. Bookings
CREATE TYPE public.booking_status AS ENUM ('requested', 'confirmed', 'canceled', 'completed');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status booking_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 10. Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 11. Transactions
CREATE TYPE public.transaction_type AS ENUM ('chat_credit', 'commission', 'reward');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  type transaction_type NOT NULL,
  description TEXT DEFAULT '',
  chat_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Security definer helper functions
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_kyc_verified(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kyc
    WHERE user_id = _user_id AND status = 'verified'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conv_id AND (tenant_id = _user_id OR owner_id = _user_id)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_booking_participant(_booking_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = _booking_id AND (tenant_id = _user_id OR owner_id = _user_id)
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tenant_preferences_updated_at BEFORE UPDATE ON public.tenant_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- RLS Policies
-- =============================================

-- user_roles: users can read their own role, insert during signup
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public profiles readable" ON public.profiles FOR SELECT TO authenticated USING (true);

-- kyc
CREATE POLICY "Users can read own kyc" ON public.kyc FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can submit kyc" ON public.kyc FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- properties: everyone reads available, owner manages own
CREATE POLICY "Anyone can read available properties" ON public.properties FOR SELECT TO authenticated USING (is_available = true OR owner_id = auth.uid());
CREATE POLICY "Owner can create property" ON public.properties FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner can update own property" ON public.properties FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can delete own property" ON public.properties FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- property_images
CREATE POLICY "Anyone can read property images" ON public.property_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can add property images" ON public.property_images FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Owner can delete property images" ON public.property_images FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
);

-- tenant_preferences
CREATE POLICY "Tenant can read own preferences" ON public.tenant_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Tenant can insert preferences" ON public.tenant_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tenant can update preferences" ON public.tenant_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- conversations
CREATE POLICY "Participants can read conversations" ON public.conversations FOR SELECT TO authenticated USING (tenant_id = auth.uid() OR owner_id = auth.uid());
CREATE POLICY "Tenant can create conversation" ON public.conversations FOR INSERT TO authenticated WITH CHECK (tenant_id = auth.uid());

-- messages
CREATE POLICY "Participants can read messages" ON public.messages FOR SELECT TO authenticated USING (
  public.is_conversation_participant(conversation_id, auth.uid())
);
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND public.is_conversation_participant(conversation_id, auth.uid())
);

-- bookings
CREATE POLICY "Participants can read bookings" ON public.bookings FOR SELECT TO authenticated USING (tenant_id = auth.uid() OR owner_id = auth.uid());
CREATE POLICY "Tenant can create booking" ON public.bookings FOR INSERT TO authenticated WITH CHECK (tenant_id = auth.uid());
CREATE POLICY "Participants can update booking" ON public.bookings FOR UPDATE TO authenticated USING (tenant_id = auth.uid() OR owner_id = auth.uid());

-- reviews
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Booking participant can create review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  reviewer_id = auth.uid() AND public.is_booking_participant(booking_id, auth.uid())
);

-- transactions
CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- =============================================
-- Storage buckets
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Users can upload own KYC docs" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own KYC docs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view property images" ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Owners can upload property images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete property images" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
