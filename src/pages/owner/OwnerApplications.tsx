import { useState } from "react";
import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileX2 } from "lucide-react";
import { useApplications, useUpdateApplicationStatus, useApplicationStats, type ApplicationStatus, type ApplicationWithDetails } from "@/hooks/useApplications";
import { ApplicationFilters } from "@/components/applications/ApplicationFilters";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { ApplicationTalentDialog } from "@/components/applications/ApplicationTalentDialog";

export const OwnerApplications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [selectedProfile, setSelectedProfile] = useState<ApplicationWithDetails["profile"] | null>(null);
  const [pendingBookedApplication, setPendingBookedApplication] = useState<ApplicationWithDetails | null>(null);

  const { data: applications, isLoading } = useApplications({
    statusFilter,
    searchQuery,
  });
  const { data: stats } = useApplicationStats();
  const updateStatus = useUpdateApplicationStatus();

  const handleStatusChange = (id: string, status: ApplicationStatus, application?: ApplicationWithDetails) => {
    if (status === "booked" && application) {
      // Show dialog to assign audition slot
      setPendingBookedApplication(application);
    } else {
      updateStatus.mutate({ id, status });
    }
  };

  const handleAuditionSlotAssigned = () => {
    if (pendingBookedApplication) {
      // Now update the status to booked
      updateStatus.mutate({ 
        id: pendingBookedApplication.id, 
        status: "booked" 
      });
    }
  };

  const handleViewTalent = (application: ApplicationWithDetails) => {
    if (application.profile) {
      setSelectedProfile(application.profile);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl text-foreground">
          {it.backoffice.applications}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestisci tutte le candidature ricevute per i tuoi casting
        </p>
      </div>

      {/* Filters */}
      <ApplicationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        stats={stats}
      />

      {/* Applications list */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="divide-y divide-border">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onStatusChange={(id, status) => handleStatusChange(id, status, app)}
                  onViewTalent={handleViewTalent}
                  isUpdating={updateStatus.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileX2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                Nessuna candidatura trovata
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {statusFilter !== "all" 
                  ? `Non ci sono candidature con stato "${it.applications.status[statusFilter]}"`
                  : searchQuery 
                    ? "Nessun risultato per la tua ricerca" 
                    : "Le candidature appariranno qui quando i talent si candideranno ai tuoi casting"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Talent Detail Dialog */}
      <ApplicationTalentDialog
        profile={selectedProfile}
        open={!!selectedProfile}
        onOpenChange={(open) => !open && setSelectedProfile(null)}
      />

      {/* Assign Audition Slot Dialog */}
      <AssignAuditionSlotDialog
        open={!!pendingBookedApplication}
        onOpenChange={(open) => !open && setPendingBookedApplication(null)}
        application={pendingBookedApplication}
        onSuccess={handleAuditionSlotAssigned}
      />
    </div>
  );
};

export default OwnerApplications;
