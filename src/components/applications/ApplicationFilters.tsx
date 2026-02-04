import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Star, Clock, X, Phone, CheckCircle } from "lucide-react";
import { it } from "@/lib/i18n";
import type { ApplicationStatus } from "@/hooks/useApplications";

interface ApplicationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ApplicationStatus | "all";
  onStatusFilterChange: (status: ApplicationStatus | "all") => void;
  stats?: {
    total: number;
    submitted: number;
    shortlisted: number;
    hold: number;
    rejected: number;
    callback: number;
    booked: number;
  };
}

const statusFilters: { value: ApplicationStatus | "all"; label: string; icon?: React.ElementType }[] = [
  { value: "all", label: "Tutte" },
  { value: "submitted", label: "Inviate", icon: Send },
  { value: "shortlisted", label: "Selezionate", icon: Star },
  { value: "hold", label: "In attesa", icon: Clock },
  { value: "callback", label: "Callback", icon: Phone },
  { value: "booked", label: "Confermate", icon: CheckCircle },
  { value: "rejected", label: "Rifiutate", icon: X },
];

export const ApplicationFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stats,
}: ApplicationFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome talent o casting..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(({ value, label, icon: Icon }) => {
          const isActive = statusFilter === value;
          const count = value === "all" ? stats?.total : stats?.[value];

          return (
            <Button
              key={value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusFilterChange(value)}
              className="gap-2"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
              {count !== undefined && count > 0 && (
                <Badge 
                  variant={isActive ? "secondary" : "outline"} 
                  className="ml-1 text-xs px-1.5"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
