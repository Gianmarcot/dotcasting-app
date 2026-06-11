import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { useCastingRounds } from "@/hooks/useCastingRounds";
import { CreateRoundDialog } from "./CreateRoundDialog";
import { RoundHistoryItem } from "./RoundHistoryItem";

interface Props {
  castingId: string;
}

export const RoundsSection = ({ castingId }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: rounds = [], isLoading } = useCastingRounds(castingId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Round ({rounds.length})
        </h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo round
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Caricamento...</p>
      ) : rounds.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border rounded-xl bg-white">
          Nessun round creato. Crea il primo round per generare le comp card PDF dei talent.
        </div>
      ) : (
        <div className="space-y-2">
          {rounds.map(r => (
            <RoundHistoryItem key={r.id} round={r} castingId={castingId} />
          ))}
        </div>
      )}

      <CreateRoundDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        castingId={castingId}
      />
    </div>
  );
};
