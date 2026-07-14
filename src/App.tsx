import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import CardPreview from "./dev/CardPreview";
import SharedRound from "./pages/shared/SharedRound";
import AcceptInvitation from "./pages/AcceptInvitation";
import DesignSystem from "./pages/DesignSystem";

// Layouts
import { TalentLayout } from "@/components/layout/TalentLayout";
import { OwnerLayout } from "@/components/layout/OwnerLayout";

// Talent pages
import TalentDashboard from "./pages/talent/TalentDashboard";
import TalentApplications from "./pages/talent/TalentApplications";
import TalentMessages from "./pages/talent/TalentMessages";
import TalentProfile from "./pages/talent/TalentProfile";
import TalentSettings from "./pages/talent/TalentSettings";
import TalentOnboarding from "./pages/talent/TalentOnboarding";

// Shared pages
import TalentPublicProfile from "./pages/shared/TalentPublicProfile";

// Owner pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerTalentEdit from "./pages/owner/OwnerTalentEdit";
import OwnerTalents from "./pages/owner/OwnerTalents";
import OwnerCastings from "./pages/owner/OwnerCastings";
import OwnerCastingDetail from "./pages/owner/OwnerCastingDetail";
import OwnerCastingRoleDetail from "./pages/owner/OwnerCastingRoleDetail";
import OwnerRoundDetail from "./pages/owner/OwnerRoundDetail";
import OwnerApplications from "./pages/owner/OwnerApplications";
import OwnerMessages from "./pages/owner/OwnerMessages";
import OwnerCompanies from "./pages/owner/OwnerCompanies";
import OwnerCompanyDetail from "./pages/owner/OwnerCompanyDetail";
import OwnerSettings from "./pages/owner/OwnerSettings";
import OwnerNotifications from "./pages/owner/OwnerNotifications";
import OwnerNotificationDetail from "./pages/owner/OwnerNotificationDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dev/card-preview" element={<CardPreview />} />
            <Route path="/round/:token" element={<SharedRound />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/design-system" element={<DesignSystem />} />
            
            {/* Talent onboarding - protected but outside layout */}
            <Route
              path="/talent/onboarding"
              element={
                <ProtectedRoute allowedRoles={["talent"]}>
                  <TalentOnboarding />
                </ProtectedRoute>
              }
            />

            {/* Talent routes */}
            <Route
              path="/talent"
              element={
                <ProtectedRoute allowedRoles={["talent"]}>
                  <TalentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TalentDashboard />} />
              <Route path="applications" element={<TalentApplications />} />
              <Route path="messages" element={<TalentMessages />} />
              <Route path="profile" element={<TalentProfile />} />
              <Route path="profile/preview" element={<TalentPublicProfile />} />
              <Route path="settings" element={<TalentSettings />} />
            </Route>

            {/* Owner/Admin routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin", "editor"]}>
                  <OwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OwnerDashboard />} />
              <Route path="talents" element={<OwnerTalents />} />
              <Route path="talents/:profileId/edit" element={<OwnerTalentEdit />} />
              <Route path="talents/:profileId/view" element={<TalentPublicProfile />} />
              <Route path="castings" element={<OwnerCastings />} />
              <Route path="castings/:castingId" element={<OwnerCastingDetail />} />
              <Route path="castings/:castingId/rounds/:roundId" element={<OwnerRoundDetail />} />
              <Route path="castings/:castingId/:roleId" element={<OwnerCastingRoleDetail />} />
              <Route path="applications" element={<OwnerApplications />} />
              <Route path="messages" element={<OwnerMessages />} />
              <Route path="companies" element={<OwnerCompanies />} />
              <Route path="companies/:companyId" element={<OwnerCompanyDetail />} />
              <Route path="notifications" element={<OwnerNotifications />} />
              <Route path="notifications/:notificationId" element={<OwnerNotificationDetail />} />
              <Route path="settings" element={<OwnerSettings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
