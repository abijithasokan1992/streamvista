import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile } from "../types/auth";
import { authService } from "../services/auth";
import type { MagicLinkInput, SignupInput } from "../services/auth/auth.types";
import { supabase } from "../services/supabase";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  requestMagicLink: (input: MagicLinkInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const fromLink = await authService.exchangeMagicLinkSession();
        if (mounted && fromLink) {
          setUser(fromLink);
          return;
        }

        const currentUser = await authService.getCurrentUser();
        if (mounted) setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user session", error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getCurrentUser();
        if (mounted) setUser(profile);
      } catch (error) {
        console.error("Failed to refresh StreamVista profile after auth change", error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const requestMagicLink = async (input: MagicLinkInput) => {
    setLoading(true);
    try {
      await authService.requestMagicLink(input);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (input: SignupInput) => {
    setLoading(true);
    try {
      const result = await authService.signup(input);
      if (result.user) setUser(result.user);
      return result.confirmationRequired;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, requestMagicLink, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
