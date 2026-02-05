import { Outlet, Navigate } from "react-router-dom";
import { TalentSidebar } from "./TalentSidebar";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

export const TalentLayout = () => {
  const { isLoading, isOnboardingComplete } = useOnboardingCheck();

  // Show loading while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if not complete
  if (!isOnboardingComplete) {
    return <Navigate to="/talent/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-card">
      <TalentSidebar />
      <main className="ml-64 min-h-screen p-4">
        <div className="min-h-[calc(100vh-2rem)] bg-background rounded-[3rem] overflow-hidden">
          <div className="p-8 pt-12 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
