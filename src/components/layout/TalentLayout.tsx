import { Outlet } from "react-router-dom";
import { TalentSidebar } from "./TalentSidebar";

export const TalentLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <TalentSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
