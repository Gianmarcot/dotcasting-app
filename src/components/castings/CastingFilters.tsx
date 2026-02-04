import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { it } from "@/lib/i18n";

interface CastingFiltersProps {
  status: string;
  search: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
}

export const CastingFilters = ({
  status,
  search,
  onStatusChange,
  onSearchChange,
}: CastingFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <Tabs value={status} onValueChange={onStatusChange}>
        <TabsList>
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="draft">{it.casting.draft}</TabsTrigger>
          <TabsTrigger value="active">{it.casting.active}</TabsTrigger>
          <TabsTrigger value="closed">{it.casting.closed}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca casting..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
};
