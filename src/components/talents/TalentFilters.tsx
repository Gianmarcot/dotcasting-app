import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { TalentFilters as TalentFiltersType } from "@/hooks/useTalents";

interface TalentFiltersProps {
  filters: TalentFiltersType;
  onFiltersChange: (filters: TalentFiltersType) => void;
  options: {
    cities: string[];
    genders: string[];
    categories: string[];
    skills: string[];
  };
}

const genderLabels: Record<string, string> = {
  male: "Uomo",
  female: "Donna",
  other: "Altro",
};

export const TalentFiltersComponent = ({
  filters,
  onFiltersChange,
  options,
}: TalentFiltersProps) => {
  const hasActiveFilters =
    filters.city || filters.category || filters.gender || (filters.skills && filters.skills.length > 0);

  const clearFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome o città..."
          className="pl-10"
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Filter selects */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.city || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, city: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Città" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le città</SelectItem>
            {options.cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, category: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {options.categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.gender || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, gender: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Genere" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {options.genders.map((gender) => (
              <SelectItem key={gender} value={gender}>
                {genderLabels[gender] || gender}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Rimuovi filtri
          </Button>
        )}
      </div>
    </div>
  );
};
