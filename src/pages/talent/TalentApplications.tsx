import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Eye, Undo2, XCircle, Calendar, Building2, FileText } from "lucide-react";
import { useTalentApplications, useWithdrawApplication, type TalentApplicationStatus, type TalentApplication } from "@/hooks/useTalentApplications";
import { CastingDetailDialog } from "@/components/castings/CastingDetailDialog";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { useState } from "react";

const statusConfig: Record<TalentApplicationStatus, { 
  label: string;
  color: string;
}> = {
  submitted: { label: "Inviata", color: "bg-[#C88500]/15 text-[#9A6700]" },
  shortlisted: { label: "Selezionata", color: "bg-[#729128]/15 text-[#729128]" },
  hold: { label: "In attesa", color: "bg-[#C88500]/15 text-[#9A6700]" },
  rejected: { label: "Rifiutata", color: "bg-[#A30A2B]/15 text-[#A30A2B]" },
  callback: { label: "Richiamata", color: "bg-[#729128]/15 text-[#729128]" },
  booked: { label: "Confermata", color: "bg-[#729128]/15 text-[#729128]" },
  withdrawn: { label: "Ritirata", color: "bg-[#333333]/10 text-[#333333]" },
};

export const TalentApplications = () => {
  const { data: applications, isLoading } = useTalentApplications();
  const withdrawMutation = useWithdrawApplication();
  const [selectedApp, setSelectedApp] = useState<{ id: string; action: "withdraw" | "reactivate" } | null>(null);
  const [viewingCasting, setViewingCasting] = useState<TalentApplication["casting"] | null>(null);

  const handleWithdraw = (id: string) => {
    setSelectedApp({ id, action: "withdraw" });
  };

  const handleReactivate = (id: string) => {
    setSelectedApp({ id, action: "reactivate" });
  };

  const confirmAction = () => {
    if (!selectedApp) return;
    withdrawMutation.mutate({ 
      id: selectedApp.id, 
      withdraw: selectedApp.action === "withdraw" 
    });
    setSelectedApp(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-2xl text-foreground">{it.applications.title}</h1>
          <p className="text-muted-foreground mt-1">Monitora lo stato delle tue candidature</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeApplications = applications?.filter(app => app.status !== "withdrawn") || [];
  const withdrawnApplications = applications?.filter(app => app.status === "withdrawn") || [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl text-foreground">{it.applications.title}</h1>
        <p className="text-muted-foreground mt-1">Monitora lo stato delle tue candidature</p>
      </div>

      {applications?.length === 0 ? (
        <Card className="">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nessuna candidatura
            </h3>
            <p className="text-muted-foreground">
              Non hai ancora inviato candidature. Esplora i casting disponibili per iniziare!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Applications */}
          {activeApplications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">
                Candidature attive ({activeApplications.length})
              </h2>
              {activeApplications.map((app) => (
                <ApplicationCard 
                  key={app.id} 
                  application={app}
                  onWithdraw={handleWithdraw}
                  onReactivate={handleReactivate}
                  onViewCasting={setViewingCasting}
                  isUpdating={withdrawMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* Withdrawn Applications */}
          {withdrawnApplications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-muted-foreground">
                Candidature ritirate ({withdrawnApplications.length})
              </h2>
              {withdrawnApplications.map((app) => (
                <ApplicationCard 
                  key={app.id} 
                  application={app}
                  onWithdraw={handleWithdraw}
                  onReactivate={handleReactivate}
                  onViewCasting={setViewingCasting}
                  isUpdating={withdrawMutation.isPending}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedApp?.action === "withdraw" 
                ? "Ritirare la candidatura?" 
                : "Riattivare la candidatura?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedApp?.action === "withdraw"
                ? "La tua candidatura verrà ritirata ma potrai riabilitarla in qualsiasi momento."
                : "La tua candidatura tornerà attiva e visibile ai casting director."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {selectedApp?.action === "withdraw" ? "Ritira" : "Riattiva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Casting Detail Dialog */}
      <CastingDetailDialog
        open={!!viewingCasting}
        onOpenChange={(open) => !open && setViewingCasting(null)}
        casting={viewingCasting}
      />
    </div>
  );
};

interface ApplicationCardProps {
  application: TalentApplication;
  onWithdraw: (id: string) => void;
  onReactivate: (id: string) => void;
  onViewCasting: (casting: TalentApplication["casting"]) => void;
  isUpdating: boolean;
}

const ApplicationCard = ({ application, onWithdraw, onReactivate, onViewCasting, isUpdating }: ApplicationCardProps) => {
  const config = statusConfig[application.status];
  const isWithdrawn = application.status === "withdrawn";
  const submittedDate = format(new Date(application.submitted_at), "d MMM yyyy", { locale: itLocale });

  return (
    <Card className={`${isWithdrawn ? "opacity-60" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 
                className="text-foreground font-medium cursor-pointer hover:underline"
                onClick={() => onViewCasting(application.casting)}
              >
                {application.casting?.title || "Casting sconosciuto"}
              </h3>
              <Badge className={config.color}>{config.label}</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {application.casting?.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {application.casting.company.name}
                </span>
              )}
              {application.casting?.category && (
                <Badge variant="outline" className="text-xs">
                  {application.casting.category}
                </Badge>
              )}
              {(application.casting?.start_date || application.casting?.end_date) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {application.casting?.start_date && format(new Date(application.casting.start_date), "d MMM", { locale: itLocale })}
                  {application.casting?.start_date && application.casting?.end_date && " - "}
                  {application.casting?.end_date && format(new Date(application.casting.end_date), "d MMM yyyy", { locale: itLocale })}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Candidatura inviata il {submittedDate}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isUpdating}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewCasting(application.casting)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizza casting
              </DropdownMenuItem>
              {isWithdrawn ? (
                <DropdownMenuItem onClick={() => onReactivate(application.id)}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Riattiva candidatura
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => onWithdraw(application.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Ritira candidatura
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default TalentApplications;
