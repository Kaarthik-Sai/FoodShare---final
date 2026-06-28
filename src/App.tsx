import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { Notification } from "./components/Notification";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { DonationListings } from "./pages/DonationListings";
import { DonationForm } from "./pages/DonationForm";
import { UserProfile } from "./pages/UserProfile";
import { ContactPage } from "./pages/ContactPage";
import { AdminMessagesPage } from "./pages/AdminMessagesPage";

// Route security gate: Protects pages from unauthorized guest visitors
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-400 font-medium">Synchronizing secure session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ mode: "login" }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* Dynamic top navigation */}
      <Navigation />

      {/* Floating notification alert toasts */}
      <Notification />

      {/* Primary Routing view space */}
      <main className="flex-grow">
        <Routes>
          {/* Guest Portal pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/listings" element={<DonationListings />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Secure Registered Portal paths */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute allowedRoles={["donor", "admin"]}>
                <DonationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Administrative paths */}
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminMessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Unified footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
