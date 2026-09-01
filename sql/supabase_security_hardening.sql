-- ==============================================================================
-- OPTION A: STRICT ALLOWLIST MIGRATION (MAXIMUM PRODUCTION HARDENING)
-- Philosophy: Hide ALL sensitive schemas from pg_graphql anon/authenticated.
-- Re-grant ONLY strictly whitelisted public read-only catalog tables.
-- ==============================================================================

-- 1. REVOKE DEFAULT PUBLIC SCHEMA GRANTS FROM UNPRIVILEGED ROLES
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- 2. HARDEN SECURITY DEFINER FUNCTION & PIN SEARCH_PATH (CRITICAL P0)
REVOKE EXECUTE ON FUNCTION public.handle_streamvista_auth_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.handle_streamvista_auth_user() TO supabase_auth_admin, service_role;

ALTER FUNCTION public.handle_streamvista_auth_user()
SET search_path = public, pg_catalog;

-- 3. STRICT ISOLATION ON FINANCIAL & WEBHOOK OBJECTS (SERVICE_ROLE EXCLUSIVE)
ALTER TABLE sv_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE razorpay_webhook_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE sv_payment_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY deny_all_public_sv_payments ON sv_payments
FOR ALL TO public USING (false);

CREATE POLICY deny_all_public_razorpay_webhook_ledger ON razorpay_webhook_ledger
FOR ALL TO public USING (false);

-- 4. DEAL ROOM & MARKETPLACE ENFORCEMENT (OWNER-ONLY ISOLATION)
ALTER TABLE sv_marketplace_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_marketplace_deals ON sv_marketplace_deals
FOR SELECT TO authenticated
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY select_own_deal ON deal
FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY deny_anon_deal ON deal
FOR ALL TO anon USING (false);

-- 5. RE-GRANT ONLY STRICT PUBLIC CONSUMER SURFACES (CATALOG TITLES)
GRANT SELECT ON sv_app_titles TO anon, authenticated;
GRANT SELECT ON sv_title_rights TO authenticated;

-- Enforce Non-Sublicensable Distribution Rule
ALTER TABLE sv_title_rights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enforce Non-Sublicensable Distribution"
ON sv_title_rights
FOR SELECT TO authenticated
USING (
  auth.uid() = owner_id 
  OR auth.uid() = licensed_buyer_id
);
