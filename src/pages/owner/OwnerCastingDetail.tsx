import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Plus, MapPin, Calendar, Euro, Edit } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { useCastingRoles } from "@/hooks/useCastingRoles";
import { useRoleTalents, type RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { AddRoleDialog } from "@/components/castings/AddRoleDialog";
import { CastingFormDialog } from "@/components/castings/CastingFormDialog";
import type { Tables } from "@/integrations/supabase/types";
import type { CastingWithRelations } from "@/hooks/useCastings";
import { useUpdateCasting, useUpdateCastingStatus } from "@/hooks/useCastings";
import { toast } from "@/hooks/use-toast";
import { useRoundsByRole } from "@/hooks/useRoundsByRole";
import { RoleRoundsCompartment } from "@/components/castings/rounds/RoleRoundsCompartment";
import { FavoriteCastingStar } from "@/components/castings/FavoriteCastingStar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  draft: "bg-[#333333]/10 text-[#333333]",
  active: "bg-[#729128]/15 text-[#729128]",
  closed: "bg-[#A30A2B]/15 text-[#A30A2B]",
};

const statusLabels: Record<string, string> = {
  draft: "Bozza",
  active: "Attivo",
  closed: "Archiviato",
};

function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const OwnerCastingDetail = () => {
  const { castingId } = useParams<{ castingId: string }>();
  const navigate = useNavigate();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Tables<"casting_roles"> | null>(null);

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

  const handleStatusChange = async (status: string) => {
    if (!castingId) return;
    try {
      await updateStatus.mutateAsync({ id: castingId, status });
      toast({ title: "Stato aggiornato" });
    } catch {
      toast({ title: "Errore", description: "Impossibile aggiornare lo stato", variant: "destructive" });
    }
  };

  // Fetch all role talents across all roles for confirmed section
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

  // Count confirmed per role
  const confirmedByRole: Record<string, number> = {};
  for (const rt of allRoleTalents) {
    if ((rt as any).company_status === "confirmed") {
      confirmedByRole[rt.casting_role_id] = (confirmedByRole[rt.casting_role_id] || 0) + 1;
    }
  }

  // Aggregate confirmed talents for the bottom section
  const confirmedTalents = allRoleTalents.filter((rt) => (rt as any).company_status === "confirmed");
  const confirmedWithRole = confirmedTalents.map((rt) => ({
    ...rt,
    roleName: roles.find((r) => r.id === rt.casting_role_id)?.name || "—",
  }));

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

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back + Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/owner/castings")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tutti i casting
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FavoriteCastingStar
                castingId={casting.id}
                isFavorite={Boolean((casting as any).is_favorite)}
                size={22}
              />
              <h1 className="text-2xl text-foreground">{casting.title}</h1>
              <Badge className={statusColors[casting.status || "draft"]}>
                {statusLabels[casting.status || "draft"]}
              </Badge>
            </div>
            {casting.company && (
              <p className="text-muted-foreground">{casting.company.name}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {casting.locations && casting.locations.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {casting.locations.join(", ")}
                </span>
              )}
              {formatDates() && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDates()}
                </span>
              )}
              {casting.compensation_amount && (
                <span className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  {casting.compensation_amount} {casting.currency || "EUR"}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
            <Button onClick={() => setRoleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo ruolo
            </Button>
          </div>
        </div>
      </div>

      {/* Ruoli e invii */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Ruoli e invii ({roles.length})</h2>
        </div>

        {rolesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : roles.length === 0 ? (
          <div className="dc-card p-10 text-center text-muted-foreground">
            <p>Nessun ruolo definito</p>
            <Button variant="link" onClick={() => setRoleDialogOpen(true)}>
              Crea il primo ruolo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <RoundsByRoleBlock
              castingId={castingId!}
              roles={roles}
              confirmedByRole={confirmedByRole}
              onEditRole={handleEditRole}
            />
            <Button variant="outline" onClick={() => setRoleDialogOpen(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi ruolo
            </Button>
          </div>
        )}
      </div>




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
