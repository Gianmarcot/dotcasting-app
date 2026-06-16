
-- 1. Singleton settings table
CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true,
  agency_name text,
  agency_logo_url text,
  contact_email text,
  contact_phone text,
  website_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id)
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Branding is shown on public shared-round page → readable by anyone
CREATE POLICY "app_settings readable" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "owner/admin update settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "owner/admin insert settings" ON public.app_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

-- Seed singleton row
INSERT INTO public.app_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER app_settings_touch_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Storage policies on branding bucket (bucket will be created via storage tool)
CREATE POLICY "branding public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

CREATE POLICY "branding owner/admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "branding owner/admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "branding owner/admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin')));

-- 3. Extend get_shared_round RPC to include branding payload
CREATE OR REPLACE FUNCTION public.get_shared_round(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_round   public.casting_rounds%ROWTYPE;
  v_role    public.casting_roles%ROWTYPE;
  v_casting public.castings%ROWTYPE;
  v_talents jsonb;
  v_branding jsonb;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT * INTO v_round
  FROM public.casting_rounds
  WHERE share_token = p_token AND status = 'shared'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT * INTO v_role FROM public.casting_roles WHERE id = v_round.casting_role_id;
  SELECT * INTO v_casting FROM public.castings WHERE id = v_round.casting_id;

  SELECT jsonb_build_object(
    'agency_name', agency_name,
    'agency_logo_url', agency_logo_url,
    'contact_email', contact_email
  ) INTO v_branding
  FROM public.app_settings WHERE id = true;

  SELECT COALESCE(jsonb_agg(t ORDER BY t->>'role_talent_id'), '[]'::jsonb)
  INTO v_talents
  FROM (
    SELECT jsonb_build_object(
      'role_talent_id', crt.role_talent_id,
      'pdf_path', crt.pdf_path,
      'profile', jsonb_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'stage_name', p.stage_name,
        'gender', p.gender,
        'ethnicity', p.ethnicity,
        'birth_date', p.birth_date,
        'city', p.city,
        'country', p.country,
        'nationality', p.nationality,
        'work_cities', p.work_cities,
        'phone_prefix', p.phone_prefix,
        'phone_number', p.phone_number,
        'whatsapp_prefix', p.whatsapp_prefix,
        'whatsapp_number', p.whatsapp_number,
        'website_url', p.website_url,
        'contact_email', p.contact_email,
        'driving_licenses', p.driving_licenses,
        'travel_availability', p.travel_availability
      ),
      'attributes', to_jsonb(ta.*) - 'id' - 'profile_id' - 'created_at' - 'updated_at',
      'media', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'url', tm.url,
          'sort_order', tm.sort_order,
          'media_type', tm.media_type,
          'category', tm.category
        ) ORDER BY tm.sort_order)
        FROM public.talent_media tm
        WHERE tm.profile_id = p.id
          AND tm.media_type = 'photo'
          AND COALESCE(tm.category, 'main_photos') = 'main_photos'
      ), '[]'::jsonb)
    ) AS t
    FROM public.casting_round_talents crt
    JOIN public.role_talents rt    ON rt.id = crt.role_talent_id
    JOIN public.profiles p         ON p.id = rt.talent_profile_id
    LEFT JOIN public.talent_attributes ta ON ta.profile_id = p.id
    WHERE crt.round_id = v_round.id
  ) sub;

  RETURN jsonb_build_object(
    'round', jsonb_build_object(
      'id', v_round.id,
      'label', v_round.label,
      'field_preset', v_round.field_preset,
      'shared_at', v_round.shared_at
    ),
    'casting', jsonb_build_object('title', v_casting.title),
    'role', jsonb_build_object('name', v_role.name),
    'branding', COALESCE(v_branding, '{}'::jsonb),
    'talents', v_talents
  );
END;
$function$;
