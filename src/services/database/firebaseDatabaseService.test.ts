import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureAuthenticated = vi.hoisted(() => vi.fn());
const getDoc = vi.hoisted(() => vi.fn());
const getDocs = vi.hoisted(() => vi.fn());
const setDoc = vi.hoisted(() => vi.fn());

vi.mock("../firebase", () => ({ db: {} }));

vi.mock("../auth/firebaseAuthService", () => ({
  firebaseAuthService: { ensureAuthenticated },
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc,
  getDocs,
  setDoc,
  query: vi.fn((value) => value),
  where: vi.fn(() => ({})),
}));

vi.mock("../../utils/logger", () => ({
  logger: {
    error: vi.fn(),
    trackEvent: vi.fn(),
  },
}));

import { firebaseDatabaseService } from "./firebaseDatabaseService";

describe("production-safe Firestore persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureAuthenticated.mockResolvedValue({ uid: "user-1" });
  });

  it("surfaces authentication failures before database access", async () => {
    ensureAuthenticated.mockRejectedValueOnce(new Error("Authentication required"));

    await expect(firebaseDatabaseService.getTitles()).rejects.toThrow("Authentication required");
    expect(getDocs).not.toHaveBeenCalled();
  });

  it("surfaces read failures instead of returning an empty success value", async () => {
    getDocs.mockRejectedValueOnce(new Error("Firestore unavailable"));

    await expect(firebaseDatabaseService.getTitles()).rejects.toThrow("Firestore unavailable");
  });

  it("surfaces write failures instead of returning a locally fabricated draft", async () => {
    setDoc.mockRejectedValueOnce(new Error("permission-denied"));

    await expect(
      firebaseDatabaseService.saveDraft({
        id: "draft-1",
        creatorOwnerId: "user-1",
        title: "Safety Test",
      } as never)
    ).rejects.toThrow("permission-denied");
  });

  it("refuses to submit a missing draft instead of fabricating a title", async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });

    await expect(firebaseDatabaseService.submitDraftForReview("missing-draft")).rejects.toThrow(
      "refusing to fabricate a submission"
    );
    expect(setDoc).not.toHaveBeenCalled();
  });
});
