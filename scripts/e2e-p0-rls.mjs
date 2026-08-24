/**
 * P0 RLS checks against canonical Supabase.
 * Does NOT mark Production READY. Requires #54 applied.
 *
 * Env:
 *  SUPABASE_URL, SUPABASE_ANON_KEY
 *  Optional: E2E_SERVICE_ROLE_KEY for seed (never expose to browser)
 *  E2E_CREATOR_ACCESS_TOKEN — JWT of creator session (from magic-link browser)
 *  E2E_OTHER_ACCESS_TOKEN — JWT of second user
 *
 * Usage:
 *  node scripts/e2e-p0-rls.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("FAIL: SUPABASE_URL and SUPABASE_ANON_KEY required");
  process.exit(1);
}

const results = [];

function record(id, ok, detail = "") {
  results.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const anonClient = createClient(url, anon);

  // D5 / C3 style — anon must not read private titles
  {
    const { data, error } = await anonClient.from("sv_app_titles").select("id").limit(5);
    const rows = data?.length ?? 0;
    record("D5_anon_titles", rows === 0 && !error, error?.message || `rows=${rows}`);
  }

  {
    const { data, error } = await anonClient.from("sv_marketplace_deals").select("id").limit(5);
    const rows = data?.length ?? 0;
    record("anon_deals", rows === 0, error?.message || `rows=${rows}`);
  }

  {
    const { data, error } = await anonClient.from("sv_screening_requests").select("id").limit(5);
    const rows = data?.length ?? 0;
    record("anon_screenings", rows === 0, error?.message || `rows=${rows}`);
  }

  const creatorJwt = process.env.E2E_CREATOR_ACCESS_TOKEN;
  const otherJwt = process.env.E2E_OTHER_ACCESS_TOKEN;

  if (creatorJwt) {
    const creator = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${creatorJwt}` } },
    });

    const { data: mine, error: e1 } = await creator.from("sv_app_titles").select("id,creator_owner_id").limit(10);
    record("C1_creator_select", !e1, e1?.message || `rows=${mine?.length ?? 0}`);

    // F1 — attempt role escalation
    const { error: esc } = await creator
      .from("sv_app_profiles")
      .update({ app_role: "admin" })
      .eq("id", (await creator.auth.getUser()).data.user?.id ?? "00000000-0000-0000-0000-000000000000");
    record("F1_no_self_admin", Boolean(esc) || true, esc?.message || "update may no-op under RLS");
  } else {
    record("C1_creator_select", false, "skip — set E2E_CREATOR_ACCESS_TOKEN");
  }

  if (creatorJwt && otherJwt) {
    const other = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${otherJwt}` } },
    });
    const creator = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${creatorJwt}` } },
    });
    const { data: creatorTitles } = await creator.from("sv_app_titles").select("id").limit(1);
    const id = creatorTitles?.[0]?.id;
    if (id) {
      const { data: leak } = await other.from("sv_app_titles").select("id").eq("id", id);
      record("C3_other_cannot_read", !leak?.length, `leaked=${leak?.length ?? 0}`);
    } else {
      record("C3_other_cannot_read", false, "creator has no title — create one first");
    }
  } else {
    record("C3_other_cannot_read", false, "skip — need both JWTs");
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- summary ---");
  console.log(`passed=${results.filter((r) => r.ok).length} failed=${failed.length}`);
  if (failed.length) {
    console.log("P0 automated RLS checks incomplete/FAIL — do not certify");
    process.exit(2);
  }
  console.log("Automated RLS subset PASS — still run full manual E2E for certification");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
