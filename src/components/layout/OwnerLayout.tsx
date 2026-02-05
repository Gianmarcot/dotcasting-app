import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";

export const OwnerLayout = () => {
  return (
    <div className="min-h-screen bg-card">
      <OwnerSidebar />
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