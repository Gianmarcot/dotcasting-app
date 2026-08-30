-- 1) handle_new_user: la riga profilo nasce già con l'email dell'account,
--    così non serve nessun trigger su INSERT e nessuna dipendenza dall'ordine dei trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, contact_email)
    VALUES (NEW.id, NEW.email);

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'talent');

    RETURN NEW;
END;
$function$;

-- 2) Propagazione del cambio email dell'account sul profilo.
CREATE OR REPLACE FUNCTION public.sync_profile_contact_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
     SET contact_email = NEW.email,
         updated_at = now()
   WHERE user_id = NEW.id;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.sync_profile_contact_email();

COMMENT ON COLUMN public.profiles.contact_email IS
  'sincronizzata dal database con l''email dell''utente auth in user_id; il client non deve scriverla';