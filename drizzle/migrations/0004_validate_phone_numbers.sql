CREATE OR REPLACE FUNCTION public.validate_phone_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE d text; p text;
BEGIN
  IF NEW.phone_number IS NULL OR NEW.phone_number IS NOT DISTINCT FROM (CASE WHEN TG_OP='UPDATE' THEN OLD.phone_number END) THEN
    RETURN NEW;
  END IF;
  IF NEW.phone_number !~ '^[0-9 ().-]+$' THEN RAISE EXCEPTION 'Numero di telefono non valido'; END IF;
  d := regexp_replace(NEW.phone_number, '\D', '', 'g');
  p := regexp_replace(coalesce(NEW.phone_prefix, ''), '\D', '', 'g');
  IF d ~ '^(\d)\1+$' OR length(p) + length(d) > 15 THEN RAISE EXCEPTION 'Numero di telefono non valido'; END IF;
  IF p = '39' THEN
    IF d !~ '^3\d{8,9}$' AND d !~ '^0\d{5,10}$' THEN RAISE EXCEPTION 'Numero di telefono non valido'; END IF;
  ELSIF length(d) < 6 OR length(d) > 14 THEN RAISE EXCEPTION 'Numero di telefono non valido';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER validate_profiles_phone BEFORE INSERT OR UPDATE OF phone_number, phone_prefix ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_phone_number();
CREATE TRIGGER validate_guardians_phone BEFORE INSERT OR UPDATE OF phone_number, phone_prefix ON public.guardians
FOR EACH ROW EXECUTE FUNCTION public.validate_phone_number();