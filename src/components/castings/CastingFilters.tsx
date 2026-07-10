import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { it } from "@/lib/i18n";
import type { CastingSort } from "@/hooks/useCastings";

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
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-40 rounded-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutti</SelectItem>
          <SelectItem value="draft">{it.casting.draft}</SelectItem>
          <SelectItem value="active">{it.casting.active}</SelectItem>
          <SelectItem value="closed">{it.casting.closed}</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per parola chiave"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      <Select value={sort} onValueChange={(v) => onSortChange(v as CastingSort)}>
        <SelectTrigger className="w-full sm:w-44 rounded-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Più recenti</SelectItem>
          <SelectItem value="company">Cliente</SelectItem>
          <SelectItem value="status">Stato</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
