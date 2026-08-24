import { assertSupabaseConfigured, supabase } from "./supabase";

export type TitleStatus = "draft" | "submitted" | "qc" | "approved" | "licensed" | "archived";
export type FilmPayload = {
  title: string;
  synopsis: string;
  trailer_url: string;
  film_path: string;
  language: string;
  price: number;
  rights: { territory: string; duration: string };
  workflow_version: "b2b-final-v1";
  qc_note?: string;
};
export type MarketplaceTitle = { id: string; creator_owner_id: string; payload: FilmPayload; status: TitleStatus; created_at: string; updated_at: string };
export type Deal = { id: string; title_id: string; buyer_id: string; status: string; contract_status: string; payment_status: string; price: number; revenue_split: number; created_at: string };
export type ScreeningRequest = { id: string; buyer_id: string; title_id: string; status: "requested" | "approved" | "declined" | "watched"; created_at: string; title?: { payload?: FilmPayload } | null };

type CanonicalTitleRow = {
  id: string;
  creator_id: string;
  title: string;
  synopsis: string | null;
  primary_language: string | null;
  status: string;
  commercial_profile: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type CanonicalDealRow = {
  id: string;
  title_id: string;
  buyer_id: string;
  stage: string;
  contract_status: string;
  payment_status: string;
  offer_amount: number | string | null;
  creator_share_percent: number | string | null;
  created_at: string;
};

function throwIf(error: { message: string } | null) { if (error) throw new Error(error.message); }
function canonicalStatus(status: TitleStatus) { return status === "approved" ? "ready_for_distribution" : status; }
function appStatus(status: string): TitleStatus { return status === "ready_for_distribution" ? "approved" : status as TitleStatus; }

function mapTitle(row: CanonicalTitleRow): MarketplaceTitle {
  const commercial = row.commercial_profile || {};
  const metadata = row.metadata || {};
  const rights = (commercial.rights && typeof commercial.rights === "object" ? commercial.rights : {}) as Record<string, unknown>;
  return {
    id: row.id,
    creator_owner_id: row.creator_id,
    status: appStatus(row.status),
    created_at: row.created_at,
    updated_at: row.updated_at,
    payload: {
      title: row.title,
      synopsis: row.synopsis || "",
      trailer_url: String(metadata.trailer_url || ""),
      film_path: String(metadata.film_path || ""),
      language: row.primary_language || "",
      price: Number(commercial.price || 0),
      rights: {
        territory: String(rights.territory || ""),
        duration: String(rights.duration || ""),
      },
      workflow_version: "b2b-final-v1",
      qc_note: metadata.qc_note ? String(metadata.qc_note) : undefined,
    },
  };
}

function mapDeal(row: CanonicalDealRow): Deal {
  return {
    id: row.id,
    title_id: row.title_id,
    buyer_id: row.buyer_id,
    status: row.stage,
    contract_status: row.contract_status,
    payment_status: row.payment_status,
    price: Number(row.offer_amount || 0),
    revenue_split: Number(row.creator_share_percent || 0),
    created_at: row.created_at,
  };
}

const titleSelect = "id,creator_id,title,synopsis,primary_language,status,commercial_profile,metadata,created_at,updated_at";

export async function createTitleDraft(ownerId: string, payload: FilmPayload) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("sv_app_titles").insert({
    creator_id: ownerId,
    title: payload.title,
    synopsis: payload.synopsis,
    primary_language: payload.language,
    status: "draft",
    commercial_profile: { price: payload.price, rights: payload.rights },
    metadata: { trailer_url: payload.trailer_url, film_path: payload.film_path, workflow_version: payload.workflow_version },
  }).select(titleSelect).single();
  throwIf(error); return mapTitle(data as CanonicalTitleRow);
}

export async function updateTitleFilmPath(id: string, filmPath: string) {
  assertSupabaseConfigured();
  const { data: row, error: readError } = await supabase.from("sv_app_titles").select("metadata").eq("id", id).single();
  throwIf(readError);
  const metadata = { ...((row?.metadata || {}) as Record<string, unknown>), film_path: filmPath };
  const { data, error } = await supabase.from("sv_app_titles").update({ metadata }).eq("id", id).select(titleSelect).single();
  throwIf(error); return mapTitle(data as CanonicalTitleRow);
}

export async function listCreatorTitles(ownerId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("sv_app_titles").select(titleSelect).eq("creator_id", ownerId).order("created_at", { ascending: false });
  throwIf(error); return ((data || []) as CanonicalTitleRow[]).map(mapTitle);
}

export async function setTitleStatus(id: string, status: TitleStatus, qcNote?: string) {
  assertSupabaseConfigured();
  const patch: Record<string, unknown> = { status: canonicalStatus(status) };
  if (qcNote !== undefined) {
    const { data: row, error: readError } = await supabase.from("sv_app_titles").select("metadata").eq("id", id).single();
    throwIf(readError);
    patch.metadata = { ...((row?.metadata || {}) as Record<string, unknown>), qc_note: qcNote };
  }
  const { error } = await supabase.from("sv_app_titles").update(patch).eq("id", id); throwIf(error);
}

export async function listTitlesByStatus(status: TitleStatus) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("sv_app_titles").select(titleSelect).eq("status", canonicalStatus(status)).order("created_at", { ascending: true });
  throwIf(error); return ((data || []) as CanonicalTitleRow[]).map(mapTitle);
}

export async function requestScreening(buyerId: string, titleId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("sv_screening_requests").insert({ buyer_id: buyerId, title_id: titleId, status: "requested" }).select("id,buyer_id,title_id,status,created_at").single();
  throwIf(error); return data as ScreeningRequest;
}

export async function listScreeningRequests() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("sv_screening_requests").select("id,buyer_id,title_id,status,created_at").order("created_at", { ascending: false });
  throwIf(error); return (data || []) as ScreeningRequest[];
}

export async function listMyScreenings(buyerId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("sv_screening_requests").select("id,buyer_id,title_id,status,created_at").eq("buyer_id", buyerId).order("created_at", { ascending: false });
  throwIf(error); return (data || []) as ScreeningRequest[];
}

export async function updateScreeningStatus(id: string, status: ScreeningRequest["status"]) {
  assertSupabaseConfigured();
  const { error } = await supabase.from("sv_screening_requests").update({ status }).eq("id", id); throwIf(error);
}

export async function requestLicense(buyerId: string, title: MarketplaceTitle) {
  assertSupabaseConfigured();
  const creatorShare = 70;
  const { data, error } = await supabase.from("sv_marketplace_deals").insert({
    buyer_id: buyerId,
    title_id: title.id,
    stage: "requested",
    contract_status: "pending",
    payment_status: "unpaid",
    offer_amount: Number(title.payload.price || 0),
    creator_share_percent: creatorShare,
    platform_share_percent: 100 - creatorShare,
    rights_scope: title.payload.rights || {},
  }).select("id,title_id,buyer_id,stage,contract_status,payment_status,offer_amount,creator_share_percent,created_at").single();
  throwIf(error); return mapDeal(data as CanonicalDealRow);
}

export async function listDeals() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("sv_marketplace_deals").select("id,title_id,buyer_id,stage,contract_status,payment_status,offer_amount,creator_share_percent,created_at").order("created_at", { ascending: false });
  throwIf(error); return ((data || []) as CanonicalDealRow[]).map(mapDeal);
}

export async function updateDeal(id: string, patch: Partial<Pick<Deal, "status" | "contract_status" | "payment_status" | "revenue_split">>) {
  assertSupabaseConfigured();
  const canonicalPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) canonicalPatch.stage = patch.status;
  if (patch.contract_status !== undefined) canonicalPatch.contract_status = patch.contract_status;
  if (patch.payment_status !== undefined) canonicalPatch.payment_status = patch.payment_status;
  if (patch.revenue_split !== undefined) {
    canonicalPatch.creator_share_percent = patch.revenue_split;
    canonicalPatch.platform_share_percent = 100 - patch.revenue_split;
  }
  const { error } = await supabase.from("sv_marketplace_deals").update(canonicalPatch).eq("id", id); throwIf(error);
}
