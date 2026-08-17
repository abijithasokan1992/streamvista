import { DatabaseService } from "./database.types";
import { Title, TitleDraft } from "../../types/title";
import { UserProfile, UserRole } from "../../types/auth";
import { assertSupabaseConfigured, supabase } from "../supabase";

type TitleRow = {
  id: string;
  creator_id: string;
  title: string;
  synopsis: string | null;
  content_type: string | null;
  primary_language: string | null;
  director: string | null;
  status: string;
  commercial_profile: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  email: string;
  display_name: string;
  app_role: string;
  created_at: string;
  updated_at: string;
};

function normalizeRole(role: string): UserRole {
  switch (role) {
    case "founder": return "founder";
    case "super_admin": return "super_admin";
    case "admin": return "admin";
    case "buyer": return "buyer";
    case "finance": return "finance";
    case "qc": return "qc_staff";
    case "legal": return "legal_staff";
    case "operations": return "support_staff";
    default: return "creator_partner";
  }
}

const mapTitle = (row: TitleRow): Title => {
  const commercial = row.commercial_profile || {};
  const metadata = row.metadata || {};
  const rights = (commercial.rights && typeof commercial.rights === "object" ? commercial.rights : {}) as Record<string, unknown>;
  return {
    id: row.id,
    title: row.title,
    synopsis: row.synopsis || "",
    contentType: (row.content_type || "movie") as Title["contentType"],
    genres: Array.isArray(metadata.genres) ? metadata.genres.map(String) : [],
    director: row.director || "",
    producer: String(metadata.producer || ""),
    cast: Array.isArray(metadata.cast) ? metadata.cast.map(String) : [],
    runtimeMinutes: Number(metadata.runtime_minutes || 0),
    originalLanguage: row.primary_language || "",
    additionalLanguages: Array.isArray(metadata.additional_languages) ? metadata.additional_languages.map(String) : [],
    country: String(metadata.country || "India"),
    releaseDate: String(metadata.release_date || ""),
    posterUrl: metadata.poster_url ? String(metadata.poster_url) : undefined,
    thumbnailUrl: metadata.thumbnail_url ? String(metadata.thumbnail_url) : undefined,
    galleryUrls: Array.isArray(metadata.gallery_urls) ? metadata.gallery_urls.map(String) : [],
    trailerUrl: metadata.trailer_url ? String(metadata.trailer_url) : undefined,
    screenerUrl: metadata.film_path ? String(metadata.film_path) : undefined,
    masterVideoUrl: metadata.film_path ? String(metadata.film_path) : undefined,
    subtitleFiles: Array.isArray(metadata.subtitle_files) ? metadata.subtitle_files.map(String) : [],
    captionFiles: Array.isArray(metadata.caption_files) ? metadata.caption_files.map(String) : [],
    ageRating: String(metadata.age_rating || ""),
    budget: metadata.budget ? String(metadata.budget) : undefined,
    rightsAvailable: Object.keys(rights),
    territories: rights.territory ? [String(rights.territory)] : [],
    excludedTerritories: [],
    licensingModel: "non-exclusive",
    rightsStartDate: undefined,
    rightsEndDate: undefined,
    creatorOwnerId: row.creator_id,
    status: row.status === "ready_for_distribution" ? "published" : row.status === "archived" ? "archived" : "draft",
    qcStatus: row.status === "qc" || row.status === "ready_for_distribution" ? "approved" : "pending",
    legalStatus: row.status === "ready_for_distribution" ? "approved" : "pending",
    approvalStatus: row.status === "ready_for_distribution" ? "approved" : "pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const titleSelect = "id,creator_id,title,synopsis,content_type,primary_language,director,status,commercial_profile,metadata,created_at,updated_at";

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Authentication required.");
  return data.session.access_token;
}

async function getServerTitles() {
  assertSupabaseConfigured();
  const token = await getAccessToken();
  const response = await fetch("/api/titles", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Titles request failed (${response.status}).`);
  return ((payload.titles || []) as TitleRow[]).map(mapTitle);
}

class ApiDatabaseService implements DatabaseService {
  async getTitles(): Promise<Title[]> {
    return getServerTitles();
  }

  async getTitleById(id: string): Promise<Title | null> {
    const titles = await getServerTitles();
    return titles.find((title) => title.id === id) || null;
  }

  async getTitlesByCreator(creatorId?: string): Promise<Title[]> {
    assertSupabaseConfigured();
    let query = supabase.from("sv_app_titles").select(titleSelect);
    if (creatorId) query = query.eq("creator_id", creatorId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return ((data || []) as TitleRow[]).map(mapTitle);
  }

  async getTitlesByBuyer(): Promise<Title[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from("sv_app_titles").select(titleSelect).eq("status", "ready_for_distribution");
    if (error) throw new Error(error.message);
    return ((data || []) as TitleRow[]).map(mapTitle);
  }

  async getDraftsByCreator(creatorId: string): Promise<TitleDraft[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from("sv_app_titles").select(titleSelect).eq("creator_id", creatorId).eq("status", "draft");
    if (error) throw new Error(error.message);
    return ((data || []) as TitleRow[]).map((row) => ({ ...mapTitle(row), status: "draft" })) as TitleDraft[];
  }

  async saveDraft(draft: TitleDraft): Promise<TitleDraft> {
    assertSupabaseConfigured();
    const row = {
      id: draft.id,
      creator_id: draft.creatorOwnerId,
      title: draft.title || "Untitled",
      synopsis: draft.synopsis || "",
      content_type: draft.contentType || "movie",
      primary_language: draft.originalLanguage || "",
      director: draft.director || "",
      status: "draft",
      commercial_profile: { rights: { territory: draft.territories?.[0] || "" } },
      metadata: {
        producer: draft.producer || "",
        cast: draft.cast || [],
        runtime_minutes: draft.runtimeMinutes || 0,
        trailer_url: draft.trailerUrl || "",
        film_path: draft.masterVideoUrl || draft.screenerUrl || "",
      },
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("sv_app_titles").upsert(row).select(titleSelect).single();
    if (error) throw new Error(error.message);
    return { ...mapTitle(data as TitleRow), status: "draft" } as TitleDraft;
  }

  async getUsers(): Promise<UserProfile[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabase.rpc("sv_admin_profiles");
    if (error) throw new Error(error.message);
    return ((data || []) as ProfileRow[]).map((profile) => ({
      uid: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      role: normalizeRole(profile.app_role),
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }));
  }
}

export const apiDatabaseService = new ApiDatabaseService();
