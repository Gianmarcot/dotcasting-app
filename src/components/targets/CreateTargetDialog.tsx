import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateTarget, useUpdateTarget, type TargetCriteria, type CastingTarget } from "@/hooks/useTargets";
import { TargetCriteriaForm } from "./TargetCriteriaForm";

interface CreateTargetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  castingId: string;
  castingTitle: string;
  editTarget?: CastingTarget | null;
}

export const CreateTargetDialog = ({
  open,
  onOpenChange,
  castingId,
  castingTitle,
  editTarget,
}: CreateTargetDialogProps) => {
  const { toast } = useToast();
  const createTarget = useCreateTarget();
  const updateTarget = useUpdateTarget();
  
  const [step, setStep] = useState<"info" | "criteria">("info");
  const [name, setName] = useState(editTarget?.name || "");
  const [description, setDescription] = useState(editTarget?.description || "");
  const [criteria, setCriteria] = useState<TargetCriteria>(editTarget?.criteria_json || {});

  const isEditing = !!editTarget;

  const handleReset = () => {
    setStep("info");
    setName(editTarget?.name || "");
    setDescription(editTarget?.description || "");
    setCriteria(editTarget?.criteria_json || {});
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleNextStep = () => {
    if (!name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del target è obbligatorio",
        variant: "destructive",
      });
      return;
    }
    setStep("criteria");
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && editTarget) {
        await updateTarget.mutateAsync({
          id: editTarget.id,
          name: name.trim(),
          description: description.trim() || undefined,
          criteria_json: criteria,
        });
        toast({
          title: "Target aggiornato",
          description: "Il target è stato modificato con successo",
        });
      } else {
        await createTarget.mutateAsync({
          casting_id: castingId,
          name: name.trim(),
          description: description.trim() || undefined,
          criteria_json: criteria,
        });
        toast({
          title: "Target creato",
          description: "Il nuovo target è stato creato con successo",
        });
      }
      handleClose();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive",
      });
    }
  };

  const isPending = createTarget.isPending || updateTarget.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Target" : "Nuovo Target"} - {castingTitle}
          </DialogTitle>
        </DialogHeader>

        {step === "info" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome del Target *</Label>
              <Input
                id="name"
                placeholder="Es. Modella 20-25 anni bionda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione (opzionale)</Label>
              <Textarea
                id="description"
                placeholder="Descrivi brevemente il profilo ideale..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <TargetCriteriaForm criteria={criteria} onChange={setCriteria} />
        )}

        <DialogFooter className="gap-2">
          {step === "criteria" && (
            <Button variant="outline" onClick={() => setStep("info")}>
              Indietro
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          {step === "info" ? (
            <Button onClick={handleNextStep}>Avanti</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Salvataggio..." : isEditing ? "Salva Modifiche" : "Crea Target"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
