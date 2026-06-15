import { useState, useMemo, useEffect } from "react";
import { it } from "@/lib/i18n";
import { useTalents, useTalentCount, TalentFilters, TalentWithAttributes } from "@/hooks/useTalents";
import { TalentFilterBar } from "@/components/talents/TalentFilterBar";
import { TalentBoardGrid } from "@/components/talents/TalentBoardGrid";
import { TalentPortfolioList } from "@/components/talents/TalentPortfolioList";
import { TalentDetailDialog } from "@/components/talents/TalentDetailDialog";
import { CreateTalentDialog } from "@/components/talents/CreateTalentDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserPlus, X, LayoutGrid, List } from "lucide-react";

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
    console.log("[OwnerTalents] onSelectTalent", talent.id, talent);
    setSelectedTalent(talent);
    setDialogOpen(true);
  };

  const { data: talents, isLoading } = useTalents(filters);
  const { data: totalCount } = useTalentCount();

  // Active filter chips (exclude search)
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

  // Sort talents
  const sortedTalents = useMemo(() => {
    if (!talents) return [];
    const arr = [...talents];
    if (sortBy === "name") {
      arr.sort((a, b) =>
        (a.first_name || "").localeCompare(b.first_name || "")
      );
    }
    // "recent" is default from DB order
    return arr;
  }, [talents, sortBy]);

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">
            {it.backoffice.talentDatabase}
          </h1>
          <p className="text-muted-foreground mt-1">
            Cerca e gestisci i talenti registrati
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuovo Talent
        </Button>
      </div>

      {/* Filters bar */}
      <TalentFilterBar filters={filters} onFiltersChange={setFilters} />

      <div className="mt-6">
        <div className="flex-1 min-w-0">
          {/* Top bar: count + sort + view toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Caricamento..."
                : `${talents?.length || 0} talent trovati${totalCount ? ` su ${totalCount}` : ""}`}
            </p>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
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
                className="h-9"
              >
                <ToggleGroupItem value="board" aria-label="Vista Board" className="h-9 w-9 p-0">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="portfolio" aria-label="Vista Portfolio" className="h-9 w-9 p-0">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>


          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer"
                  onClick={() => removeFilter(chip.key)}
                >
                  {chip.label}: {chip.value}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[140px] rounded-lg" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && sortedTalents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nessun talent trovato
              </h3>
              <p className="text-muted-foreground">
                {activeChips.length > 0 || filters.search
                  ? "Prova a modificare i filtri di ricerca"
                  : "I talent appariranno qui dopo aver completato l'onboarding"}
              </p>
            </div>
          )}

          {/* Talent views */}
          {!isLoading && sortedTalents.length > 0 && (
            viewMode === "board" ? (
              <TalentBoardGrid talents={sortedTalents} onSelectTalent={handleSelectTalent} />
            ) : (
              <TalentPortfolioList talents={sortedTalents} onSelectTalent={handleSelectTalent} />
            )
          )}

        </div>
      </div>

      <TalentDetailDialog
        talent={selectedTalent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <CreateTalentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default OwnerTalents;
