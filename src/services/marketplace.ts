import { supabase } from "./supabase";

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
export type ScreeningRequest = { id: string; buyer_id: string; title_id: string; status: "requested" | "approved" | "declined" | "watched" | "expired" | "revoked"; created_at: string; title?: { payload?: FilmPayload } | null };

type CanonicalTitleStatus = "draft" | "submitted" | "payment_pending" | "payment_received" | "qc_pending" | "legal_pending" | "ready_for_distribution" | "archived";
type CanonicalDealStage = "requested" | "negotiation" | "terms_agreed" | "agreement_pending" | "payment_pending" | "active" | "delivery_ready" | "delivered" | "closed" | "cancelled";
type CanonicalScreeningStatus = "requested" | "approved" | "viewed" | "expired" | "revoked" | "declined";
type JsonObject = Record<string, unknown>;

type CanonicalTitleRow = {
  id: string; creator_id: string; title: string; synopsis: string | null; primary_language: string | null;
  status: CanonicalTitleStatus; commercial_profile: unknown; metadata: unknown; created_at?: string; updated_at?: string;
};
type CanonicalDealRow = {
  id: string; title_id: string; buyer_id: string; stage: CanonicalDealStage; offer_amount: number | string | null;
  contract_status: string | null; payment_status: string | null; creator_share_percent: number | string | null;
  platform_share_percent: number | string | null; rights_scope: unknown; created_at?: string;
};
type CanonicalScreeningRow = { id: string; buyer_id: string; title_id: string; status: CanonicalScreeningStatus; created_at?: string; title?: CanonicalTitleRow | CanonicalTitleRow[] | null };

const TITLE_SELECT = "id,creator_id,title,synopsis,primary_language,status,commercial_profile,metadata,created_at,updated_at";
const DEAL_SELECT = "id,title_id,buyer_id,stage,offer_amount,contract_status,payment_status,creator_share_percent,platform_share_percent,rights_scope,created_at";
const SCREENING_SELECT = "id,buyer_id,title_id,status,created_at";
const SCREENING_WITH_TITLE_SELECT = `id,buyer_id,title_id,status,created_at,title:sv_app_titles(${TITLE_SELECT})`;

function throwIf(error: { message: string } | null) { if (error) throw new Error(error.message); }
function asObject(value: unknown): JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}; }
function numberOrZero(value: unknown): number { const number = Number(value ?? 0); return Number.isFinite(number) ? number : 0; }

function toCanonicalTitleStatus(status: TitleStatus): CanonicalTitleStatus {
  switch (status) {
    case "draft": return "draft";
    case "submitted": return "qc_pending";
    case "qc": return "legal_pending";
    case "approved":
    case "licensed": return "ready_for_distribution";
    case "archived": return "archived";
  }
}
function toUITitleStatus(status: CanonicalTitleStatus): TitleStatus {
  switch (status) {
    case "draft": return "draft";
    case "submitted":
    case "payment_pending":
    case "payment_received":
    case "qc_pending": return "submitted";
    case "legal_pending": return "qc";
    case "ready_for_distribution": return "approved";
    case "archived": return "archived";
  }
}
function toCanonicalDealStage(status: string): CanonicalDealStage {
  if (status === "contract_ready") return "agreement_pending";
  const allowed: CanonicalDealStage[] = ["requested", "negotiation", "terms_agreed", "agreement_pending", "payment_pending", "active", "delivery_ready", "delivered", "closed", "cancelled"];
  return allowed.includes(status as CanonicalDealStage) ? status as CanonicalDealStage : "requested";
}
function toUIDealStatus(stage: CanonicalDealStage): string { return stage === "agreement_pending" ? "contract_ready" : stage; }
function mapScreening(status: ScreeningRequest["status"]): CanonicalScreeningStatus { return status === "watched" ? "viewed" : status; }
function toUIScreeningStatus(status: CanonicalScreeningStatus): ScreeningRequest["status"] { return status === "viewed" ? "watched" : status; }

function toCanonicalTitle(ui: Pick<MarketplaceTitle, "creator_owner_id" | "payload" | "status">) {
  return {
    creator_id: ui.creator_owner_id,
    title: ui.payload.title,
    synopsis: ui.payload.synopsis,
    primary_language: ui.payload.language,
    status: toCanonicalTitleStatus(ui.status),
    commercial_profile: { price: numberOrZero(ui.payload.price), rights: ui.payload.rights },
    metadata: { trailer_url: ui.payload.trailer_url, film_path: ui.payload.film_path, workflow_version: ui.payload.workflow_version, ...(ui.payload.qc_note ? { qc_note: ui.payload.qc_note } : {}) },
  };
}
function toCanonicalDeal(ui: Pick<Deal, "status" | "price" | "revenue_split">) {
  const creatorShare = numberOrZero(ui.revenue_split);
  return { stage: toCanonicalDealStage(ui.status), offer_amount: numberOrZero(ui.price), creator_share_percent: creatorShare, platform_share_percent: 100 - creatorShare };
}
function titleToUI(row: CanonicalTitleRow): MarketplaceTitle {
  const commercialProfile = asObject(row.commercial_profile); const metadata = asObject(row.metadata); const rights = asObject(commercialProfile.rights);
  const qcNote = typeof metadata.qc_note === "string" ? metadata.qc_note : undefined;
  return { id: row.id, creator_owner_id: row.creator_id, payload: { title: row.title ?? "", synopsis: row.synopsis ?? "", trailer_url: typeof metadata.trailer_url === "string" ? metadata.trailer_url : "", film_path: typeof metadata.film_path === "string" ? metadata.film_path : "", language: row.primary_language ?? "", price: numberOrZero(commercialProfile.price), rights: { territory: typeof rights.territory === "string" ? rights.territory : "", duration: typeof rights.duration === "string" ? rights.duration : "" }, workflow_version: "b2b-final-v1", ...(qcNote ? { qc_note: qcNote } : {}) }, status: toUITitleStatus(row.status), created_at: row.created_at ?? "", updated_at: row.updated_at ?? row.created_at ?? "" };
}
function dealToUI(row: CanonicalDealRow): Deal {
  return { id: row.id, title_id: row.title_id, buyer_id: row.buyer_id, status: toUIDealStatus(row.stage), contract_status: row.contract_status ?? "pending", payment_status: row.payment_status ?? "unpaid", price: numberOrZero(row.offer_amount), revenue_split: numberOrZero(row.creator_share_percent), created_at: row.created_at ?? "" };
}
function screeningToUI(row: CanonicalScreeningRow): ScreeningRequest {
  const nestedTitle = Array.isArray(row.title) ? row.title[0] : row.title;
  return { id: row.id, buyer_id: row.buyer_id, title_id: row.title_id, status: toUIScreeningStatus(row.status), created_at: row.created_at ?? "", title: nestedTitle ? { payload: titleToUI(nestedTitle).payload } : undefined };
}

export async function createTitleDraft(ownerId: string, payload: FilmPayload) {
  const ui: MarketplaceTitle = { id: "", creator_owner_id: ownerId, payload, status: "draft", created_at: "", updated_at: "" };
  const { data, error } = await supabase.from("sv_app_titles").insert(toCanonicalTitle(ui)).select(TITLE_SELECT).single();
  throwIf(error); return titleToUI(data as CanonicalTitleRow);
}
export async function updateTitleFilmPath(id: string, filmPath: string) {
  const { data: row, error: readError } = await supabase.from("sv_app_titles").select("metadata").eq("id", id).single();
  throwIf(readError); const metadata = { ...asObject(row?.metadata), film_path: filmPath };
  const { data, error } = await supabase.from("sv_app_titles").update({ metadata }).eq("id", id).select(TITLE_SELECT).single();
  throwIf(error); return titleToUI(data as CanonicalTitleRow);
}
export async function listCreatorTitles(ownerId: string) {
  const { data, error } = await supabase.from("sv_app_titles").select(TITLE_SELECT).eq("creator_id", ownerId).order("created_at", { ascending: false });
  throwIf(error); return (data || []).map((row: CanonicalTitleRow) => titleToUI(row));
}
export async function setTitleStatus(id: string, status: TitleStatus, qcNote?: string) {
  const canonicalStatus = toCanonicalTitleStatus(status);
  if (qcNote !== undefined) {
    const { data: row, error: readError } = await supabase.from("sv_app_titles").select("metadata").eq("id", id).single();
    throwIf(readError); const metadata = { ...asObject(row?.metadata), qc_note: qcNote };
    const { error } = await supabase.from("sv_app_titles").update({ status: canonicalStatus, metadata }).eq("id", id); throwIf(error); return;
  }
  const { error } = await supabase.from("sv_app_titles").update({ status: canonicalStatus }).eq("id", id); throwIf(error);
}
export async function listTitlesByStatus(status: TitleStatus) {
  const { data, error } = await supabase.from("sv_app_titles").select(TITLE_SELECT).eq("status", toCanonicalTitleStatus(status)).order("created_at", { ascending: true });
  throwIf(error); return (data || []).map((row: CanonicalTitleRow) => titleToUI(row));
}
export async function requestScreening(buyerId: string, titleId: string) {
  const { data, error } = await supabase.from("sv_screening_requests").insert({ buyer_id: buyerId, title_id: titleId, status: mapScreening("requested") }).select(SCREENING_SELECT).single();
  throwIf(error); return screeningToUI(data as CanonicalScreeningRow);
}
export async function listScreeningRequests() {
  const { data, error } = await supabase.from("sv_screening_requests").select(SCREENING_WITH_TITLE_SELECT).order("created_at", { ascending: false });
  throwIf(error); return (data || []).map((row: CanonicalScreeningRow) => screeningToUI(row));
}
export async function listMyScreenings(buyerId: string) {
  const { data, error } = await supabase.from("sv_screening_requests").select(SCREENING_SELECT).eq("buyer_id", buyerId).order("created_at", { ascending: false });
  throwIf(error); return (data || []).map((row: CanonicalScreeningRow) => screeningToUI(row));
}
export async function updateScreeningStatus(id: string, status: ScreeningRequest["status"]) {
  const { error } = await supabase.from("sv_screening_requests").update({ status: mapScreening(status) }).eq("id", id); throwIf(error);
}
export async function requestLicense(buyerId: string, title: MarketplaceTitle) {
  const uiDeal: Deal = { id: "", title_id: title.id, buyer_id: buyerId, status: "requested", contract_status: "pending", payment_status: "unpaid", price: numberOrZero(title.payload.price), revenue_split: 70, created_at: "" };
  const { data, error } = await supabase.from("sv_marketplace_deals").insert({ buyer_id: buyerId, title_id: title.id, ...toCanonicalDeal(uiDeal), contract_status: uiDeal.contract_status, payment_status: uiDeal.payment_status, rights_scope: title.payload.rights }).select(DEAL_SELECT).single();
  throwIf(error); return dealToUI(data as CanonicalDealRow);
}
export async function listDeals() {
  const { data, error } = await supabase.from("sv_marketplace_deals").select(DEAL_SELECT).order("created_at", { ascending: false });
  throwIf(error); return (data || []).map((row: CanonicalDealRow) => dealToUI(row));
}
export async function updateDeal(id: string, patch: Partial<Pick<Deal, "status" | "contract_status" | "payment_status" | "revenue_split">>) {
  const canonicalPatch: Record<string, string | number> = {};
  if (patch.status !== undefined) canonicalPatch.stage = toCanonicalDealStage(patch.status);
  if (patch.contract_status !== undefined) canonicalPatch.contract_status = patch.contract_status;
  if (patch.payment_status !== undefined) canonicalPatch.payment_status = patch.payment_status;
  if (patch.revenue_split !== undefined) { const creatorShare = numberOrZero(patch.revenue_split); canonicalPatch.creator_share_percent = creatorShare; canonicalPatch.platform_share_percent = 100 - creatorShare; }
  const { error } = await supabase.from("sv_marketplace_deals").update(canonicalPatch).eq("id", id); throwIf(error);
}
