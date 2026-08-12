import { supabase } from "./supabase";

export type TitleStatus = "draft" | "submitted" | "qc" | "approved" | "licensed" | "archived";
export type FilmPayload = {
  title: string; synopsis: string; trailer_url: string; film_path: string; language: string;
  price: number; rights: { territory: string; duration: string }; workflow_version: "b2b-final-v1";
  qc_note?: string;
};
export type MarketplaceTitle = { id: string; creator_owner_id: string; payload: FilmPayload; status: TitleStatus; created_at: string; updated_at: string };
export type Deal = { id: string; title_id: string; buyer_id: string; status: string; contract_status: string; payment_status: string; price: number; revenue_split: number; created_at: string };

function throwIf(error: { message: string } | null) { if (error) throw new Error(error.message); }

export async function createTitleDraft(ownerId: string, payload: FilmPayload) {
  const { data, error } = await supabase.from("sv_app_titles").insert({ creator_owner_id: ownerId, payload, status: "draft" }).select("id,creator_owner_id,payload,status,created_at,updated_at").single();
  throwIf(error); return data as MarketplaceTitle;
}
export async function listCreatorTitles(ownerId: string) {
  const { data, error } = await supabase.from("sv_app_titles").select("id,creator_owner_id,payload,status,created_at,updated_at").eq("creator_owner_id", ownerId).order("created_at", { ascending: false });
  throwIf(error); return (data || []) as MarketplaceTitle[];
}
export async function setTitleStatus(id: string, status: TitleStatus, qcNote?: string) {
  if (qcNote !== undefined) {
    const { data: row, error: readError } = await supabase.from("sv_app_titles").select("payload").eq("id", id).single();
    throwIf(readError);
    const payload = { ...(row?.payload || {}), qc_note: qcNote };
    const { error } = await supabase.from("sv_app_titles").update({ status, payload }).eq("id", id); throwIf(error); return;
  }
  const { error } = await supabase.from("sv_app_titles").update({ status }).eq("id", id); throwIf(error);
}
export async function listTitlesByStatus(status: TitleStatus) {
  const { data, error } = await supabase.from("sv_app_titles").select("id,creator_owner_id,payload,status,created_at,updated_at").eq("status", status).order("created_at", { ascending: true });
  throwIf(error); return (data || []) as MarketplaceTitle[];
}
export async function requestScreening(buyerId: string, titleId: string) {
  const { error } = await supabase.from("sv_screening_requests").insert({ buyer_id: buyerId, title_id: titleId, status: "requested" }); throwIf(error);
}
export async function requestLicense(buyerId: string, title: MarketplaceTitle) {
  const { data, error } = await supabase.from("sv_marketplace_deals").insert({ buyer_id: buyerId, title_id: title.id, status: "requested", contract_status: "pending", payment_status: "unpaid", price: Number(title.payload.price || 0), revenue_split: 70 }).select("*").single();
  throwIf(error); return data as Deal;
}
export async function listDeals() {
  const { data, error } = await supabase.from("sv_marketplace_deals").select("*").order("created_at", { ascending: false }); throwIf(error); return (data || []) as Deal[];
}
export async function updateDeal(id: string, patch: Partial<Pick<Deal, "status" | "contract_status" | "payment_status" | "revenue_split">>) {
  const { error } = await supabase.from("sv_marketplace_deals").update(patch).eq("id", id); throwIf(error);
}
