import { AuthService } from "./auth.types";
import { UserProfile, UserRole } from "../../types/auth";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { logger } from "../../utils/logger";

class FirebaseAuthService implements AuthService {
  
  private async fetchUserProfile(user: User): Promise<UserProfile> {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    throw new Error("User profile not found in database. Account may be incomplete.");
  }

  async register(email: string, password?: string, displayName?: string): Promise<UserProfile> {
    const pwd = password || "password123";
    const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Hardcode 'buyer' as the default role for all new registrations (least privilege)
      const role: UserRole = 'buyer';
      
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName || userCredential.user.displayName || email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, newProfile);
      
      logger.trackEvent('user_registered_success', { uid: userCredential.user.uid });
      return newProfile;
    } catch (e: any) {
      logger.error("Registration failed", e);
      throw new Error(e.message || "Registration failed");
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          try {
            const profile = await this.fetchUserProfile(user);
            resolve(profile);
          } catch (e) {
            logger.error("Failed to fetch user profile", e as Error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }, reject);
    });
  }

  async login(email: string, password?: string): Promise<UserProfile> {
    const pwd = password || "password123";
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
      logger.trackEvent('user_login_success', { uid: userCredential.user.uid });
      return await this.fetchUserProfile(userCredential.user);
    } catch (e: any) {
      logger.error("Login failed", e);
      throw new Error(e.message || "Login failed");
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    logger.trackEvent('user_logout');
  }

  async resetPassword(email: string): Promise<void> {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    try {
      await sendPasswordResetEmail(auth, email);
      logger.trackEvent('password_reset_requested', { email });
    } catch (e: any) {
      logger.error("Password reset failed", e);
      throw new Error(e.message || "Failed to send password reset email");
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
