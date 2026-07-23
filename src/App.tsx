import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import Login from "./pages/Login";
import CreatorDashboard from "./pages/CreatorDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TitleSubmission from "./pages/TitleSubmission";
import QC from "./pages/QC";
import Legal from "./pages/Legal";
import Payments from "./pages/Payments";

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

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === "creator_partner") return <Navigate to="/creator" />;
  if (user.role === "buyer") return <Navigate to="/buyer" />;
  if (user.role === "qc_staff") return <Navigate to="/qc" />;
  if (user.role === "legal_staff") return <Navigate to="/legal" />;
  return <Navigate to="/admin" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<AppLayout><RootRedirect /></AppLayout>} />
          
          <Route path="/creator" element={<AppLayout><RoleBasedRoute roles={["creator_partner"]}><CreatorDashboard /></RoleBasedRoute></AppLayout>} />
          <Route path="/creator/titles/new" element={<AppLayout><RoleBasedRoute roles={["creator_partner"]}><TitleSubmission /></RoleBasedRoute></AppLayout>} />
          <Route path="/creator/titles/:id/edit" element={<AppLayout><RoleBasedRoute roles={["creator_partner"]}><TitleSubmission /></RoleBasedRoute></AppLayout>} />
          
          <Route path="/buyer" element={<AppLayout><RoleBasedRoute roles={["buyer"]}><BuyerDashboard /></RoleBasedRoute></AppLayout>} />
          <Route path="/payments" element={<AppLayout><RoleBasedRoute roles={["buyer"]}><Payments /></RoleBasedRoute></AppLayout>} />
          
          <Route path="/qc" element={<AppLayout><RoleBasedRoute roles={["qc_staff"]}><QC /></RoleBasedRoute></AppLayout>} />
          <Route path="/legal" element={<AppLayout><RoleBasedRoute roles={["legal_staff"]}><Legal /></RoleBasedRoute></AppLayout>} />
          <Route path="/admin" element={<AppLayout><RoleBasedRoute roles={["admin", "super_admin", "founder", "platform_owner"]}><AdminDashboard /></RoleBasedRoute></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
