import { useState } from "react";
import { it } from "@/lib/i18n";
import { useTalents, useTalentFilterOptions, TalentFilters, TalentWithAttributes } from "@/hooks/useTalents";
import { TalentFiltersComponent } from "@/components/talents/TalentFilters";
import { TalentCard } from "@/components/talents/TalentCard";
import { TalentDetailDialog } from "@/components/talents/TalentDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export const OwnerTalents = () => {
  const [filters, setFilters] = useState<TalentFilters>({});
  const [selectedTalent, setSelectedTalent] = useState<TalentWithAttributes | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: talents, isLoading } = useTalents(filters);
  const { data: filterOptions } = useTalentFilterOptions();

  const defaultOptions = {
    cities: [],
    genders: [],
    categories: [],
    skills: [],
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">
            {it.backoffice.talentDatabase}
          </h1>
          <p className="text-muted-foreground mt-1">
            Cerca e gestisci i talenti registrati
          </p>
        </div>
      </div>

      {/* Filters */}
      <TalentFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        options={filterOptions || defaultOptions}
      />

      {/* Results count */}
      {!isLoading && talents && (
        <p className="text-sm text-muted-foreground">
          {talents.length} {talents.length === 1 ? "talent trovato" : "talents trovati"}
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && talents?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nessun talent trovato
          </h3>
          <p className="text-muted-foreground">
            {filters.search || filters.city || filters.category || filters.gender
              ? "Prova a modificare i filtri di ricerca"
              : "I talent appariranno qui dopo aver completato l'onboarding"}
          </p>
        </div>
      )}

      {/* Talent grid */}
      {!isLoading && talents && talents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {talents.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              onClick={() => {
                setSelectedTalent(talent);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Talent detail modal */}
      <TalentDetailDialog
        talent={selectedTalent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default OwnerTalents;
