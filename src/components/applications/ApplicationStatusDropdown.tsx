import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Send, Star, Clock, X, Phone, CheckCircle } from "lucide-react";
import { it } from "@/lib/i18n";
import type { ApplicationStatus } from "@/hooks/useApplications";

interface ApplicationStatusDropdownProps {
  currentStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  disabled?: boolean;
}

const statusConfig: Record<ApplicationStatus, { 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
}> = {
  submitted: { icon: Send, color: "text-info", bgColor: "bg-info/20" },
  shortlisted: { icon: Star, color: "text-success", bgColor: "bg-success/20" },
  hold: { icon: Clock, color: "text-warning", bgColor: "bg-warning/20" },
  rejected: { icon: X, color: "text-destructive", bgColor: "bg-destructive/20" },
  callback: { icon: Phone, color: "text-secondary", bgColor: "bg-secondary/20" },
  booked: { icon: CheckCircle, color: "text-primary", bgColor: "bg-primary/20" },
};

const workflowOrder: ApplicationStatus[] = [
  "submitted",
  "shortlisted",
  "hold",
  "callback",
  "booked",
  "rejected",
];

export const ApplicationStatusDropdown = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}: ApplicationStatusDropdownProps) => {
  const currentConfig = statusConfig[currentStatus];
  const CurrentIcon = currentConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${currentConfig.bgColor} ${currentConfig.color} hover:${currentConfig.bgColor}`}
          disabled={disabled}
        >
          <CurrentIcon className="h-4 w-4" />
          {it.applications.status[currentStatus]}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {workflowOrder.map((status, index) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isCurrentStatus = status === currentStatus;

          return (
            <div key={status}>
              {status === "rejected" && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onStatusChange(status)}
                className={`gap-2 cursor-pointer ${isCurrentStatus ? "bg-muted" : ""}`}
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span>{it.applications.status[status]}</span>
                {isCurrentStatus && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Attuale
                  </Badge>
                )}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
