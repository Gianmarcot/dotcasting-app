import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreVertical, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CastingRole } from "@/hooks/useCastingRoles";
import { useDeleteCastingRole } from "@/hooks/useCastingRoles";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { useRoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { RoundFolderCard } from "./RoundFolderCard";
import { RoundWizardDialog } from "./RoundWizardDialog";

interface Props {
  role: CastingRole;
  castingId: string;
  rounds: CastingRound[];
  confirmedCount: number;
  onEditRole: (role: Tables<"casting_roles">) => void;
}

export const RoleRoundsCompartment = ({
  role,
  castingId,
  rounds,
  confirmedCount,
  onEditRole,
}: Props) => {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const deleteMutation = useDeleteCastingRole();

  const roundIds = useMemo(() => rounds.map((r) => r.id), [rounds]);
  const { data: previews } = useRoundPreviewPhotos(roundIds);

  const total = role.role_talents_count ?? 0;
  const openRole = () => navigate(`/owner/castings/${castingId}/${role.id}`);

  const specs = [
    role.gender,
    role.age_min && role.age_max ? `${role.age_min}-${role.age_max} anni` : null,
    role.budget ? `€${role.budget}` : null,
    role.location,
  ].filter(Boolean);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync({ id: role.id, castingId });
      toast({ title: "Ruolo eliminato" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="dc-card p-5 space-y-4">
      {/* Header ruolo (cliccabile) */}
      <div
        role="button"
        tabIndex={0}
        onClick={openRole}
        onKeyDown={(e) => e.key === "Enter" && openRole()}
        className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 cursor-pointer group"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {role.name}
            </h3>
            <Badge
              className={
                confirmedCount > 0
                  ? "bg-[#729128]/15 text-[#729128]"
                  : "bg-[#333333]/10 text-[#333333]"
              }
            >
              Confermati {confirmedCount}/{total}
            </Badge>
          </div>
          {specs.length > 0 && (
            <p className="text-sm text-muted-foreground">{specs.join(" · ")}</p>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={stop}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={stop}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={stop}>
              <DropdownMenuItem onClick={openRole}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Apri dettaglio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditRole(role)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica ruolo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo invio
          </Button>
        </div>
      </div>

      <div className="border-t border-border/60" />

      {/* Griglia invii — 1/2/3 colonne, cella "Aggiungi" inline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...rounds]
          .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
          .map((r) => (
            <RoundFolderCard
              key={r.id}
              round={r}
              castingId={castingId}
              preview={previews?.get(r.id)}
            />
          ))}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-44 rounded-2xl border-2 border-dashed border-border bg-transparent hover:bg-muted/30 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">
            {rounds.length === 0 ? "Crea il primo invio" : "Aggiungi invio"}
          </span>
        </button>
      </div>


      <RoundWizardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        castingId={castingId}
        roleId={role.id}
        roleName={role.name}
        defaultRoundNumber={rounds.length + 1}
      />
    </div>
  );
};
