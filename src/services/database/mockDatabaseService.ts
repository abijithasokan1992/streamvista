import { DatabaseService } from "./database.types";
import { Title, TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";
import { logger } from "../../utils/logger";

// Make the mock state mutable and global across the app lifecycle
let MOCK_TITLES: Title[] = [
  {
    id: "title-1",
    title: "Jananam 1947 Pranayam Thudarunnu",
    synopsis: "A heartwarming story about love and life, spanning generations starting from 1947.",
    contentType: "movie",
    genres: ["Drama", "Romance"],
    director: "Abijith Asokan",
    producer: "Demo Productions",
    cast: ["Actor A", "Actor B"],
    runtimeMinutes: 124,
    originalLanguage: "Malayalam",
    additionalLanguages: ["English"],
    country: "India",
    releaseDate: "2024-03-15",
    posterUrl: "",
    galleryUrls: [],
    subtitleFiles: [],
    captionFiles: [],
    ageRating: "U",
    rightsAvailable: ["Theatrical", "VOD", "Broadcast"],
    territories: ["Global"],
    excludedTerritories: [],
    licensingModel: "exclusive",
    creatorOwnerId: "mock-creator-1",
    status: "published",
    qcStatus: "approved",
    legalStatus: "approved",
    approvalStatus: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let MOCK_DRAFTS: TitleDraft[] = [];

class MockDatabaseService implements DatabaseService {
  async getTitles(): Promise<Title[]> {
    await new Promise(r => setTimeout(r, 600));
    return [...MOCK_TITLES];
  }
  
  async getTitleById(id: string): Promise<Title | null> {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_TITLES.find(t => t.id === id) || null;
  }

  async getTitlesByCreator(creatorId: string): Promise<Title[]> {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_TITLES.filter(t => t.creatorOwnerId === creatorId);
  }

  async getTitlesByBuyer(buyerId: string): Promise<Title[]> {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_TITLES.slice(0, 2); 
  }

  async getDraftsByCreator(creatorId: string): Promise<TitleDraft[]> {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_DRAFTS.filter(d => d.creatorOwnerId === creatorId);
  }

  async saveDraft(draft: TitleDraft): Promise<TitleDraft> {
    await new Promise(r => setTimeout(r, 700));
    const isNew = !draft.id || draft.id.startsWith("draft_");
    const finalDraft = {
      ...draft,
      id: isNew && !draft.id ? `draft-${Date.now()}` : draft.id,
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = MOCK_DRAFTS.findIndex(d => d.id === finalDraft.id);
    if (existingIndex >= 0) {
      MOCK_DRAFTS[existingIndex] = finalDraft;
    } else {
      MOCK_DRAFTS.push(finalDraft);
    }
    
    logger.trackEvent('draft_saved', { draftId: finalDraft.id });
    return finalDraft;
  }

  // --- NEW WORKFLOW METHODS ---
  
  async submitDraftForReview(draftId: string): Promise<void> {
    await new Promise(r => setTimeout(r, 800));
    const draftIndex = MOCK_DRAFTS.findIndex(d => d.id === draftId);
    if (draftIndex === -1) throw new Error("Draft not found");
    
    const draft = MOCK_DRAFTS[draftIndex];
    MOCK_DRAFTS.splice(draftIndex, 1); // Remove from drafts

    const newTitle: Title = {
      ...draft,
      status: "draft", 
      qcStatus: "pending", // Enters QC Queue
      legalStatus: "pending",
      approvalStatus: "pending",
      createdAt: draft.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Title;

    MOCK_TITLES.push(newTitle);
    logger.trackEvent('title_submitted_for_qc', { titleId: newTitle.id });
  }

  async updateQCStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
    const title = MOCK_TITLES.find(t => t.id === titleId);
    if (!title) throw new Error("Title not found");
    
    title.qcStatus = status;
    title.updatedAt = new Date().toISOString();
    logger.trackEvent('qc_status_updated', { titleId, status });
  }

  async updateLegalStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
    const title = MOCK_TITLES.find(t => t.id === titleId);
    if (!title) throw new Error("Title not found");
    
    title.legalStatus = status;
    
    // If both QC and Legal are approved, Auto-Publish!
    if (title.qcStatus === "approved" && title.legalStatus === "approved") {
      title.status = "published";
      title.approvalStatus = "approved";
      logger.trackEvent('title_published', { titleId });
    }
    
    title.updatedAt = new Date().toISOString();
    logger.trackEvent('legal_status_updated', { titleId, status });
  }

  async getUsers(): Promise<UserProfile[]> {
    await new Promise(r => setTimeout(r, 600));
    return [];
  }
}

export const mockDatabaseService = new MockDatabaseService();
