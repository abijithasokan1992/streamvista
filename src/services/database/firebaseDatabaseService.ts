import { DatabaseService } from "./database.types";
import { Title, TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";
import { db } from "../firebase";
import { firebaseAuthService } from "../auth/firebaseAuthService";
import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";
import { logger } from "../../utils/logger";

class FirebaseDatabaseService implements DatabaseService {
  private readonly TITLES_COL = "titles";
  private readonly DRAFTS_COL = "drafts";
  private readonly USERS_COL = "users";

  private async ensureAuth(): Promise<void> {
    await firebaseAuthService.ensureAuthenticated();
  }

  private fail(operation: string, err: unknown): never {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(operation, error);
    throw error;
  }

  async getTitles(): Promise<Title[]> {
    await this.ensureAuth();
    try {
      const snapshot = await getDocs(query(collection(db, this.TITLES_COL)));
      return snapshot.docs.map((item) => item.data() as Title);
    } catch (err) {
      return this.fail("Failed to fetch titles from Firestore", err);
    }
  }

  async getTitleById(id: string): Promise<Title | null> {
    await this.ensureAuth();
    try {
      const snapshot = await getDoc(doc(db, this.TITLES_COL, id));
      return snapshot.exists() ? (snapshot.data() as Title) : null;
    } catch (err) {
      return this.fail(`Failed to fetch title ${id}`, err);
    }
  }

  async getTitlesByCreator(creatorId: string): Promise<Title[]> {
    await this.ensureAuth();
    try {
      const snapshot = await getDocs(
        query(collection(db, this.TITLES_COL), where("creatorOwnerId", "==", creatorId))
      );
      return snapshot.docs.map((item) => item.data() as Title);
    } catch (err) {
      return this.fail("Failed to fetch creator titles", err);
    }
  }

  async getTitlesByBuyer(_buyerId: string): Promise<Title[]> {
    await this.ensureAuth();
    try {
      const snapshot = await getDocs(
        query(collection(db, this.TITLES_COL), where("status", "==", "published"))
      );
      return snapshot.docs.map((item) => item.data() as Title);
    } catch (err) {
      return this.fail("Failed to fetch buyer published titles", err);
    }
  }

  async getDraftsByCreator(creatorId: string): Promise<TitleDraft[]> {
    await this.ensureAuth();
    try {
      const snapshot = await getDocs(
        query(collection(db, this.DRAFTS_COL), where("creatorOwnerId", "==", creatorId))
      );
      return snapshot.docs.map((item) => item.data() as TitleDraft);
    } catch (err) {
      return this.fail("Failed to fetch creator drafts", err);
    }
  }

  async saveDraft(draft: TitleDraft): Promise<TitleDraft> {
    await this.ensureAuth();
    const id = draft.id || `draft-${Date.now()}`;
    const finalDraft: TitleDraft = {
      ...draft,
      id,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, this.DRAFTS_COL, id), finalDraft, { merge: true });
      logger.trackEvent("draft_saved", { draftId: id });
      return finalDraft;
    } catch (err) {
      return this.fail("Failed to save draft to Firestore", err);
    }
  }

  async submitDraftForReview(draftId: string): Promise<void> {
    await this.ensureAuth();
    try {
      const draftSnap = await getDoc(doc(db, this.DRAFTS_COL, draftId));
      if (!draftSnap.exists()) {
        throw new Error(`Draft ${draftId} does not exist; refusing to fabricate a submission.`);
      }

      const draftData = draftSnap.data() as TitleDraft;
      const newTitle: Title = {
        ...draftData,
        status: "draft",
        qcStatus: "pending",
        legalStatus: "pending",
        approvalStatus: "pending",
        createdAt: draftData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Title;

      await setDoc(doc(db, this.TITLES_COL, draftId), newTitle, { merge: true });
      logger.trackEvent("title_submitted_for_qc", { titleId: draftId });
    } catch (err) {
      this.fail("Failed to submit draft for review", err);
    }
  }

  async updateQCStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    await this.ensureAuth();
    try {
      const titleRef = doc(db, this.TITLES_COL, titleId);
      const titleSnap = await getDoc(titleRef);
      if (!titleSnap.exists()) {
        throw new Error(`Title ${titleId} does not exist; refusing to create a phantom QC record.`);
      }

      const title = titleSnap.data() as Title;
      await setDoc(
        titleRef,
        { qcStatus: status, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      logger.trackEvent("qc_status_updated", { titleId, status });

      const { notificationService } = await import("../notifications");
      notificationService.createNotification({
        userId: title.creatorOwnerId,
        title: `QC Status: ${status === "approved" ? "Approved" : "Rejected"}`,
        message: `Your title "${title.title || titleId}" has been ${status} by Quality Control.`,
        type: status === "approved" ? "success" : "error",
      });
    } catch (err) {
      this.fail("Failed to update QC status", err);
    }
  }

  async updateLegalStatus(titleId: string, status: "approved" | "rejected"): Promise<void> {
    await this.ensureAuth();
    try {
      const titleRef = doc(db, this.TITLES_COL, titleId);
      const titleSnap = await getDoc(titleRef);
      if (!titleSnap.exists()) {
        throw new Error(`Title ${titleId} does not exist; refusing to create a phantom legal record.`);
      }

      const title = titleSnap.data() as Title;
      const updates: Partial<Title> = {
        legalStatus: status,
        updatedAt: new Date().toISOString(),
      };

      if (title.qcStatus === "approved" && status === "approved") {
        updates.status = "published";
        updates.approvalStatus = "approved";
      }

      await setDoc(titleRef, updates, { merge: true });
      logger.trackEvent("legal_status_updated", { titleId, status });

      if (updates.status === "published") {
        logger.trackEvent("title_published", { titleId });
        const { notificationService } = await import("../notifications");
        notificationService.createNotification({
          userId: title.creatorOwnerId,
          title: "Title Published!",
          message: `"${title.title || titleId}" is now published and available to buyers.`,
          type: "success",
        });
      }
    } catch (err) {
      this.fail("Failed to update legal status", err);
    }
  }

  async getUsers(): Promise<UserProfile[]> {
    await this.ensureAuth();
    try {
      const snapshot = await getDocs(query(collection(db, this.USERS_COL)));
      return snapshot.docs.map((item) => item.data() as UserProfile);
    } catch (err) {
      return this.fail("Failed to fetch users", err);
    }
  }
}

export const firebaseDatabaseService = new FirebaseDatabaseService();
