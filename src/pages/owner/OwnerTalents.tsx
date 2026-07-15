import { useState, useMemo, useEffect } from "react";
import { it } from "@/lib/i18n";
import { useTalents, useTalentCount, TalentFilters, TalentWithAttributes } from "@/hooks/useTalents";
import { TalentFilterBar } from "@/components/talents/TalentFilterBar";
import { TalentBoardGrid } from "@/components/talents/TalentBoardGrid";
import { TalentPortfolioList } from "@/components/talents/TalentPortfolioList";
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import { CreateTalentDialog } from "@/components/talents/CreateTalentDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserPlus, X, LayoutGrid, List, Search } from "lucide-react";

type ViewMode = "board" | "portfolio";
const VIEW_STORAGE_KEY = "owner-talents-view-mode";

// Human-readable labels for filter chips
const FILTER_LABELS: Record<string, string> = {
  talentRole: "Ruolo",
  availability: "Disponibilità",
  gender: "Sesso",
  ageMin: "Età min",
  ageMax: "Età max",
  city: "Città",
  region: "Regione",
  genderIdentity: "Identità genere",
  representationType: "Rappresentanza",
  nationality: "Nazionalità",
  ethnicity: "Carnagione",
  eyeColor: "Occhi",
  hairColor: "Capelli",
  hairLength: "Lunghezza capelli",
  heightMin: "Alt. min",
  heightMax: "Alt. max",
  weightMin: "Peso min",
  weightMax: "Peso max",
  shirtSize: "Taglia",
  shoeMin: "Scarpe min",
  shoeMax: "Scarpe max",
  chestMin: "Busto min",
  chestMax: "Busto max",
  hipsMin: "Fianchi min",
  hipsMax: "Fianchi max",
  skillSearch: "Competenza",
  language: "Lingua",
  hasVat: "P.IVA",
  travelAvailability: "Viaggi",
  category: "Categoria",
};

export const OwnerTalents = () => {
  const [filters, setFilters] = useState<TalentFilters>({});
  const [selectedTalent, setSelectedTalent] = useState<TalentWithAttributes | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "board";
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return saved === "portfolio" ? "portfolio" : "board";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {}
  }, [viewMode]);

  const handleSelectTalent = (talent: TalentWithAttributes) => {
    setSelectedTalent(talent);
    setDialogOpen(true);
  };

  const { data: talents, isLoading } = useTalents(filters);
  const { data: totalCount } = useTalentCount();

  const activeChips = useMemo(() => {
    return Object.entries(filters)
      .filter(([k, v]) => k !== "search" && v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => ({
        key: k,
        label: FILTER_LABELS[k] || k,
        value: typeof v === "boolean" ? (v ? "Sì" : "No") : String(v),
      }));
  }, [filters]);

  const removeFilter = (key: string) => {
    const next = { ...filters };
    delete (next as any)[key];
    setFilters(next);
  };

  const sortedTalents = useMemo(() => {
    if (!talents) return [];
    const arr = [...talents];
    if (sortBy === "name") {
      arr.sort((a, b) => (a.first_name || "").localeCompare(b.first_name || ""));
    }
    return arr;
  }, [talents, sortBy]);

  const count = sortedTalents.length;
  const countLabel = isLoading
    ? "Caricamento..."
    : `${count} ${count === 1 ? "talent" : "talent"} trovat${count === 1 ? "o" : "i"}${
        totalCount ? ` su ${totalCount}` : ""
      }`;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-foreground">{it.backoffice.talentDatabase}</h1>
        <Button size="md" iconPosition="left" onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="h-5 w-5" />
          Nuovo talent
        </Button>
      </div>

      {/* Toolbar: search left, count + sort + view right */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative w-full sm:max-w-[450px] sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            className="pl-10 rounded-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          <span className="text-sm text-muted-foreground whitespace-nowrap">{countLabel}</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-52 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Più recenti</SelectItem>
              <SelectItem value="name">Nome A–Z</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
            className="gap-1"
          >
            <ToggleGroupItem value="board" aria-label="Vista Board" className="h-12 w-12 p-0 rounded-full">
              <LayoutGrid className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="portfolio" aria-label="Vista Portfolio" className="h-12 w-12 p-0 rounded-full">
              <List className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Filters row */}
      <TalentFilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer"
              onClick={() => removeFilter(chip.key)}
            >
              {chip.label}: {chip.value}
              <X className="h-4 w-4 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      <div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-lg" />
            ))}
          </div>
        ) : sortedTalents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-5 w-5 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nessun talent trovato</h3>
            <p className="text-muted-foreground mb-4">
              {activeChips.length > 0 || filters.search
                ? "Prova a modificare i filtri di ricerca"
                : "I talent appariranno qui dopo aver completato l'onboarding"}
            </p>
            {activeChips.length === 0 && !filters.search && (
              <Button variant="secondary" size="md" onClick={() => setCreateDialogOpen(true)}>
                Nuovo talent
              </Button>
            )}
          </div>
        ) : viewMode === "board" ? (
          <TalentBoardGrid talents={sortedTalents} onSelectTalent={handleSelectTalent} />
        ) : (
          <TalentPortfolioList talents={sortedTalents} onSelectTalent={handleSelectTalent} />
        )}
      </div>

      <TalentPreviewDrawer
        talent={selectedTalent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <CreateTalentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};

export default OwnerTalents;
