import { BrowserRouter, Navigate, Routes, Route, useSearchParams } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";

import Chat from "./pages/Chat";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import RevenuePotential from "./pages/RevenuePotential";
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
import SalesCommand from "./pages/SalesCommand";
import WorkspaceLanding from "./pages/WorkspaceLanding";
import GlobalBusinessCenter from "./pages/GlobalBusinessCenter";
import ComplaintBoxHome from "./pages/ComplaintBoxHome";
import ComplaintBoxCase from "./pages/ComplaintBoxCase";
import ComplaintBoxDashboard from "./pages/ComplaintBoxDashboard";
import CloudStorage from "./pages/CloudStorage";

const PLATFORM = ["platform_owner", "founder", "super_admin"] as const;
const ADMIN = [...PLATFORM, "admin"] as const;

function AuthLoading() {
  return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" /><p className="mt-4 text-sm text-white/70">Loading StreamVista…</p></div></div>;
}

function ChatRoute() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user) return <ProtectedRoute><Chat /></ProtectedRoute>;
  return <Chat />;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  if (loading) return <AuthLoading />;
  const next = params.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return user ? <Navigate to={safeNext} replace /> : <Login />;
}

function LegacyAuthRedirect() {
  const [params] = useSearchParams();
  const next = params.get("next");
  const theme = params.get("theme");
  const join = params.get("join");
  const target = new URLSearchParams();
  if (next?.startsWith("/") && !next.startsWith("//")) target.set("next", next);
  if (theme) target.set("theme", theme);
  if (join === "1") target.set("join", "1");
  const query = target.toString();
  return <Navigate to={`/login${query ? `?${query}` : ""}`} replace />;
}

function ComplaintBoxAuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  return user ? <Navigate to="/complaint-box/dashboard" replace /> : <Login />;
}

function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/chat" element={<ChatRoute />} />
    <Route path="/home" element={<Home />} />
    <Route path="/cloud-storage" element={<CloudStorage />} />
    <Route path="/login" element={<LoginRoute />} />
    <Route path="/auth" element={<LegacyAuthRedirect />} />

    <Route path="/complaint-box" element={<ComplaintBoxHome />} />
    <Route path="/complaint-box/auth" element={<ComplaintBoxAuthRoute />} />
    <Route path="/complaint-box/case" element={<ProtectedRoute><ComplaintBoxCase /></ProtectedRoute>} />
    <Route path="/complaint-box/dashboard" element={<ProtectedRoute><ComplaintBoxDashboard /></ProtectedRoute>} />

    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/revenue" element={<RevenuePotential />} />
      <Route path="/business-center" element={<ProtectedRoute allowedRoles={PLATFORM.slice()}><GlobalBusinessCenter /></ProtectedRoute>} />
      <Route path="/workspace/creator" element={<ProtectedRoute allowedRoles={[...ADMIN, "creator_partner"]}><WorkspaceLanding type="creator" /></ProtectedRoute>} />
      <Route path="/workspace/buyer" element={<ProtectedRoute allowedRoles={[...ADMIN, "buyer"]}><WorkspaceLanding type="buyer" /></ProtectedRoute>} />
      <Route path="/workspace/studio" element={<ProtectedRoute allowedRoles={ADMIN.slice()}><WorkspaceLanding type="studio" /></ProtectedRoute>} />
      <Route path="/command" element={<ProtectedRoute allowedRoles={PLATFORM.slice()}><FounderCommand /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute allowedRoles={ADMIN.slice()}><SalesCommand /></ProtectedRoute>} />
      <Route path="/titles" element={<Titles />} />
      <Route path="/creator" element={<ProtectedRoute allowedRoles={[...ADMIN, "creator_partner"]}><CreatorDashboard /></ProtectedRoute>} />
      <Route path="/buyer" element={<ProtectedRoute allowedRoles={[...ADMIN, "buyer"]}><BuyerDashboard /></ProtectedRoute>} />
      <Route path="/drafts" element={<ProtectedRoute allowedRoles={[...ADMIN, "creator_partner"]}><Drafts /></ProtectedRoute>} />
      <Route path="/uploads" element={<ProtectedRoute allowedRoles={[...ADMIN, "creator_partner"]}><Uploads /></ProtectedRoute>} />
      <Route path="/screenings" element={<ProtectedRoute allowedRoles={[...ADMIN, "buyer", "creator_partner"]}><Screenings /></ProtectedRoute>} />
      <Route path="/qc" element={<ProtectedRoute allowedRoles={[...ADMIN, "qc_staff"]}><QC /></ProtectedRoute>} />
      <Route path="/legal" element={<ProtectedRoute allowedRoles={[...ADMIN, "legal_staff"]}><Legal /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute allowedRoles={[...ADMIN, "finance"]}><Payments /></ProtectedRoute>} />
      <Route path="/payments" element={<Navigate to="/finance" replace />} />
      <Route path="/analytics" element={<ProtectedRoute allowedRoles={[...ADMIN, "finance", "creator_partner", "buyer"]}><Analytics /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute allowedRoles={[...ADMIN, "buyer"]}><Campaigns /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={ADMIN.slice()}><Users /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={ADMIN.slice()}><Settings /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<div className="flex h-full items-center justify-center text-slate-400"><p>Page not found or under construction.</p></div>} />
    </Route>
  </Routes><SpeedInsights /></BrowserRouter></AuthProvider>;
}

export default App;
