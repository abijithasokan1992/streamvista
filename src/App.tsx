import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { RoleSwitcherWidget } from "./components/RoleSwitcherWidget";
import { CommandBar } from "./components/CommandBar";

// Page Imports
import { LandingPageV2 } from "./pages/LandingPageV2";
import { WorkspaceOS } from "./pages/WorkspaceOS";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChiefAIOperator from "./pages/ChiefAIOperator";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorProfile from "./pages/CreatorProfile";
import BuyerDashboard from "./pages/BuyerDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import PublicPage from "./pages/PublicPage";
import Discovery from "./pages/Discovery";
import PurchaseHistory from "./pages/PurchaseHistory";
import Titles from "./pages/Titles";
import Drafts from "./pages/Drafts";
import Uploads from "./pages/Uploads";
import Screenings from "./pages/Screenings";
import QC from "./pages/QC";
import Legal from "./pages/Legal";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import AuditExplorer from "./pages/AuditExplorer";
import Campaigns from "./pages/Campaigns";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

// Integrations
import InstagramDashboard from "./pages/integrations/InstagramDashboard";
import InstagramCallback from "./pages/integrations/InstagramCallback";
import InstagramAccount from "./pages/integrations/InstagramAccount";
import InstagramMediaView from "./pages/integrations/InstagramMedia";
import InstagramInsightsView from "./pages/integrations/InstagramInsights";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-black">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <CommandBar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-brand-black to-brand-navy p-4 text-white relative md:p-8">
          <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-5 pointer-events-none mix-blend-screen" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public conversion routes */}
          <Route path="/" element={<LandingPageV2 />} />
          <Route path="/landing" element={<LandingPageV2 />} />
          <Route path="/marketplace" element={<PublicPage eyebrow="Marketplace" title="Discover rights-cleared content" description="Browse StreamVista catalogue workflows and enter the buyer workspace to search, review availability and request licensing." primaryLabel="Open buyer marketplace" primaryPath="/buyer" />} />
          <Route path="/fast" element={<PublicPage eyebrow="FAST" title="FAST and channel distribution" description="StreamVista connects catalogue, rights, delivery and monetisation workflows for FAST and digital distribution operations." primaryLabel="Open distribution workspace" primaryPath="/distributor" />} />
          <Route path="/services" element={<PublicPage eyebrow="Services" title="Media, licensing and operations services" description="Use StreamVista for creator onboarding, rights workflows, distribution operations, delivery support and AI-assisted platform operations." primaryLabel="Choose a workflow" primaryPath="/" />} />
          <Route path="/about" element={<PublicPage eyebrow="About" title="One operating system for media work" description="StreamVista brings creator, buyer, distributor and private AI operations into one task-oriented platform without mixing public marketing with operational controls." />} />
          <Route path="/contact" element={<PublicPage eyebrow="Contact" title="Start with the work you need done" description="Choose the creator, buyer, distributor or AI workspace entry point and continue directly into the relevant workflow." primaryLabel="Return to StreamVista" primaryPath="/" />} />

          {/* Workspace and authentication */}
          <Route path="/workspace" element={<WorkspaceOS />} />
          <Route path="/login" element={<Login />} />

          {/* Mission Control & role dashboards */}
          <Route path="/mission-control" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/chief-ai-operator" element={<AppLayout><ChiefAIOperator /></AppLayout>} />
          <Route path="/creator" element={<AppLayout><CreatorDashboard /></AppLayout>} />
          <Route path="/creator/profile" element={<AppLayout><CreatorProfile /></AppLayout>} />
          <Route path="/buyer" element={<AppLayout><BuyerDashboard /></AppLayout>} />
          <Route path="/buyer/discover" element={<AppLayout><Discovery /></AppLayout>} />
          <Route path="/buyer/history" element={<AppLayout><PurchaseHistory /></AppLayout>} />
          <Route path="/distributor" element={<AppLayout><DistributorDashboard /></AppLayout>} />

          {/* Catalogue & Content Management */}
          <Route path="/titles" element={<AppLayout><Titles /></AppLayout>} />
          <Route path="/drafts" element={<AppLayout><Drafts /></AppLayout>} />
          <Route path="/uploads" element={<AppLayout><Uploads /></AppLayout>} />
          <Route path="/screenings" element={<AppLayout><Screenings /></AppLayout>} />

          {/* Admin OS Operations */}
          <Route path="/qc" element={<AppLayout><QC /></AppLayout>} />
          <Route path="/legal" element={<AppLayout><Legal /></AppLayout>} />
          <Route path="/finance" element={<AppLayout><Payments /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/admin/audit" element={<AppLayout><AuditExplorer /></AppLayout>} />
          <Route path="/campaigns" element={<AppLayout><Campaigns /></AppLayout>} />
          <Route path="/users" element={<AppLayout><Users /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

          {/* Intentional Compatibility Redirects */}
          <Route path="/checkout/storage" element={<Navigate to="/uploads?upgrade=storage" replace />} />

          {/* Instagram Integration Routes */}
          <Route path="/integrations/instagram" element={<AppLayout><InstagramDashboard /></AppLayout>} />
          <Route path="/integrations/instagram/callback" element={<AppLayout><InstagramCallback /></AppLayout>} />
          <Route path="/integrations/instagram/account" element={<AppLayout><InstagramAccount /></AppLayout>} />
          <Route path="/integrations/instagram/media" element={<AppLayout><InstagramMediaView /></AppLayout>} />
          <Route path="/integrations/instagram/insights" element={<AppLayout><InstagramInsightsView /></AppLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <RoleSwitcherWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}
