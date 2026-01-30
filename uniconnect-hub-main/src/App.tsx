import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import Applications from "./pages/Applications";
import Borrow from "./pages/Borrow";
import Marketplace from "./pages/Marketplace";
import LostFound from "./pages/LostFound";
import Help from "./pages/Help";
import Emergency from "./pages/Emergency";
import Notices from "./pages/Notices";
import Hackathons from "./pages/Hackathons";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.profileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.profileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function HomeSafe() {
  // Minimal, defensive component that does not import any heavy modules.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold">UniConnect</h1>
        <p className="text-muted-foreground mt-2">Home is temporarily in safe mode. If you see this, the app core is running.</p>
        <p className="text-sm text-muted-foreground mt-2">You can still <a href="/auth" className="text-primary underline">sign in</a> or check the console for errors.</p>
      </div>
    </div>
  );
}

function ErrorDebugOverlay() {
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getLastError = () => (((window as unknown) as { __LAST_ERROR?: string }).__LAST_ERROR || null);
    const update = () => setErr(getLastError());
    update();
    window.addEventListener('error', update);
    window.addEventListener('unhandledrejection', update);
    const int = window.setInterval(update, 1000);
    return () => {
      window.removeEventListener('error', update);
      window.removeEventListener('unhandledrejection', update);
      clearInterval(int);
    };
  }, []);

  if (!err) return null;

  return (
    <div style={{position: 'fixed', right: 12, bottom: 12, zIndex: 9999}}>
      <div className="max-w-md p-3 rounded bg-red-600 text-white text-sm shadow-lg">
        <div className="font-semibold">Runtime Error</div>
        <div className="mt-1 whitespace-pre-wrap text-xs">{err}</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Use a minimal safe home route first so the app shows something even if Index has a problem */}
      <Route path="/" element={<HomeSafe />} />
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
      <Route path="/dashboard/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/dashboard/borrow" element={<ProtectedRoute><Borrow /></ProtectedRoute>} />
      <Route path="/dashboard/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/dashboard/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
      <Route path="/dashboard/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
      <Route path="/dashboard/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
      <Route path="/dashboard/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
      <Route path="/dashboard/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" theme="dark" />
          <ErrorDebugOverlay />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
