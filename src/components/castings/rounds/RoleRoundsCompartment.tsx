import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CastingRole } from "@/hooks/useCastingRoles";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { useRoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";
import type { Tables } from "@/integrations/supabase/types";
import { RoleRoundRow } from "./RoleRoundRow";
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
}: Props) => {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

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

  const sortedRounds = [...rounds].sort(
    (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
  );

  return (
    <div className="dc-card p-6 space-y-5">
      {/* Header ruolo */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-display uppercase text-2xl text-foreground tracking-wide">
              {role.name}
            </h3>
            <Badge
              className={
                confirmedCount > 0
                  ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] font-semibold"
                  : "bg-muted text-muted-foreground font-semibold"
              }
            >
              {confirmedCount}/{total} approvati
            </Badge>
          </div>
          {specs.length > 0 && (
            <p className="text-sm text-muted-foreground">{specs.join(" · ")}</p>
          )}
        </div>

        <Button variant="secondary" size="md" onClick={openRole}>
          Dettagli ruolo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Tabella rounds */}
      <div>
        {sortedRounds.length > 0 && (
          <div className="grid grid-cols-[1fr_140px_1fr_140px_120px] items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/60">
            <span>Round</span>
            <span>Stato</span>
            <span>Selezione</span>
            <span>Talent</span>
            <span />
          </div>
        )}

        {sortedRounds.map((r) => (
          <RoleRoundRow
            key={r.id}
            round={r}
            castingId={castingId}
            preview={previews?.get(r.id)}
          />
        ))}

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="mt-3 w-full h-14 rounded-2xl border-2 border-dashed border-border bg-transparent hover:bg-muted/30 hover:border-primary/40 transition-colors flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">
            {sortedRounds.length === 0 ? "Crea il primo invio" : "Aggiungi invio"}
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
