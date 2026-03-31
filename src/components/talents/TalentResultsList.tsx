import { TalentWithAttributes, TalentFilters } from "@/hooks/useTalents";
import { TalentResultRow } from "./TalentResultRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Users, X } from "lucide-react";
import { GENDERS, NATIONALITIES, ETHNICITIES, EYE_COLORS, HAIR_COLORS, HAIR_LENGTHS, SHIRT_SIZES, LANGUAGES, REPRESENTATION_TYPES } from "@/lib/profileOptions";

interface TalentResultsListProps {
  talents: TalentWithAttributes[] | undefined;
  totalCount: number;
  isLoading: boolean;
  filters: TalentFilters;
  onFiltersChange: (filters: TalentFilters) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onTalentClick: (talent: TalentWithAttributes) => void;
  onExportCSV: () => void;
}

// Build readable chip labels for active filters
interface ActiveChip {
  key: keyof TalentFilters;
  label: string;
}

const genderLabel = (v: string) => GENDERS.find((g) => g.value === v)?.label || v;
const reprLabel = (v: string) => REPRESENTATION_TYPES.find((r) => r.value === v)?.label || v;

const getActiveChips = (filters: TalentFilters): ActiveChip[] => {
  const chips: ActiveChip[] = [];
  if (filters.search) chips.push({ key: "search", label: `"${filters.search}"` });
  if (filters.roles?.length) chips.push({ key: "roles", label: `Ruoli: ${filters.roles.join(", ")}` });
  if (filters.gender) chips.push({ key: "gender", label: `Sesso: ${genderLabel(filters.gender)}` });
  if (filters.ageMin || filters.ageMax) {
    const parts = [];
    if (filters.ageMin) parts.push(`da ${filters.ageMin}`);
    if (filters.ageMax) parts.push(`a ${filters.ageMax}`);
    chips.push({ key: "ageMin", label: `Età: ${parts.join(" ")}` });
  }
  if (filters.nationality) chips.push({ key: "nationality", label: `Nazionalità: ${filters.nationality}` });
  if (filters.city) chips.push({ key: "city", label: `Città: ${filters.city}` });
  if (filters.genderIdentity) chips.push({ key: "genderIdentity", label: `Identità: ${filters.genderIdentity}` });
  if (filters.representationType) chips.push({ key: "representationType", label: `Rappr.: ${reprLabel(filters.representationType)}` });
  if (filters.ethnicity) chips.push({ key: "ethnicity", label: `Carnagione: ${filters.ethnicity}` });
  if (filters.eyeColor) chips.push({ key: "eyeColor", label: `Occhi: ${filters.eyeColor}` });
  if (filters.hairColor) chips.push({ key: "hairColor", label: `Capelli: ${filters.hairColor}` });
  if (filters.hairLength) chips.push({ key: "hairLength", label: `Lunghezza: ${filters.hairLength}` });
  if (filters.heightMin || filters.heightMax) {
    chips.push({ key: "heightMin", label: `Altezza: ${filters.heightMin || "?"}–${filters.heightMax || "?"} cm` });
  }
  if (filters.weightMin || filters.weightMax) {
    chips.push({ key: "weightMin", label: `Peso: ${filters.weightMin || "?"}–${filters.weightMax || "?"} kg` });
  }
  if (filters.clothingSize) chips.push({ key: "clothingSize", label: `Taglia: ${filters.clothingSize}` });
  if (filters.shoeMin || filters.shoeMax) {
    chips.push({ key: "shoeMin", label: `Scarpe: ${filters.shoeMin || "?"}–${filters.shoeMax || "?"}` });
  }
  if (filters.chestMin || filters.chestMax) {
    chips.push({ key: "chestMin", label: `Busto: ${filters.chestMin || "?"}–${filters.chestMax || "?"} cm` });
  }
  if (filters.hipsMin || filters.hipsMax) {
    chips.push({ key: "hipsMin", label: `Fianchi: ${filters.hipsMin || "?"}–${filters.hipsMax || "?"} cm` });
  }
  if (filters.skill) chips.push({ key: "skill", label: `Competenza: ${filters.skill}` });
  if (filters.language) chips.push({ key: "language", label: `Lingua: ${filters.language}` });
  if (filters.hasVat !== undefined) chips.push({ key: "hasVat", label: `P.IVA: ${filters.hasVat ? "Sì" : "No"}` });
  return chips;
};

const removeFilter = (filters: TalentFilters, key: keyof TalentFilters): TalentFilters => {
  const next = { ...filters };
  delete next[key];
  // Handle paired range keys
  const rangePairs: Record<string, string[]> = {
    ageMin: ["ageMin", "ageMax"],
    ageMax: ["ageMin", "ageMax"],
    heightMin: ["heightMin", "heightMax"],
    heightMax: ["heightMin", "heightMax"],
    weightMin: ["weightMin", "weightMax"],
    weightMax: ["weightMin", "weightMax"],
    shoeMin: ["shoeMin", "shoeMax"],
    shoeMax: ["shoeMin", "shoeMax"],
    chestMin: ["chestMin", "chestMax"],
    chestMax: ["chestMin", "chestMax"],
    hipsMin: ["hipsMin", "hipsMax"],
    hipsMax: ["hipsMin", "hipsMax"],
  };
  const pair = rangePairs[key];
  if (pair) pair.forEach((k) => delete (next as any)[k]);
  return next;
};

export const TalentResultsList = ({
  talents,
  totalCount,
  isLoading,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  onTalentClick,
  onExportCSV,
}: TalentResultsListProps) => {
  const activeChips = getActiveChips(filters);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <span className="text-sm text-muted-foreground">
          {isLoading ? "Caricamento..." : (
            <>
              <span className="font-semibold text-foreground">{talents?.length || 0}</span> talent su {totalCount}
            </>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 text-xs w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Più recenti</SelectItem>
              <SelectItem value="name-asc">Nome A-Z</SelectItem>
              <SelectItem value="name-desc">Nome Z-A</SelectItem>
              <SelectItem value="age-asc">Più giovani</SelectItem>
              <SelectItem value="age-desc">Più anziani</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onExportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b shrink-0">
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="text-xs h-6 gap-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => onFiltersChange(removeFilter(filters, chip.key))}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && talents?.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Nessun talent trovato</p>
            {activeChips.length > 0 && (
              <button
                onClick={() => onFiltersChange({})}
                className="dc-link-action text-xs mt-2"
              >
                Rimuovi tutti i filtri
              </button>
            )}
          </div>
        )}

        {!isLoading && talents && talents.length > 0 && (
          <div>
            {talents.map((talent) => (
              <TalentResultRow
                key={talent.id}
                talent={talent}
                onClick={() => onTalentClick(talent)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
