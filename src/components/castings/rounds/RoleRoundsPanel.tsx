import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { useRoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";
import { RoleRoundRow } from "./RoleRoundRow";
import { RoundWizardDialog } from "./RoundWizardDialog";

interface Props {
  castingId: string;
  roleId: string;
  roleName: string;
  rounds: CastingRound[];
}

/** Scheda "Selezioni" del dettaglio ruolo: elenco invii in sola lettura + creazione. */
export const RoleRoundsPanel = ({ castingId, roleId, roleName, rounds }: Props) => {
  const [createOpen, setCreateOpen] = useState(false);
  const roundIds = useMemo(() => rounds.map((r) => r.id), [rounds]);
  const { data: previews } = useRoundPreviewPhotos(roundIds);

  const sortedRounds = [...rounds].sort(
    (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
  );

  return (
    <div>
      {sortedRounds.map((r) => (
        <RoleRoundRow
          key={r.id}
          round={r}
          castingId={castingId}
          preview={previews?.get(r.id)}
          hideRoleName
        />
      ))}

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="mt-3 w-full h-14 rounded-2xl border-2 border-dashed border-border bg-transparent hover:bg-muted/30 hover:border-[#1a1a1a] transition-colors flex items-center justify-center gap-2 text-muted-foreground"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">
          {sortedRounds.length === 0 ? "Crea la prima selezione" : "Nuova selezione"}
        </span>
      </button>

      <p className="mt-4 text-sm text-muted-foreground opacity-70">
        Il cliente consulta le selezioni in sola lettura: registra il suo riscontro escludendo dal ruolo chi non va bene.
      </p>

      <RoundWizardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        castingId={castingId}
        roleId={roleId}
        roleName={roleName}
        defaultRoundNumber={rounds.length + 1}
      />
    </div>
  );
};
