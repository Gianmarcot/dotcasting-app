import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, MessageSquare, Calendar } from "lucide-react";
import { ApplicationStatusDropdown } from "./ApplicationStatusDropdown";
import type { ApplicationWithDetails, ApplicationStatus } from "@/hooks/useApplications";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

interface ApplicationCardProps {
  application: ApplicationWithDetails;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onViewTalent?: (application: ApplicationWithDetails) => void;
  isUpdating?: boolean;
}

export const ApplicationCard = ({
  application,
  onStatusChange,
  onViewTalent,
  isUpdating = false,
}: ApplicationCardProps) => {
  const fullName =
    `${application.profile?.first_name || ""} ${application.profile?.last_name || ""}`.trim() || "Talent";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const submittedDate = format(new Date(application.submitted_at), "d MMM yyyy", { locale: itLocale });

  return (
    <div className="flex items-center justify-between p-4 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => onViewTalent?.(application)}>
          <AvatarImage src={application.profile?.profile_photo_url || undefined} alt={fullName} />
          <AvatarFallback className="bg-muted text-foreground">{initials}</AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <p
            className="font-medium text-foreground cursor-pointer hover:underline"
            onClick={() => onViewTalent?.(application)}
          >
            {fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            {application.casting?.title || "Casting sconosciuto"}
            {application.casting?.company && (
              <span className="text-muted-foreground/70"> • {application.casting.company.name}</span>
            )}
          </p>
          {application.profile?.city && <p className="text-xs text-muted-foreground">{application.profile.city}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ApplicationStatusDropdown
          currentStatus={application.status}
          onStatusChange={(status) => onStatusChange(application.id, status)}
          disabled={isUpdating}
        />

        <span className="text-sm text-muted-foreground whitespace-nowrap">{submittedDate}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewTalent?.(application)}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizza profilo
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="h-4 w-4 mr-2" />
              Invia messaggio
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="h-4 w-4 mr-2" />
              Programma provino
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
