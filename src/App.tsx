import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

// Page Imports
import InstagramDashboard from "./pages/integrations/InstagramDashboard";
import InstagramCallback from "./pages/integrations/InstagramCallback";
import InstagramAccount from "./pages/integrations/InstagramAccount";
import InstagramMediaView from "./pages/integrations/InstagramMedia";
import InstagramInsightsView from "./pages/integrations/InstagramInsights";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen overflow-hidden bg-brand-black">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-brand-black to-brand-navy p-8 text-white relative">
          <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-5 pointer-events-none mix-blend-screen" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function RoleBasedRoute({ roles, children }: { roles: string[], children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Integration Routes */}
          <Route
            path="/integrations/instagram"
            element={
              <AppLayout>
                <InstagramDashboard />
              </AppLayout>
            }
          />
          <Route
            path="/integrations/instagram/callback"
            element={
              <AppLayout>
                <InstagramCallback />
              </AppLayout>
            }
          />
          <Route
            path="/integrations/instagram/account"
            element={
              <AppLayout>
                <InstagramAccount />
              </AppLayout>
            }
          />
          <Route
            path="/integrations/instagram/media"
            element={
              <AppLayout>
                <InstagramMediaView />
              </AppLayout>
            }
          />
          <Route
            path="/integrations/instagram/insights"
            element={
              <AppLayout>
                <InstagramInsightsView />
              </AppLayout>
            }
          />

          {/* Root Redirect */}
          <Route path="*" element={<Navigate to="/integrations/instagram" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
