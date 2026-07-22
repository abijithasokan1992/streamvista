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
  
  // Users (for admin)
  getUsers(): Promise<UserProfile[]>;
}
