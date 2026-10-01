import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNavOwner } from "./MobileBottomNavOwner";
import { useOwnerSidebarWidth } from "@/hooks/useOwnerSidebarWidth";

export const OwnerLayout = () => {
  const { width } = useOwnerSidebarWidth();

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <OwnerSidebar />
      <MobileHeader variant="owner" />
      <main
        className="fixed inset-0 pt-[52px] pb-[68px] md:py-0"
        style={{ ["--owner-sidebar-w" as any]: `${width}px` }}
      >
        <div
          className="h-full bg-background overflow-hidden md:ml-[var(--owner-sidebar-w)]"
        >
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="p-4 pt-4 md:p-8 md:pt-16 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNavOwner />
    </div>
  );
};
