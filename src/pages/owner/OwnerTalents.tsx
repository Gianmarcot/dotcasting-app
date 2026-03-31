import { useState, useMemo } from "react";
import { it } from "@/lib/i18n";
import { useTalents, useTalentCount, TalentFilters, TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import { TalentFilterPanel } from "@/components/talents/TalentFilterPanel";
import { TalentResultsList } from "@/components/talents/TalentResultsList";
import { TalentDetailDialog } from "@/components/talents/TalentDetailDialog";
import { CreateTalentDialog } from "@/components/talents/CreateTalentDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const OwnerTalents = () => {
  const [filters, setFilters] = useState<TalentFilters>({});
  const [selectedTalent, setSelectedTalent] = useState<TalentWithAttributes | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  const { data: talents, isLoading } = useTalents(filters);
  const { data: totalCount } = useTalentCount();

  // Sort talents
  const sortedTalents = useMemo(() => {
    if (!talents) return undefined;
    const sorted = [...talents];
    switch (sortBy) {
      case "name-asc":
        sorted.sort((a, b) => (a.first_name || "").localeCompare(b.first_name || ""));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.first_name || "").localeCompare(a.first_name || ""));
        break;
      case "age-asc":
        sorted.sort((a, b) => (calculateAge(a.birth_date) || 99) - (calculateAge(b.birth_date) || 99));
        break;
      case "age-desc":
        sorted.sort((a, b) => (calculateAge(b.birth_date) || 0) - (calculateAge(a.birth_date) || 0));
        break;
      default: // recent - already sorted by created_at desc
        break;
    }
    return sorted;
  }, [talents, sortBy]);

  const exportCSV = () => {
    if (!sortedTalents?.length) return;
    const headers = ["Nome", "Cognome", "Età", "Città", "Sesso", "Categorie", "Altezza", "Peso"];
    const rows = sortedTalents.map((t) => [
      t.first_name || "",
      t.last_name || "",
      calculateAge(t.birth_date)?.toString() || "",
      t.city || "",
      t.gender || "",
      (t.talent_categories || []).join("; "),
      t.attributes?.height?.toString() || "",
      t.attributes?.weight?.toString() || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "talent_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col -m-4 md:-m-8 md:-mt-16">
      {/* Top header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {it.backoffice.talentDatabase}
          </h1>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuovo Talent
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Filter panel (hidden on mobile) */}
        <div className="hidden md:block">
          <TalentFilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Right: Results */}
        <TalentResultsList
          talents={sortedTalents}
          totalCount={totalCount || 0}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onTalentClick={(talent) => {
            setSelectedTalent(talent);
            setDialogOpen(true);
          }}
          onExportCSV={exportCSV}
        />
      </div>

      {/* Dialogs */}
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
