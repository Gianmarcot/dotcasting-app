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
      <main className="fixed top-0 right-0 bottom-0 left-64 p-2">
        <div className="h-full bg-background rounded-[3rem] overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-8 pt-12 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
