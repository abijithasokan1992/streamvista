import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ currentUser: null as null | { uid: string; email: string } }));
const signInWithEmailAndPassword = vi.hoisted(() => vi.fn());
const createUserWithEmailAndPassword = vi.hoisted(() => vi.fn());
const getDoc = vi.hoisted(() => vi.fn());
const setDoc = vi.hoisted(() => vi.fn());

vi.mock("../firebase", () => ({
  auth: authState,
  db: {},
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => ({})),
  getDoc,
  setDoc,
}));

vi.mock("../../utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    trackEvent: vi.fn(),
  },
}));

import { firebaseAuthService } from "./firebaseAuthService";

describe("production-safe Firebase auth", () => {
  beforeEach(() => {
    authState.currentUser = null;
    vi.clearAllMocks();
  });

  it("rejects unauthenticated access instead of creating an anonymous session", async () => {
    await expect(firebaseAuthService.ensureAuthenticated()).rejects.toThrow("Authentication required");
  });

  it("requires an explicit password for login", async () => {
    await expect(firebaseAuthService.login("creator@example.com")).rejects.toThrow("Password is required");
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("does not auto-register after a failed login", async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error("invalid credentials"));

    await expect(firebaseAuthService.login("creator@example.com", "wrong-password")).rejects.toThrow(
      "invalid credentials"
    );
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("rejects authenticated users whose persistent profile is missing", async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: "user-1", email: "creator@example.com" },
    });
    getDoc.mockResolvedValueOnce({ exists: () => false });

    await expect(firebaseAuthService.login("creator@example.com", "valid-password")).rejects.toThrow(
      "profile is not provisioned"
    );
    expect(setDoc).not.toHaveBeenCalled();
  });
});
