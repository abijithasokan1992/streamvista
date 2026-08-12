import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile, UserRole } from "../types/auth";
import { authService } from "../services/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchMockRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user session", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
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

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const result = await authService.signup(email, password, displayName);
      if (result.user) setUser(result.user);
      return result.confirmationRequired;
    } finally { setLoading(false); }
  };

  const switchMockRole = async (role: UserRole) => {
    if (authService.switchMockRole) {
      setLoading(true);
      try {
        const newUser = await authService.switchMockRole(role);
        setUser(newUser);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, switchMockRole }}>
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
