import { useNavigate } from "react-router-dom";
import { it } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, FileEdit, Send } from "lucide-react";
import { useOwnerActionableStats } from "@/hooks/useOwnerDashboard";
import { ActionableStatCard } from "@/components/owner/dashboard/ActionableStatCard";
import { TriageQueueStrip } from "@/components/owner/dashboard/TriageQueueStrip";
import { ActiveCastingsList } from "@/components/owner/dashboard/ActiveCastingsList";
import { RecentActivityFeed } from "@/components/owner/dashboard/RecentActivityFeed";

export const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useOwnerActionableStats();

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">{it.backoffice.dashboard}</h1>
          <p className="text-muted-foreground mt-1">Cosa devi fare adesso</p>
        </div>
        <Button onClick={() => navigate("/owner/castings")}>
          <Plus className="h-4 w-4 mr-2" />
          {it.backoffice.createCasting}
        </Button>
      </div>

      {/* Actionable stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionableStatCard
          title="Nuovi da valutare"
          value={stats?.toTriage ?? 0}
          icon={Sparkles}
          link="/owner/talents?triage=1"
          isLoading={isLoading}
        />
        <ActionableStatCard
          title="Round in bozza"
          value={stats?.draftRounds ?? 0}
          icon={FileEdit}
          link="/owner/castings"
          isLoading={isLoading}
        />
        <ActionableStatCard
          title="Inviti in attesa"
          value={stats?.pendingInvitations ?? 0}
          icon={Send}
          link="/owner/castings"
          isLoading={isLoading}
        />
      </div>

      {/* Triage queue */}
      <TriageQueueStrip />

      {/* Active castings + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveCastingsList />
        <RecentActivityFeed />
      </div>
    </div>
  );
};

export default OwnerDashboard;
