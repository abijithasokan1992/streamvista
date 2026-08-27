import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import CreatorStudio from './pages/CreatorStudio';
import Profile from './pages/Profile';
import CrayonsBridge from './pages/CrayonsBridge';
import RevenueDashboard from './pages/RevenueDashboard';
import CrayonsLoop from './pages/CrayonsLoop';
import NOCDashboard from './admin/noc/page';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const WorkspacePlaceholder = ({ name }: { name: string }) => {
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>
      
      <div className="bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-xl p-10 max-w-lg w-full text-center z-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h2 className="text-3xl font-serif text-white mb-4">Welcome to <span className="text-cyan-400">{name}</span></h2>
        <p className="text-zinc-400 mb-8">Your secure workspace session is active.</p>
        <button 
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login';
          }}
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm border border-white/5 transition-colors z-20 relative cursor-pointer mr-4"
        >
          Sign Out
        </button>
        <button 
          onClick={() => {
            window.location.href = '/profile';
          }}
          className="bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 font-medium py-2.5 px-6 rounded-lg text-sm border border-cyan-500/20 transition-colors z-20 relative cursor-pointer"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Protected Workspace Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/creator-studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
        <Route path="/crayons-pictures" element={<ProtectedRoute><WorkspacePlaceholder name="Crayons Pictures" /></ProtectedRoute>} />
        <Route path="/crayons-bridge" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} />
        <Route path="/revenue" element={<ProtectedRoute><RevenueDashboard /></ProtectedRoute>} />
        <Route path="/crayons-loop" element={<ProtectedRoute><CrayonsLoop /></ProtectedRoute>} />
        <Route path="/enterprise" element={<ProtectedRoute><WorkspacePlaceholder name="StreamVista Enterprise" /></ProtectedRoute>} />
        <Route path="/crayons-vault" element={<ProtectedRoute><WorkspacePlaceholder name="Crayons Vault" /></ProtectedRoute>} />
        <Route path="/admin/noc" element={<NOCDashboard />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
