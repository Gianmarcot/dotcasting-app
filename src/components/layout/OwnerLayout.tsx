import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNavOwner } from "./MobileBottomNavOwner";

export const OwnerLayout = () => {
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <OwnerSidebar />
      <MobileHeader variant="owner" />
      <main className="fixed top-0 right-0 bottom-0 left-0 md:left-64 p-0 pt-[52px] pb-[68px] md:p-2 md:pt-2 md:pb-2">
        <div className="h-full bg-background md:rounded-[3rem] overflow-hidden">
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
