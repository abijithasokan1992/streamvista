-- StreamVista creator reactivation: read-only legacy draft access.
-- This migration does not move or rewrite legacy draft data.

create or replace function public.sv_my_legacy_drafts()
returns table(
  legacy_draft_id text,
  title text,
  content_type text,
  language text,
  country text,
  producer text,
  director text,
  current_tab text,
  rights_available boolean,
  distribution_territories text,
  legacy_updated_at timestamp without time zone
)
language sql
stable
security definer
set search_path = public, auth, pg_catalog
as $$
  select
    d.legacy_draft_id,
    coalesce(nullif(trim(d.title), ''), 'Untitled draft') as title,
    d.content_type,
    d.language,
    d.country,
    d.producer,
    d.director,
    d.current_tab,
    d.rights_available,
    d.distribution_territories,
    d.legacy_updated_at
  from public.bridge_drafts d
  join public.legacy_accounts a
    on a.legacy_id::text = d.legacy_uploader_id
  where auth.uid() is not null
    and a.is_active = true
    and lower(a.email) = lower(coalesce(auth.jwt()->>'email', ''))
  order by d.legacy_updated_at desc nulls last, d.legacy_draft_id;
$$;

revoke all on function public.sv_my_legacy_drafts() from public, anon;
grant execute on function public.sv_my_legacy_drafts() to authenticated;
