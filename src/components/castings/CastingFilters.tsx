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
  count?: number;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: CastingSort) => void;
}

export const CastingFilters = ({
  status,
  search,
  sort,
  count,
  onStatusChange,
  onSearchChange,
  onSortChange,
}: CastingFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
      {/* Sinistra: stato + search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1 min-w-0">
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

        <div className="relative w-full sm:max-w-[450px] sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cerca per parola chiave"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Destra: conteggio + ordinamento */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
        {typeof count === "number" && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {count} {count === 1 ? "casting" : "casting"}
          </span>
        )}
        <Select value={sort} onValueChange={(v) => onSortChange(v as CastingSort)}>
          <SelectTrigger className="w-full sm:w-52 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Più recenti</SelectItem>
            <SelectItem value="oldest">Meno recenti</SelectItem>
            <SelectItem value="title_asc">Titolo A→Z</SelectItem>
            <SelectItem value="title_desc">Titolo Z→A</SelectItem>
            <SelectItem value="start_date">Data inizio</SelectItem>
            <SelectItem value="end_date">Data fine</SelectItem>
            <SelectItem value="company">Cliente</SelectItem>
            <SelectItem value="status">Stato</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

