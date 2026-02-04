import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";
export const OwnerLayout = () => {
  return <div className="min-h-screen bg-background">
      <OwnerSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8 pt-12 max-w-7xl mx-auto py-[64px]">
          <Outlet />
        </div>
      </main>
    </div>;
};