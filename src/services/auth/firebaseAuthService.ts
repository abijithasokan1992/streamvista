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
    } else {
      // Auto-provision a default profile for first-time emulator logins
      // Assign role based on email hint for testing purposes
      let role: UserRole = 'buyer';
      if (user.email?.includes('creator')) role = 'creator_partner';
      if (user.email?.includes('admin')) role = 'super_admin';
      if (user.email?.includes('qc')) role = 'qc_staff';
      if (user.email?.includes('legal')) role = 'legal_staff';
      
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(userDocRef, newProfile);
      logger.info(`Auto-provisioned new user profile in Firestore: ${user.email} as ${role}`);
      return newProfile;
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
      // First try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
      logger.trackEvent('user_login_success', { uid: userCredential.user.uid });
      return await this.fetchUserProfile(userCredential.user);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.message?.includes('invalid')) {
        // Auto-register the user if they don't exist yet in the emulator
        try {
          const { createUserWithEmailAndPassword } = await import("firebase/auth");
          const newUserCredential = await createUserWithEmailAndPassword(auth, email, pwd);
          logger.trackEvent('user_registered_success', { uid: newUserCredential.user.uid });
          return await this.fetchUserProfile(newUserCredential.user);
        } catch (regError: any) {
          logger.error("Auto-registration failed", regError);
          throw new Error(regError.message);
        }
      }
      logger.error("Login failed", e);
      throw new Error(e.message || "Login failed");
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    logger.trackEvent('user_logout');
  }
}

export const firebaseAuthService = new FirebaseAuthService();
