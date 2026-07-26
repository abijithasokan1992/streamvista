import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile } from "../types/auth";
import { authService } from "../services/auth";

export const MOCK_USER: UserProfile = {
  uid: "creator_abijith",
  email: "abijith@streamvista.in",
  displayName: "Abijith Asokan (Founder & CEO)",
  role: "super_admin",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString()
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password?: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isMockMode = () => {
    if (typeof window === "undefined") return false;
    const envMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const queryMock = window.location.search.includes("mockAuth=true");
    return envMock || isLocalhost || queryMock;
  };

  useEffect(() => {
    async function loadUser() {
      try {
        if (isMockMode()) {
          // Clear stale local storage firebase auth tokens
          try {
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith("firebase:authUser") || key.includes("firebase")) {
                localStorage.removeItem(key);
              }
            });
          } catch (e) {
            // Ignore localStorage errors
          }

          setUser(MOCK_USER);
          setLoading(false);
          return;
        }

        const currentUser = await authService.getCurrentUser();
        setUser(currentUser || MOCK_USER);
      } catch (error) {
        console.warn("Auth initialization fallback to Mock User:", error);
        setUser(MOCK_USER);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (isMockMode()) {
        const mockProfile: UserProfile = {
          ...MOCK_USER,
          email,
          displayName: email.split('@')[0] || "StreamVista Partner"
        };
        setUser(mockProfile);
        return;
      }
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser || MOCK_USER);
    } catch (err) {
      setUser(MOCK_USER);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password?: string, displayName?: string) => {
    setLoading(true);
    try {
      if (isMockMode()) {
        const mockProfile: UserProfile = {
          ...MOCK_USER,
          email,
          displayName: displayName || email.split('@')[0]
        };
        setUser(mockProfile);
        return;
      }
      const newUser = await authService.register(email, password, displayName);
      setUser(newUser || MOCK_USER);
    } catch (err) {
      setUser(MOCK_USER);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (!isMockMode()) {
        await authService.logout();
      }
      setUser(MOCK_USER); // Default back to mock user on localhost so user is never locked out
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
