import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, MapPin, Clock, Wallet, Edit, ChevronDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { useCastingRoles } from "@/hooks/useCastingRoles";
import { useRoleTalents, type RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { AddRoleDialog } from "@/components/castings/AddRoleDialog";
import { CastingFormDialog } from "@/components/castings/CastingFormDialog";
import type { Tables } from "@/integrations/supabase/types";
import type { CastingWithRelations } from "@/hooks/useCastings";
import { useUpdateCasting, useUpdateCastingStatus, useDeleteCasting } from "@/hooks/useCastings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "@/hooks/use-toast";
import { useRoundsByRole } from "@/hooks/useRoundsByRole";
import { RoleRoundsCompartment } from "@/components/castings/rounds/RoleRoundsCompartment";
import { FavoriteCastingStar } from "@/components/castings/FavoriteCastingStar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  closed: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
};

const statusLabels: Record<string, string> = {
  draft: "Bozza",
  active: "Attivo",
  closed: "Archiviato",
};

export const OwnerCastingDetail = () => {
  const { castingId } = useParams<{ castingId: string }>();
  const navigate = useNavigate();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Tables<"casting_roles"> | null>(null);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);


  const { data: casting, isLoading: castingLoading } = useQuery({
    queryKey: ["casting-detail", castingId],
    enabled: !!castingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("castings")
        .select("*, company:companies(id, name)")
        .eq("id", castingId!)
        .single();
      if (error) throw error;
      return data as CastingWithRelations;
    },
  });

  const { data: roles = [], isLoading: rolesLoading } = useCastingRoles(castingId);
  const updateCasting = useUpdateCasting();
  const updateStatus = useUpdateCastingStatus();
  const deleteCasting = useDeleteCasting();


  const handleStatusChange = async (status: string) => {
    if (!castingId) return;
    setStatusPopoverOpen(false);
    try {
      await updateStatus.mutateAsync({ id: castingId, status });
      toast({ title: "Stato aggiornato" });
    } catch {
      toast({ title: "Errore", description: "Impossibile aggiornare lo stato", variant: "destructive" });
    }
  };

  const roleIds = roles.map((r) => r.id);
  const { data: allRoleTalents = [] } = useQuery({
    queryKey: ["all-role-talents", castingId, roleIds],
    enabled: roleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_talents")
        .select(`
          *,
          profile:profiles!role_talents_profile_id_fkey(
            id, first_name, last_name, profile_photo_url, birth_date, city, gender
          )
        `)
        .in("casting_role_id", roleIds);
      if (error) throw error;
      return data as RoleTalentWithProfile[];
    },
  });

  const confirmedByRole: Record<string, number> = {};
  for (const rt of allRoleTalents) {
    if ((rt as any).company_status === "confirmed") {
      confirmedByRole[rt.casting_role_id] = (confirmedByRole[rt.casting_role_id] || 0) + 1;
    }
  }

  const handleEditRole = (role: Tables<"casting_roles">) => {
    setEditingRole(role);
    setRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = (open: boolean) => {
    setRoleDialogOpen(open);
    if (!open) setEditingRole(null);
  };

  const handleEditCastingSubmit = async (data: Record<string, unknown>) => {
    if (!castingId) return;
    try {
      await updateCasting.mutateAsync({
        id: castingId,
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
      });
      toast({ title: "Casting aggiornato" });
      setEditDialogOpen(false);
    } catch {
      toast({ title: "Errore", description: "Impossibile aggiornare il casting", variant: "destructive" });
    }
  };

  if (castingLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!casting) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Casting non trovato</p>
        <Button variant="link" onClick={() => navigate("/owner/castings")}>
          Torna alla lista
        </Button>
      </div>
    );
  }

  const formatDates = () => {
    if (!casting.start_date && !casting.end_date) return null;
    const start = casting.start_date ? format(new Date(casting.start_date), "d MMM", { locale: itLocale }) : "";
    const end = casting.end_date ? format(new Date(casting.end_date), "d MMM yyyy", { locale: itLocale }) : "";
    if (start && end) return `${start} - ${end}`;
    return start || end;
  };

  const currentStatus = casting.status || "draft";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/owner/castings")} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Tutti i casting
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <FavoriteCastingStar
              castingId={casting.id}
              isFavorite={Boolean((casting as any).is_favorite)}
              size={22}
            />
            <h1 className="font-display uppercase text-3xl tracking-wide text-foreground">
              {casting.title}
            </h1>
          </div>

          {casting.description && (
            <p className="text-sm text-muted-foreground max-w-3xl whitespace-pre-wrap">
              {casting.description}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80",
                    statusStyles[currentStatus],
                  )}
                >
                  {statusLabels[currentStatus]}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-40 p-1">
                {(["draft", "active", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors",
                      currentStatus === s && "font-medium",
                    )}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {casting.company && <span>{casting.company.name}</span>}

            {casting.compensation_amount && (
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                {casting.compensation_amount} {casting.currency || "EUR"}
              </span>
            )}
            {casting.locations && casting.locations.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {casting.locations.join(", ")}
              </span>
            )}
            {formatDates() && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDates()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="md" iconPosition="left" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
          <Button size="md" iconPosition="left" onClick={() => setRoleDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuovo ruolo
          </Button>
        </div>
      </div>

      <div className="border-t border-border" />


      {/* RUOLI */}
      <div className="space-y-4">
        <h2 className="font-display uppercase tracking-widest text-sm text-muted-foreground">
          Ruoli
        </h2>

        {rolesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : roles.length === 0 ? (
          <div className="dc-card p-10 text-center text-muted-foreground">
            <p>Nessun ruolo definito</p>
            <Button variant="secondary" size="md" className="mt-4" onClick={() => setRoleDialogOpen(true)}>
              Crea il primo ruolo
            </Button>
          </div>
        ) : (
          <RoundsByRoleBlock
            castingId={castingId!}
            roles={roles}
            confirmedByRole={confirmedByRole}
            onEditRole={handleEditRole}
          />
        )}
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={() => setConfirmDeleteOpen(true)}
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--destructive))] underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
          Elimina casting
        </button>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-widest">
              Eliminare il casting?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Il casting "{casting.title}" e tutti i ruoli/invii associati verranno eliminati.
              Operazione irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-[hsl(var(--destructive))] hover:opacity-90 text-white"
              disabled={deleteCasting.isPending}
              onClick={async (e) => {
                e.preventDefault();
                if (!castingId) return;
                try {
                  await deleteCasting.mutateAsync(castingId);
                  toast({ title: "Casting eliminato" });
                  navigate("/owner/castings");
                } catch (err: any) {
                  toast({ title: "Errore", description: err?.message, variant: "destructive" });
                }
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <AddRoleDialog
        open={roleDialogOpen}
        onOpenChange={handleCloseRoleDialog}
        castingId={castingId!}
        editRole={editingRole}
      />

      <CastingFormDialog
        casting={casting}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditCastingSubmit}
        isSubmitting={updateCasting.isPending}
      />
    </div>
  );
};

interface RoundsByRoleBlockProps {
  castingId: string;
  roles: Tables<"casting_roles">[];
  confirmedByRole: Record<string, number>;
  onEditRole: (role: Tables<"casting_roles">) => void;
}

const RoundsByRoleBlock = ({ castingId, roles, confirmedByRole, onEditRole }: RoundsByRoleBlockProps) => {
  const { data: roundsMap } = useRoundsByRole(castingId);
  if (roles.length === 0) return null;
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <RoleRoundsCompartment
          key={role.id}
          role={role as any}
          castingId={castingId}
          rounds={roundsMap?.get(role.id) ?? []}
          confirmedCount={confirmedByRole[role.id] || 0}
          onEditRole={onEditRole}
        />
      ))}
    </div>
  );
};

export default OwnerCastingDetail;
