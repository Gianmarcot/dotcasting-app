import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { useRoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";
import { RoundFolderCard } from "./RoundFolderCard";
import { CreateRoundDialog } from "./CreateRoundDialog";

interface Props {
  role: Tables<"casting_roles">;
  castingId: string;
  rounds: CastingRound[];
  confirmedCount: number;
}

export const RoleRoundsCompartment = ({
  role,
  castingId,
  rounds,
  confirmedCount,
}: Props) => {
  const [createOpen, setCreateOpen] = useState(false);

  const roundIds = useMemo(() => rounds.map((r) => r.id), [rounds]);
  const { data: previews } = useRoundPreviewPhotos(roundIds);

  return (
    <div className="rounded-2xl border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-0.5">
          <h3 className="font-medium text-foreground">{role.name}</h3>
          <p className="text-xs text-muted-foreground">
            {confirmedCount} confermati · {rounds.length} invii
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo invio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rounds.map((r) => (
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
          <span className="text-sm">Aggiungi invio</span>
        </button>
      </div>

      <CreateRoundDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        castingId={castingId}
        roleId={role.id}
        defaultLabel={`${rounds.length + 1}° invio - ${role.name}`}
      />
    </div>
  );
};
