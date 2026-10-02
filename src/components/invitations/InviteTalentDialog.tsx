import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingSelect, FloatingTextarea } from "@/components/ui/field";
import { Loader2, Send } from "lucide-react";
import { useCreateInvitation } from "@/hooks/useCastingInvitations";
import { useCastings } from "@/hooks/useCastings";

interface InviteTalentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talentUserId: string;
  talentName: string;
  elevated?: boolean;
}

export const InviteTalentDialog = ({
  open,
  onOpenChange,
  talentUserId,
  talentName,
  elevated = false,
}: InviteTalentDialogProps) => {
  const [selectedCastingId, setSelectedCastingId] = useState<string>("");
  const [message, setMessage] = useState("");

  const { data: castings, isLoading: castingsLoading } = useCastings({
    status: "active",
  });
  const createInvitation = useCreateInvitation();

  const handleSubmit = async () => {
    if (!selectedCastingId) return;

    await createInvitation.mutateAsync({
      castingId: selectedCastingId,
      talentUserId,
      message: message || undefined,
    });

    setSelectedCastingId("");
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName={elevated ? "z-[100]" : undefined}
        className={elevated ? "z-[110] sm:max-w-md" : "sm:max-w-md"}
      >
        <DialogHeader>
          <DialogTitle>Invita {talentName}</DialogTitle>
          <DialogDescription>
            Seleziona un casting attivo per invitare questo talent a candidarsi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FloatingSelect
            label={castingsLoading ? "Caricamento casting…" : "Casting *"}
            value={selectedCastingId}
            onValueChange={setSelectedCastingId}
            disabled={castingsLoading || !castings?.length}
            options={(castings ?? []).map((casting) => ({
              value: casting.id,
              label: `${casting.title}${casting.company ? ` - ${casting.company.name}` : ""}`,
            }))}
          />

          <FloatingTextarea
            label="Messaggio (opzionale)"
            value={message}
            onChange={setMessage}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCastingId || createInvitation.isPending}
          >
            {createInvitation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Invia invito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
