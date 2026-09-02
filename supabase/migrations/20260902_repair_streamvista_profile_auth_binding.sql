-- Repair the live StreamVista profile/auth binding.
-- Production uses public.sv_app_profiles.email as its primary key and id -> auth.users(id).
-- This migration backfills id for existing accounts and keeps future auth users bound to profiles.

DO $$
BEGIN
  UPDATE public.sv_app_profiles p
  SET id = u.id,
      updated_at = now()
  FROM auth.users u
  WHERE lower(u.email) = lower(p.email)
    AND p.id IS NULL;

  CREATE OR REPLACE FUNCTION public.handle_new_streamvista_app_profile()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, auth, pg_catalog
  AS $fn$
  BEGIN
    INSERT INTO public.sv_app_profiles
      (email, id, app_role, is_active, verification_status, created_at, updated_at)
    VALUES
      (
        lower(coalesce(new.email,'')),
        new.id,
        CASE
          WHEN lower(coalesce(new.email,'')) = 'abijithasokan@crayonspictures.com' THEN 'admin'
          ELSE 'creator_partner'
        END,
        true,
        CASE
          WHEN lower(coalesce(new.email,'')) = 'abijithasokan@crayonspictures.com' THEN 'verified'
          ELSE 'pending'
        END,
        now(),
        now()
      )
    ON CONFLICT (email) DO UPDATE
      SET id = excluded.id,
          updated_at = now();
    RETURN new;
  END;
  $fn$;

  REVOKE ALL ON FUNCTION public.handle_new_streamvista_app_profile() FROM public, anon;
  GRANT EXECUTE ON FUNCTION public.handle_new_streamvista_app_profile() TO supabase_auth_admin, service_role;

  DROP TRIGGER IF EXISTS on_auth_user_created_streamvista_profile ON auth.users;
  CREATE TRIGGER on_auth_user_created_streamvista_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_streamvista_app_profile();
END $$;
