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
}> = {
  submitted: { icon: Send },
  shortlisted: { icon: Star },
  hold: { icon: Clock },
  rejected: { icon: X },
  callback: { icon: Phone },
  booked: { icon: CheckCircle },
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
          variant="outline"
          size="sm"
          className="gap-2"
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
                <Icon className="h-4 w-4" />
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
