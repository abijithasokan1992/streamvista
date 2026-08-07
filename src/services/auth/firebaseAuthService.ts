import { AuthService } from "./auth.types";
import { UserProfile, UserRole } from "../../types/auth";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { logger } from "../../utils/logger";

class FirebaseAuthService implements AuthService {
  private async fetchUserProfile(user: User): Promise<UserProfile> {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("Authenticated user profile is not provisioned.");
      }

      return userDoc.data() as UserProfile;
    } catch (err) {
      logger.error("Failed to fetch authenticated user profile", err as Error);
      throw err instanceof Error ? err : new Error("Failed to fetch authenticated user profile");
    }
  }

  async ensureAuthenticated(): Promise<User> {
    if (!auth.currentUser) {
      throw new Error("Authentication required.");
    }
    return auth.currentUser;
  }

  async register(email: string, password?: string, displayName?: string): Promise<UserProfile> {
    if (!password) {
      throw new Error("Password is required for registration.");
    }

    const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      const role: UserRole = "creator_partner";
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName || userCredential.user.displayName || email.split("@")[0],
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      logger.trackEvent("user_registered_success", { uid: userCredential.user.uid });
      return newProfile;
    } catch (err) {
      logger.error("Registration failed", err as Error);
      throw err instanceof Error ? err : new Error("Registration failed");
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          unsubscribe();
          if (!user) {
            resolve(null);
            return;
          }

          try {
            resolve(await this.fetchUserProfile(user));
          } catch (err) {
            reject(err);
          }
        },
        (err) => {
          unsubscribe();
          logger.error("Authentication state lookup failed", err);
          reject(err);
        }
      );
    });
  }

  async login(email: string, password?: string): Promise<UserProfile> {
    if (!password) {
      throw new Error("Password is required for login.");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      logger.trackEvent("user_login_success", { uid: userCredential.user.uid });
      return await this.fetchUserProfile(userCredential.user);
    } catch (err) {
      logger.error("Login failed", err as Error);
      throw err instanceof Error ? err : new Error("Login failed");
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    logger.trackEvent("user_logout");
  }

  async resetPassword(email: string): Promise<void> {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    try {
      await sendPasswordResetEmail(auth, email);
      logger.trackEvent("password_reset_requested", { email });
    } catch (err) {
      logger.error("Password reset failed", err as Error);
      throw err instanceof Error ? err : new Error("Failed to send password reset email");
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
