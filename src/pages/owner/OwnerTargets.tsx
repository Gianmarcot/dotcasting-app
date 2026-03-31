import { useState } from "react";
import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Plus, FolderOpen } from "lucide-react";
import { useCastings } from "@/hooks/useCastings";
import { useTargets, type CastingTarget } from "@/hooks/useTargets";
import { TargetCard } from "@/components/targets/TargetCard";
import { CreateTargetDialog } from "@/components/targets/CreateTargetDialog";
import { TargetMatchResults } from "@/components/targets/TargetMatchResults";
import { TargetShortlist } from "@/components/targets/TargetShortlist";

export const OwnerTargets = () => {
  const [selectedCastingId, setSelectedCastingId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<CastingTarget | null>(null);
  const [matchesTarget, setMatchesTarget] = useState<CastingTarget | null>(null);
  const [shortlistTarget, setShortlistTarget] = useState<CastingTarget | null>(null);

  // Fetch castings (non-draft)
  const { data: castings = [], isLoading: castingsLoading } = useCastings();
  const activeCastings = castings.filter(c => c.status !== "closed");

  // Fetch targets for selected casting
  const { data: targets = [], isLoading: targetsLoading } = useTargets(selectedCastingId);

  const selectedCasting = castings.find(c => c.id === selectedCastingId);

  const handleEditTarget = (target: CastingTarget) => {
    setEditingTarget(target);
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setEditingTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl text-foreground">{it.backoffice.targets}</h1>
        <p className="text-muted-foreground mt-1">
          Crea target di ricerca e gestisci le shortlist per i tuoi casting
        </p>
      </div>

      {/* Casting Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Seleziona un casting
              </label>
              {castingsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedCastingId || ""}
                  onValueChange={(value) => setSelectedCastingId(value || null)}
                >
                  <SelectTrigger className="w-full sm:max-w-md">
                    <SelectValue placeholder="Scegli un casting..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCastings.map((casting) => (
                      <SelectItem key={casting.id} value={casting.id}>
                        {casting.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedCastingId && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Target
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Targets List */}
      {!selectedCastingId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Seleziona un casting per visualizzare e gestire i target
            </p>
          </CardContent>
        </Card>
      ) : targetsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : targets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nessun target per "{selectedCasting?.title}"
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crea il primo target
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Target per "{selectedCasting?.title}"
            </h2>
            <span className="text-sm text-muted-foreground">
              {targets.length} target
            </span>
          </div>
          {targets.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onEdit={handleEditTarget}
              onViewMatches={setMatchesTarget}
              onViewShortlist={setShortlistTarget}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {selectedCastingId && selectedCasting && (
        <CreateTargetDialog
          open={createDialogOpen}
          onOpenChange={handleCloseCreateDialog}
          castingId={selectedCastingId}
          castingTitle={selectedCasting.title}
          editTarget={editingTarget}
        />
      )}

      <TargetMatchResults
        open={!!matchesTarget}
        onOpenChange={(open) => !open && setMatchesTarget(null)}
        target={matchesTarget}
      />

      <TargetShortlist
        open={!!shortlistTarget}
        onOpenChange={(open) => !open && setShortlistTarget(null)}
        target={shortlistTarget}
      />
    </div>
  );
};

export default OwnerTargets;
