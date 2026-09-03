-- Canonical StreamVista streaming media registry.
-- Stores media metadata only; bytes remain in the private streamvista-films bucket.

create table if not exists public.sv_stream_assets (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.sv_app_titles(id) on delete cascade,
  owner_id uuid not null references public.sv_app_profiles(id) on delete cascade,
  asset_path text not null,
  manifest_url text,
  playback_status text not null default 'uploaded' check (playback_status in ('uploaded','processing','ready','failed','archived')),
  visibility text not null default 'private' check (visibility in ('private','screening','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sv_stream_assets enable row level security;

drop policy if exists sv_stream_assets_owner_read on public.sv_stream_assets;
create policy sv_stream_assets_owner_read on public.sv_stream_assets for select to authenticated
  using (owner_id = auth.uid() or private.sv_app_is_admin() or (visibility in ('screening','published') and private.sv_buyer_verified()));

drop policy if exists sv_stream_assets_owner_insert on public.sv_stream_assets;
create policy sv_stream_assets_owner_insert on public.sv_stream_assets for insert to authenticated
  with check (owner_id = auth.uid() or private.sv_app_is_admin());

drop policy if exists sv_stream_assets_owner_update on public.sv_stream_assets;
create policy sv_stream_assets_owner_update on public.sv_stream_assets for update to authenticated
  using (owner_id = auth.uid() or private.sv_app_is_admin())
  with check (owner_id = auth.uid() or private.sv_app_is_admin());

drop policy if exists sv_stream_assets_owner_delete on public.sv_stream_assets;
create policy sv_stream_assets_owner_delete on public.sv_stream_assets for delete to authenticated
  using (owner_id = auth.uid() or private.sv_app_is_admin());

create index if not exists idx_sv_stream_assets_title on public.sv_stream_assets(title_id);
create index if not exists idx_sv_stream_assets_owner on public.sv_stream_assets(owner_id);
create index if not exists idx_sv_stream_assets_playback on public.sv_stream_assets(playback_status, visibility);
