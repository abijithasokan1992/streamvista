import { BrowserRouter, Navigate, Routes, Route, useSearchParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";

import Chat from "./pages/Chat";
import HomeWhite from "./pages/HomeWhite";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import Titles from "./pages/Titles";
import CreatorDashboard from "./pages/CreatorDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Drafts from "./pages/Drafts";
import Uploads from "./pages/Uploads";
import Screenings from "./pages/Screenings";
import QC from "./pages/QC";
import Legal from "./pages/Legal";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Campaigns from "./pages/Campaigns";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import FounderCommand from "./pages/FounderCommand";
import WorkspaceLanding from "./pages/WorkspaceLanding";

const PLATFORM = ["platform_owner", "founder", "super_admin"] as const;
const ADMIN = [...PLATFORM, "admin"] as const;

function isMarketingHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "www.streamvista.in" || window.location.hostname === "streamvista.in";
}

function RootRoute() {
  if (isMarketingHost()) return <HomeWhite />;
  return <ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>;
}

function ChatRoute() {
  if (isMarketingHost()) {
    window.location.replace("https://chat.streamvista.in/login?next=/chat");
    return null;
  }
  return <ProtectedRoute><Chat /></ProtectedRoute>;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  if (loading) return null;
  const next = params.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return user ? <Navigate to={safeNext} replace /> : <Login />;
}

function LegacyAuthRedirect() {
  const [params] = useSearchParams();
  const next = params.get("next");
  const theme = params.get("theme");
  const target = new URLSearchParams();
  if (next?.startsWith("/") && !next.startsWith("//")) target.set("next", next);
  if (theme) target.set("theme", theme);
  const query = target.toString();
  return <Navigate to={`/login${query ? `?${query}` : ""}`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/chat" element={<ChatRoute />} />
          <Route path="/home" element={<HomeWhite />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/auth" element={<LegacyAuthRedirect />} />

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workspace/creator" element={<WorkspaceLanding type="creator" />} />
            <Route path="/workspace/buyer" element={<WorkspaceLanding type="buyer" />} />
            <Route path="/workspace/studio" element={<WorkspaceLanding type="studio" />} />
            <Route path="/command" element={<ProtectedRoute allowedRoles={PLATFORM.slice()}><FounderCommand /></ProtectedRoute>} />
            <Route path="/titles" element={<Titles />} />
            <Route path="/creator" element={<ProtectedRoute allowedRoles={[...ADMIN, "creator_partner"]}><CreatorDashboard /></ProtectedRoute>} />
            <Route path="/buyer" element={<ProtectedRoute allowedRoles={[...ADMIN, "buyer"]}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/drafts" element={<ProtectedRoute allowedRoles={[...ADMIN, "creator_partner"]}><Drafts /></ProtectedRoute>} />
            <Route path="/uploads" element={<ProtectedRoute allowedRoles={[...ADMIN, "creator_partner"]}><Uploads /></ProtectedRoute>} />
            <Route path="/screenings" element={<ProtectedRoute allowedRoles={[...ADMIN, "buyer"]}><Screenings /></ProtectedRoute>} />
            <Route path="/qc" element={<ProtectedRoute allowedRoles={[...ADMIN, "qc_staff"]}><QC /></ProtectedRoute>} />
            <Route path="/legal" element={<ProtectedRoute allowedRoles={[...ADMIN, "legal_staff"]}><Legal /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute allowedRoles={[...PLATFORM, "finance"]}><Payments /></ProtectedRoute>} />
            <Route path="/payments" element={<Navigate to="/finance" replace />} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={[...ADMIN, "finance"]}><Analytics /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute allowedRoles={ADMIN.slice()}><Campaigns /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={PLATFORM.slice()}><Users /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={ADMIN.slice()}><Settings /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<div className="flex h-full items-center justify-center text-slate-400"><p>Page not found or under construction.</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
