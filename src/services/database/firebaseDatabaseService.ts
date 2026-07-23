import { DatabaseService } from "./database.types";
import { Title, TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";
import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from "firebase/firestore";
import { logger } from "../../utils/logger";

class FirebaseDatabaseService implements DatabaseService {
  private readonly TITLES_COL = "titles";
  private readonly DRAFTS_COL = "drafts";
  private readonly USERS_COL = "users";

  async getTitles(): Promise<Title[]> {
    const q = query(collection(db, this.TITLES_COL));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Title);
  }

  async getTitleById(id: string): Promise<Title | null> {
    const docRef = doc(db, this.TITLES_COL, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as Title;
  }

  async getTitlesByCreator(creatorId: string): Promise<Title[]> {
    const q = query(collection(db, this.TITLES_COL), where("creatorOwnerId", "==", creatorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Title);
  }

  async getTitlesByBuyer(buyerId: string): Promise<Title[]> {
    // Buyers should only see published titles they have access to or can buy
    // For now, mirroring mock behavior: returning published titles
    const q = query(collection(db, this.TITLES_COL), where("status", "==", "published"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Title);
  }

  async getDraftsByCreator(creatorId: string): Promise<TitleDraft[]> {
    const q = query(collection(db, this.DRAFTS_COL), where("creatorOwnerId", "==", creatorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as TitleDraft);
  }

  async saveDraft(draft: TitleDraft): Promise<TitleDraft> {
    const isNew = !draft.id || draft.id.startsWith("draft_");
    const id = isNew && !draft.id ? `draft-${Date.now()}` : draft.id;
    
    const finalDraft: TitleDraft = {
      ...draft,
      id,
      updatedAt: new Date().toISOString()
    };
    
    const docRef = doc(db, this.DRAFTS_COL, id);
    await setDoc(docRef, finalDraft, { merge: true });
    
    logger.trackEvent('draft_saved', { draftId: id });
    return finalDraft;
  }

  async submitDraftForReview(draftId: string): Promise<void> {
    const draftRef = doc(db, this.DRAFTS_COL, draftId);
    const draftSnap = await getDoc(draftRef);
    
    if (!draftSnap.exists()) {
      throw new Error("Draft not found");
    }
    
    const draft = draftSnap.data() as TitleDraft;
    
    const newTitle: Title = {
      ...draft,
      status: "draft", 
      qcStatus: "pending",
      legalStatus: "pending",
      approvalStatus: "pending",
      createdAt: draft.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Title;

    // Save to titles collection
    const titleRef = doc(db, this.TITLES_COL, draftId);
    await setDoc(titleRef, newTitle);
    
    // In production, we'd delete the draft after submission, or mark it submitted
    // await deleteDoc(draftRef);
    
    logger.trackEvent('title_submitted_for_qc', { titleId: draftId });
  }

  async updateQCStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    const titleRef = doc(db, this.TITLES_COL, titleId);
    await updateDoc(titleRef, {
      qcStatus: status,
      updatedAt: new Date().toISOString()
    });
    logger.trackEvent('qc_status_updated', { titleId, status });
  }

  async updateLegalStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    const titleRef = doc(db, this.TITLES_COL, titleId);
    const titleSnap = await getDoc(titleRef);
    if (!titleSnap.exists()) throw new Error("Title not found");
    
    const title = titleSnap.data() as Title;
    const updates: Partial<Title> = {
      legalStatus: status,
      updatedAt: new Date().toISOString()
    };
    
    if (title.qcStatus === "approved" && status === "approved") {
      updates.status = "published";
      updates.approvalStatus = "approved";
      logger.trackEvent('title_published', { titleId });
    }
    
    await updateDoc(titleRef, updates);
    logger.trackEvent('legal_status_updated', { titleId, status });
  }

  async getUsers(): Promise<UserProfile[]> {
    const q = query(collection(db, this.USERS_COL));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  }
}

export const firebaseDatabaseService = new FirebaseDatabaseService();
