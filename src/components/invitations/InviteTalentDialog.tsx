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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { useCreateInvitation } from "@/hooks/useCastingInvitations";
import { useCastings } from "@/hooks/useCastings";

interface InviteTalentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talentUserId: string;
  talentName: string;
}

export const InviteTalentDialog = ({
  open,
  onOpenChange,
  talentUserId,
  talentName,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invita {talentName}</DialogTitle>
          <DialogDescription>
            Seleziona un casting attivo per invitare questo talent a candidarsi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="casting">Casting *</Label>
            <Select value={selectedCastingId} onValueChange={setSelectedCastingId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un casting..." />
              </SelectTrigger>
              <SelectContent>
                {castingsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : castings && castings.length > 0 ? (
                  castings.map((casting) => (
                    <SelectItem key={casting.id} value={casting.id}>
                      {casting.title}
                      {casting.company && ` - ${casting.company.name}`}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Nessun casting attivo disponibile
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Messaggio (opzionale)</Label>
            <Textarea
              id="message"
              placeholder="Aggiungi un messaggio personalizzato..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
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
