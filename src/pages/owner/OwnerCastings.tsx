import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { it } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { CastingRow } from "@/components/castings/CastingRow";
import { CastingFilters, type CastingSort } from "@/components/castings/CastingFilters";
import { CastingFormDialog } from "@/components/castings/CastingFormDialog";
import { DeleteCastingDialog } from "@/components/castings/DeleteCastingDialog";

import {
  useCastings,
  useCreateCasting,
  useUpdateCasting,
  useUpdateCastingStatus,
  useDeleteCasting,
  type CastingWithRelations,
} from "@/hooks/useCastings";

export const OwnerCastings = () => {
  const [searchParams] = useSearchParams();
  const favoritesFromUrl = searchParams.get("favorites") === "1";
  const [statusFilter, setStatusFilter] = useState(favoritesFromUrl ? "favorites" : "all");
  const [searchFilter, setSearchFilter] = useState("");
  const [sort, setSort] = useState<CastingSort>("recent");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState<CastingWithRelations | null>(null);

  const isFavoritesView = statusFilter === "favorites";

  const { data: castingsRaw, isLoading } = useCastings({
    status: isFavoritesView ? "all" : statusFilter,
    search: searchFilter,
  });

  const castings = useMemo(() => {
    let list = castingsRaw ?? [];
    if (isFavoritesView) {
      list = list.filter((c) => Boolean((c as any).is_favorite));
    }
    const sorted = [...list];
    if (sort === "company") {
      sorted.sort((a, b) =>
        (a.company?.name || "\uffff").localeCompare(b.company?.name || "\uffff", "it"),
      );
    } else if (sort === "period") {
      sorted.sort((a, b) => {
        const av = a.start_date ? new Date(a.start_date).getTime() : Number.POSITIVE_INFINITY;
        const bv = b.start_date ? new Date(b.start_date).getTime() : Number.POSITIVE_INFINITY;
        return av - bv;
      });
    }
    return sorted;
  }, [castingsRaw, isFavoritesView, sort]);

  const createMutation = useCreateCasting();
  const updateMutation = useUpdateCasting();
  const statusMutation = useUpdateCastingStatus();
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await statusMutation.mutateAsync({ id, status });
      toast({
        title: "Stato aggiornato",
        description: `Il casting è ora "${it.casting[status as keyof typeof it.casting] || status}"`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato",
        variant: "destructive",
      });
    }
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
        <div>
          <h1 className="text-2xl text-foreground">
            {isFavoritesView ? "Casting preferiti" : it.backoffice.castings}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFavoritesView
              ? "I casting che hai marcato con la stella"
              : "Gestisci i casting della piattaforma"}
          </p>
        </div>
        <Button onClick={handleCreate}>
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

      {isLoading ? (
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="h-10 bg-muted/30 border-b" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      ) : castings && castings.length > 0 ? (
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="grid grid-cols-[32px_minmax(0,1fr)_140px_200px_180px_180px_40px] items-center gap-4 px-4 py-2.5 border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground font-medium">
            <span />
            <span>Titolo</span>
            <span>Stato</span>
            <span>Cliente</span>
            <span>Location</span>
            <span>Periodo</span>
            <span />
          </div>
          <div className="divide-y divide-border/60">
            {castings.map((casting) => (
              <CastingRow
                key={casting.id}
                casting={casting}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nessun casting trovato</p>
          {!isFavoritesView && (
            <Button variant="link" onClick={handleCreate}>
              Crea il tuo primo casting
            </Button>
          )}
        </div>
      )}

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
