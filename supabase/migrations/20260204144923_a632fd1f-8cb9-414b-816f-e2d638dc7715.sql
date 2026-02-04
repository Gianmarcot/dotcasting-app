-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('talent', 'owner', 'admin');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'talent',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    ethnicity TEXT,
    birth_date DATE,
    city TEXT,
    country TEXT,
    bio TEXT,
    profile_photo_url TEXT,
    visibility_settings JSONB DEFAULT '{"public": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable"
ON public.profiles FOR SELECT
USING ((visibility_settings->>'public')::boolean = true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Talent attributes table
CREATE TABLE public.talent_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    height INTEGER,
    weight INTEGER,
    measurements TEXT,
    clothing_sizes JSONB,
    hair_color TEXT,
    eye_color TEXT,
    languages TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    availability JSONB,
    other_tags TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own attributes"
ON public.talent_attributes FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = talent_attributes.profile_id AND profiles.user_id = auth.uid()));

CREATE POLICY "Owners can view all attributes"
ON public.talent_attributes FOR SELECT
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Companies CRM table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    contacts_json JSONB DEFAULT '[]'::jsonb,
    website TEXT,
    location TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'lead',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage companies"
ON public.companies FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Castings table
CREATE TABLE public.castings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    compensation_type TEXT,
    compensation_amount DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    locations TEXT[] DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'draft',
    cover_image_url TEXT,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.castings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active castings are publicly viewable"
ON public.castings FOR SELECT
USING (status = 'active');

CREATE POLICY "Owners can manage all castings"
ON public.castings FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Casting roles table
CREATE TABLE public.casting_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    casting_id UUID REFERENCES public.castings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    requirements_text TEXT,
    materials_required TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.casting_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Casting roles follow casting visibility"
ON public.casting_roles FOR SELECT
USING (EXISTS (SELECT 1 FROM public.castings WHERE castings.id = casting_roles.casting_id AND castings.status = 'active'));

CREATE POLICY "Owners can manage casting roles"
ON public.casting_roles FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Applications table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    casting_id UUID REFERENCES public.castings(id) ON DELETE CASCADE NOT NULL,
    casting_role_id UUID REFERENCES public.casting_roles(id) ON DELETE SET NULL,
    talent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'submitted',
    cover_note TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(casting_id, talent_user_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talents can view their own applications"
ON public.applications FOR SELECT
USING (auth.uid() = talent_user_id);

CREATE POLICY "Talents can create applications"
ON public.applications FOR INSERT
WITH CHECK (auth.uid() = talent_user_id);

CREATE POLICY "Owners can manage all applications"
ON public.applications FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Saved castings (favorites)
CREATE TABLE public.saved_castings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    casting_id UUID REFERENCES public.castings(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(talent_user_id, casting_id)
);

ALTER TABLE public.saved_castings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talents can manage their saved castings"
ON public.saved_castings FOR ALL
USING (auth.uid() = talent_user_id);

-- Message threads
CREATE TABLE public.message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_type TEXT DEFAULT 'general',
    casting_id UUID REFERENCES public.castings(id) ON DELETE SET NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Message participants
CREATE TABLE public.message_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.message_threads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(thread_id, user_id)
);

ALTER TABLE public.message_participants ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.message_threads(id) ON DELETE CASCADE NOT NULL,
    sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Message RLS policies
CREATE POLICY "Participants can view thread"
ON public.message_threads FOR SELECT
USING (EXISTS (SELECT 1 FROM public.message_participants WHERE message_participants.thread_id = message_threads.id AND message_participants.user_id = auth.uid()));

CREATE POLICY "Owners can view all threads"
ON public.message_threads FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can view their threads"
ON public.message_participants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Owners can manage participants"
ON public.message_participants FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.message_participants WHERE message_participants.thread_id = messages.thread_id AND message_participants.user_id = auth.uid()));

CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.message_participants WHERE message_participants.thread_id = messages.thread_id AND message_participants.user_id = auth.uid()) AND sender_user_id = auth.uid());

CREATE POLICY "Owners can manage messages"
ON public.messages FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Audition events
CREATE TABLE public.audition_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    casting_id UUID REFERENCES public.castings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'audition',
    location_text TEXT,
    is_virtual BOOLEAN DEFAULT false,
    virtual_link_url TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE,
    end_datetime TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audition_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage audition events"
ON public.audition_events FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Audition slots
CREATE TABLE public.audition_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audition_event_id UUID REFERENCES public.audition_events(id) ON DELETE CASCADE NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER DEFAULT 1,
    notes TEXT
);

ALTER TABLE public.audition_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage slots"
ON public.audition_slots FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Audition bookings
CREATE TABLE public.audition_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audition_slot_id UUID REFERENCES public.audition_slots(id) ON DELETE CASCADE NOT NULL,
    talent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'invited',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audition_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talents can view their bookings"
ON public.audition_bookings FOR SELECT
USING (auth.uid() = talent_user_id);

CREATE POLICY "Talents can update their booking status"
ON public.audition_bookings FOR UPDATE
USING (auth.uid() = talent_user_id);

CREATE POLICY "Owners can manage bookings"
ON public.audition_bookings FOR ALL
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    payload_json JSONB DEFAULT '{}'::jsonb,
    channel TEXT DEFAULT 'in_app',
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_castings_updated_at
BEFORE UPDATE ON public.castings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audition_bookings_updated_at
BEFORE UPDATE ON public.audition_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'talent');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();