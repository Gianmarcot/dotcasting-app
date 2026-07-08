import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { it } from "@/lib/i18n";

export type CastingSort = "recent" | "company" | "period";

interface CastingFiltersProps {
  status: string;
  search: string;
  sort: CastingSort;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: CastingSort) => void;
}

export const CastingFilters = ({
  status,
  search,
  sort,
  onStatusChange,
  onSearchChange,
  onSortChange,
}: CastingFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <Tabs value={status} onValueChange={onStatusChange}>
        <TabsList>
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="draft">{it.casting.draft}</TabsTrigger>
          <TabsTrigger value="active">{it.casting.active}</TabsTrigger>
          <TabsTrigger value="closed">{it.casting.closed}</TabsTrigger>
          <TabsTrigger value="favorites">Preferiti</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-3 w-full lg:w-auto">
        <div className="relative flex-1 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca casting..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => onSortChange(v as CastingSort)}>
          <SelectTrigger className="w-[160px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Più recenti</SelectItem>
            <SelectItem value="company">Cliente</SelectItem>
            <SelectItem value="period">Periodo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
