CREATE OR REPLACE FUNCTION public.get_shared_round(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round   public.casting_rounds%ROWTYPE;
  v_role    public.casting_roles%ROWTYPE;
  v_casting public.castings%ROWTYPE;
  v_talents jsonb;
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
    'talents', v_talents
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_round(text) TO anon, authenticated;