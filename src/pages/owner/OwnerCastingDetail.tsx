import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RoleCard, type RoleCounts } from "@/components/castings/rounds/RoleCard";
import { FavoriteCastingStar } from "@/components/castings/FavoriteCastingStar";
import { CastingDetailsPanel } from "@/components/castings/CastingDetailsPanel";
import { CastingSidePanel } from "@/components/castings/CastingSidePanel";

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

  const countsByRole: Record<string, RoleCounts> = {};
  for (const rt of allRoleTalents) {
    const c = (countsByRole[rt.casting_role_id] ??= { total: 0, confirmed: 0, published: 0 });
    c.total += 1;
    if ((rt as any).company_status === "confirmed") c.confirmed += 1;
    if ((rt as any).published_to_talent === true) c.published += 1;
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
        call_datetime: data.call_datetime
          ? new Date(data.call_datetime as string).toISOString()
          : null,
        venue_name: (data.venue_name as string) || null,
        venue_address: (data.venue_address as string) || null,
        talent_instructions: (data.talent_instructions as string) || null,
        show_client_to_talent: !!data.show_client_to_talent,
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

  const panelProps = {
    casting,
    onStatusChange: handleStatusChange,
    onEdit: () => setEditDialogOpen(true),
    onDelete: () => setConfirmDeleteOpen(true),
  };

  return (
    <div className="animate-fade-up md:-mt-16 md:-mb-8">
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-8 md:pt-16">
          {/* Intestazione */}
          <div className="space-y-6">
            <button type="button" onClick={() => navigate("/owner/castings")} className="dc-link-action">
              <ArrowLeft className="h-5 w-5" />
              Tutti i casting
            </button>
            <div className="flex items-center gap-3">
              <FavoriteCastingStar
                castingId={casting.id}
                isFavorite={Boolean((casting as any).is_favorite)}
                size={16}
              />
              <h1 className="font-display text-[21px] uppercase text-foreground">{casting.title}</h1>
            </div>
          </div>

          {/* Dettagli su telefono */}
          <div className="rounded-3xl bg-cream-dark p-8 md:hidden">
            <CastingDetailsPanel {...panelProps} />
          </div>

          {/* RUOLI */}
          <div className="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="font-display text-base uppercase text-foreground">Ruoli</h2>
            {rolesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            ) : roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun ruolo definito</p>
            ) : (
              <RoundsByRoleBlock
                castingId={castingId!}
                roles={roles}
                countsByRole={countsByRole}
                onEditRole={handleEditRole}
              />
            )}
            <button
              type="button"
              onClick={() => setRoleDialogOpen(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent text-[15px] font-medium text-foreground"
            >
              <Plus className="h-5 w-5" />
              {roles.length === 0 ? "Crea il primo ruolo" : "Aggiungi ruolo"}
            </button>
          </div>
        </div>

        <CastingSidePanel>
          <CastingDetailsPanel {...panelProps} className="h-full" />
        </CastingSidePanel>
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
  countsByRole: Record<string, RoleCounts>;
  onEditRole: (role: Tables<"casting_roles">) => void;
}

const RoundsByRoleBlock = ({ castingId, roles, countsByRole, onEditRole }: RoundsByRoleBlockProps) => {
  const { data: roundsMap } = useRoundsByRole(castingId);
  if (roles.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          castingId={castingId}
          counts={countsByRole[role.id] ?? { total: 0, confirmed: 0, published: 0 }}
          roundsCount={roundsMap?.get(role.id)?.length ?? 0}
          onEditRole={onEditRole}
        />
      ))}
    </div>
  );
};

export default OwnerCastingDetail;
