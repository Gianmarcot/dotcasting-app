import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { it } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { CastingRow } from "@/components/castings/CastingRow";
import { CastingFilters } from "@/components/castings/CastingFilters";
import { CastingFormDialog } from "@/components/castings/CastingFormDialog";
import { DeleteCastingDialog } from "@/components/castings/DeleteCastingDialog";

import {
  useCastings,
  useCreateCasting,
  useUpdateCasting,
  useDeleteCasting,
  type CastingWithRelations,
  type CastingSort,
} from "@/hooks/useCastings";

export const OwnerCastings = () => {
  const [searchParams] = useSearchParams();
  const favoritesOnly = searchParams.get("favorites") === "1";
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [sort, setSort] = useState<CastingSort>("recent");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState<CastingWithRelations | null>(null);

  const { data: castingsRaw, isLoading } = useCastings({
    status: statusFilter,
    search: searchFilter,
    sort,
  });

  const castings = favoritesOnly
    ? castingsRaw?.filter((c) => Boolean((c as any).is_favorite))
    : castingsRaw;

  const createMutation = useCreateCasting();
  const updateMutation = useUpdateCasting();
  const deleteMutation = useDeleteCasting();

  const handleCreate = () => {
    setSelectedCasting(null);
    setFormOpen(true);
  };

  const handleEdit = (casting: CastingWithRelations) => {
    setSelectedCasting(casting);
    setFormOpen(true);
  };

  const handleDelete = (casting: CastingWithRelations) => {
    setSelectedCasting(casting);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      const castingData = {
        title: data.title as string,
        description: (data.description as string) || null,
        category: (data.category as string) || null,
        company_id: (data.company_id as string) || null,
        locations: data.locations
          ? (data.locations as string).split(",").map((l) => l.trim()).filter(Boolean)
          : null,
        start_date: (data.start_date as string) || null,
        end_date: (data.end_date as string) || null,
        compensation_amount: data.compensation_amount
          ? parseFloat(data.compensation_amount as string)
          : null,
        compensation_type: (data.compensation_type as string) || null,
        currency: (data.currency as string) || "EUR",
      };

      if (selectedCasting) {
        await updateMutation.mutateAsync({ id: selectedCasting.id, ...castingData });
        toast({ title: "Casting aggiornato", description: "Le modifiche sono state salvate" });
      } else {
        await createMutation.mutateAsync({ ...castingData, status: "draft" });
        toast({ title: "Casting creato", description: "Il nuovo casting è stato salvato come bozza" });
      }
      setFormOpen(false);
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile salvare il casting", variant: "destructive" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCasting) return;
    try {
      await deleteMutation.mutateAsync(selectedCasting.id);
      toast({ title: "Casting eliminato", description: "Il casting è stato eliminato con successo" });
      setDeleteOpen(false);
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile eliminare il casting", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-foreground">
          {favoritesOnly ? "Casting preferiti" : it.backoffice.castings}
        </h1>
        <Button onClick={handleCreate} size="md" iconPosition="left">
          <Plus className="h-4 w-4 mr-2" />
          {it.backoffice.createCasting}
        </Button>
      </div>

      <CastingFilters
        status={statusFilter}
        search={searchFilter}
        sort={sort}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchFilter}
        onSortChange={setSort}
      />

      <div className="dc-card overflow-hidden p-6">
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : castings && castings.length > 0 ? (
          <div>
            {/* Column header */}
            <div className="grid grid-cols-[32px_1fr_180px_140px_120px] items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
              <span />
              <span>Titolo</span>
              <span>Selezione</span>
              <span>Stato</span>
              <span />
            </div>
            {castings.map((casting) => (
              <CastingRow
                key={casting.id}
                casting={casting}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessun casting trovato</p>
            <Button variant="secondary" size="md" onClick={handleCreate} className="mt-4">
              Crea il tuo primo casting
            </Button>
          </div>
        )}
      </div>

      <CastingFormDialog
        casting={selectedCasting}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteCastingDialog
        casting={selectedCasting}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default OwnerCastings;
