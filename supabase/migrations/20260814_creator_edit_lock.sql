-- StreamVista creator safety gate.
-- Keep creator title editing disabled at the database layer until the legacy
-- recovery/migration path is independently verified and explicitly unlocked.
-- Creator INSERT remains governed by sv_titles_creator_insert (upload flow).

begin;

drop policy if exists sv_titles_creator_update on public.sv_app_titles;

commit;
