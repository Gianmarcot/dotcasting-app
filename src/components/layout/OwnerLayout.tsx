import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";

export const OwnerLayout = () => {
  return (
    <div className="min-h-screen bg-[#E8DFD4]">
      <OwnerSidebar />
      <main className="fixed top-0 right-0 bottom-0 left-64 p-2">
        <div className="h-full bg-white rounded-[3rem] overflow-hidden">
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