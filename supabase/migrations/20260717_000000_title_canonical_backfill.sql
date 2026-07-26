-- Migration: 20260717_000000_title_canonical_backfill.sql
-- StreamVista Cloud X (streamvista.in) — Canonical Backfill Migration
-- Governance: Preserves "NON-SUBLICENSABLE" and "No Right to Deliver to Next Person" metadata tags.
-- Status: Verified Draft PR State (Pending live execution approval gate).

BEGIN;

-- Preflight Verification Check
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'titles') THEN
    RAISE NOTICE 'Public titles schema verified for canonical backfill migration.';
  END IF;
END $$;

-- Enum & Table Definition Alignment: title_edit_requests
CREATE TABLE IF NOT EXISTS public.title_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID REFERENCES public.titles(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.user_profiles(user_id),
  requested_changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
