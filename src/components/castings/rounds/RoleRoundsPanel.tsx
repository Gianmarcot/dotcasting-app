import { Button } from "@/components/ui/button";
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

/** Scheda "Selezioni" del dettaglio ruolo: elenco selezioni in sola lettura + creazione. */
export const RoleRoundsPanel = ({ castingId, roleId, roleName, rounds }: Props) => {
  const [createOpen, setCreateOpen] = useState(false);
  const roundIds = useMemo(() => rounds.map((r) => r.id), [rounds]);
  const { data: previews } = useRoundPreviewPhotos(roundIds);

  const sortedRounds = [...rounds].sort(
    (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
  );

  return (
    <div>
      <div className="mb-4 flex min-h-12 flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base uppercase text-foreground">Selezioni</h2>
        <Button variant="secondary" size="md" iconPosition="left" onClick={() => setCreateOpen(true)}>
          <Plus />
          Nuova selezione
        </Button>
      </div>
      {sortedRounds.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          <p>Nessuna selezione</p>
        </div>
      )}
      {sortedRounds.map((r) => (
        <RoleRoundRow
          key={r.id}
          round={r}
          castingId={castingId}
          preview={previews?.get(r.id)}
          hideRoleName
        />
      ))}


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
