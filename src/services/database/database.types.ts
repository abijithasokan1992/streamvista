import { Title, TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";

export interface DatabaseService {
  // Titles
  getTitles(): Promise<Title[]>;
  getTitleById(id: string): Promise<Title | null>;
  getTitlesByCreator(creatorId: string): Promise<Title[]>;
  getTitlesByBuyer(buyerId: string): Promise<Title[]>; // Based on assignments
  
  // Drafts
  getDraftsByCreator(creatorId: string): Promise<TitleDraft[]>;
  saveDraft(draft: TitleDraft): Promise<TitleDraft>;
  submitDraftForReview(draftId: string): Promise<void>;
  updateQCStatus(titleId: string, status: "approved" | "rejected"): Promise<void>;
  updateLegalStatus(titleId: string, status: "approved" | "rejected"): Promise<void>;
  
  // Users (for admin)
  getUsers(): Promise<UserProfile[]>;
}
