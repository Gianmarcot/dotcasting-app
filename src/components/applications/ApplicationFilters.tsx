import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const statusFilters: { value: ApplicationStatus | "all"; label: string; Icon?: React.ElementType }[] = [
  { value: "all", label: "Tutte" },
  { value: "submitted", label: "Inviate", Icon: Send },
  { value: "shortlisted", label: "Selezionate", Icon: Star },
  { value: "hold", label: "In attesa", Icon: Clock },
  { value: "callback", label: "Callback", Icon: Phone },
  { value: "booked", label: "Confermate", Icon: CheckCircle },
  { value: "rejected", label: "Rifiutate", Icon: X },
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome talent o casting..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status filter tabs */}
      <Tabs value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as ApplicationStatus | "all")}>
        <TabsList>
          {statusFilters.map(({ value, label, Icon }) => {
            const count = value === "all" ? stats?.total : stats?.[value];

            return (
              <TabsTrigger key={value} value={value} className="gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
                {count !== undefined && count > 0 && (
                  <Badge 
                    variant="outline" 
                    className="ml-1 text-xs px-1.5"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};
