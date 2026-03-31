import { Outlet, Navigate } from "react-router-dom";
import { TalentSidebar } from "./TalentSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNavTalent } from "./MobileBottomNavTalent";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

export const TalentLayout = () => {
  const { isLoading, isOnboardingComplete } = useOnboardingCheck();

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

  if (!isOnboardingComplete) {
    return <Navigate to="/talent/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-card">
      <TalentSidebar />
      <MobileHeader variant="talent" />
      <main className="fixed top-0 right-0 bottom-0 left-0 md:left-64 p-0 pt-[52px] pb-[68px] md:p-2 md:pt-2 md:pb-2">
        <div className="h-full bg-background md:rounded-[3rem] overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="p-4 pt-4 md:p-8 md:pt-12 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNavTalent />
    </div>
  );
};
