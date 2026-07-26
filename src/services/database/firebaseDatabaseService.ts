import { DatabaseService } from "./database.types";
import { Title, TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";
import { db } from "../firebase";
import { firebaseAuthService } from "../auth/firebaseAuthService";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from "firebase/firestore";
import { logger } from "../../utils/logger";

class FirebaseDatabaseService implements DatabaseService {
  private readonly TITLES_COL = "titles";
  private readonly DRAFTS_COL = "drafts";
  private readonly USERS_COL = "users";

  private async ensureAuth() {
    try {
      await firebaseAuthService.ensureAuthenticated();
    } catch (err) {
      logger.warn("Auto-authentication attempt in databaseService encountered fallback", err as Error);
    }
  }

  async getTitles(): Promise<Title[]> {
    await this.ensureAuth();
    try {
      const q = query(collection(db, this.TITLES_COL));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Title);
    } catch (err) {
      logger.error("Failed to fetch titles from Firestore", err as Error);
      return [];
    }
  }

  async getTitleById(id: string): Promise<Title | null> {
    await this.ensureAuth();
    try {
      const docRef = doc(db, this.TITLES_COL, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data() as Title;
    } catch (err) {
      logger.error(`Failed to fetch title ${id}`, err as Error);
      return null;
    }
  }

  async getTitlesByCreator(creatorId: string): Promise<Title[]> {
    await this.ensureAuth();
    try {
      const q = query(collection(db, this.TITLES_COL), where("creatorOwnerId", "==", creatorId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Title);
    } catch (err) {
      logger.error("Failed to fetch creator titles", err as Error);
      return [];
    }
  }

  async getTitlesByBuyer(buyerId: string): Promise<Title[]> {
    await this.ensureAuth();
    try {
      const q = query(collection(db, this.TITLES_COL), where("status", "==", "published"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Title);
    } catch (err) {
      logger.error("Failed to fetch buyer published titles", err as Error);
      return [];
    }
  }

  async getDraftsByCreator(creatorId: string): Promise<TitleDraft[]> {
    await this.ensureAuth();
    try {
      const q = query(collection(db, this.DRAFTS_COL), where("creatorOwnerId", "==", creatorId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as TitleDraft);
    } catch (err) {
      logger.error("Failed to fetch creator drafts", err as Error);
      return [];
    }
  }

  async saveDraft(draft: TitleDraft): Promise<TitleDraft> {
    await this.ensureAuth();
    const isNew = !draft.id || draft.id.startsWith("draft_");
    const id = isNew && !draft.id ? `draft-${Date.now()}` : draft.id;
    
    const finalDraft: TitleDraft = {
      ...draft,
      id,
      updatedAt: new Date().toISOString()
    };
    
    try {
      const docRef = doc(db, this.DRAFTS_COL, id);
      await setDoc(docRef, finalDraft, { merge: true });
      logger.trackEvent('draft_saved', { draftId: id });
    } catch (err) {
      logger.error("Failed to save draft to Firestore", err as Error);
    }

    return finalDraft;
  }

  async submitDraftForReview(draftId: string): Promise<void> {
    await this.ensureAuth();
    try {
      const draftRef = doc(db, this.DRAFTS_COL, draftId);
      const draftSnap = await getDoc(draftRef);
      
      let draftData: TitleDraft;

      if (!draftSnap.exists()) {
        draftData = {
          id: draftId,
          title: "New Submitted Title",
          synopsis: "Submitted for QC and Legal review.",
          creatorOwnerId: "creator_partner",
          genres: ["Drama"],
          status: "draft"
        };
      } else {
        draftData = draftSnap.data() as TitleDraft;
      }
      
      const newTitle: Title = {
        ...draftData,
        status: "draft", 
        qcStatus: "pending",
        legalStatus: "pending",
        approvalStatus: "pending",
        createdAt: draftData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Title;

      const titleRef = doc(db, this.TITLES_COL, draftId);
      await setDoc(titleRef, newTitle, { merge: true });
      logger.trackEvent('title_submitted_for_qc', { titleId: draftId });
    } catch (err) {
      logger.error("Failed to submit draft for review", err as Error);
    }
  }

  async updateQCStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    await this.ensureAuth();
    try {
      const titleRef = doc(db, this.TITLES_COL, titleId);
      await setDoc(titleRef, {
        qcStatus: status,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      logger.trackEvent('qc_status_updated', { titleId, status });
      
      const titleSnap = await getDoc(titleRef);
      if (titleSnap.exists()) {
        const title = titleSnap.data() as Title;
        await import('../notifications').then(({ notificationService }) => {
          notificationService.createNotification({
            userId: title.creatorOwnerId || "creator_partner",
            title: `QC Status: ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your title "${title.title || titleId}" has been ${status} by Quality Control.`,
            type: status === 'approved' ? 'success' : 'error'
          });
        });
      }
    } catch (err) {
      logger.error("Failed to update QC status", err as Error);
    }
  }

  async updateLegalStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    await this.ensureAuth();
    try {
      const titleRef = doc(db, this.TITLES_COL, titleId);
      const titleSnap = await getDoc(titleRef);
      
      const title = titleSnap.exists() ? (titleSnap.data() as Title) : { creatorOwnerId: "creator_partner", title: titleId, qcStatus: "approved" } as Partial<Title>;
      
      const updates: Partial<Title> = {
        legalStatus: status,
        updatedAt: new Date().toISOString()
      };
      
      if (title.qcStatus === "approved" && status === "approved") {
        updates.status = "published";
        updates.approvalStatus = "approved";
        logger.trackEvent('title_published', { titleId });
        
        await import('../notifications').then(({ notificationService }) => {
          notificationService.createNotification({
            userId: title.creatorOwnerId || "creator_partner",
            title: `Title Published!`,
            message: `"${title.title || titleId}" is now published and available to buyers.`,
            type: 'success'
          });
        });
      }
      
      await setDoc(titleRef, updates, { merge: true });
      logger.trackEvent('legal_status_updated', { titleId, status });
    } catch (err) {
      logger.error("Failed to update legal status", err as Error);
    }
  }

  async getUsers(): Promise<UserProfile[]> {
    await this.ensureAuth();
    try {
      const q = query(collection(db, this.USERS_COL));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (err) {
      logger.error("Failed to fetch users", err as Error);
      return [];
    }
  }
}

export const firebaseDatabaseService = new FirebaseDatabaseService();
