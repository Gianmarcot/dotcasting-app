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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTalents } from "@/hooks/useTalents";
import { useFindOrCreateThread } from "@/hooks/useMessages";

interface NewThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThreadCreated: (threadId: string) => void;
}

export const NewThreadDialog = ({
  open,
  onOpenChange,
  onThreadCreated,
}: NewThreadDialogProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: talents = [], isLoading } = useTalents({ search });
  const findOrCreateThread = useFindOrCreateThread();

  const selectedTalent = talents.find(t => t.user_id === selectedUserId);

  const handleCreate = async () => {
    if (!selectedUserId) return;

    setIsCreating(true);
    try {
      const threadId = await findOrCreateThread(selectedUserId);
      
      // If there's an initial message, send it
      if (message.trim()) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase.from("messages").insert({
            thread_id: threadId,
            sender_user_id: user.id,
            body: message.trim(),
          });
        }
      }

      toast({
        title: "Conversazione creata",
        description: "Puoi ora iniziare a messaggiare",
      });
      
      onThreadCreated(threadId);
      handleReset();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare la conversazione",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setSelectedUserId(null);
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleReset}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova conversazione</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Cerca un talent</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome o cognome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Results */}
          {search && (
            <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : talents.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Nessun talent trovato
                </p>
              ) : (
                talents.slice(0, 10).map((talent) => {
                  const name = `${talent.first_name || ""} ${talent.last_name || ""}`.trim() || "Talent";
                  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
                  const isSelected = selectedUserId === talent.user_id;

                  return (
                    <button
                      key={talent.user_id}
                      onClick={() => setSelectedUserId(talent.user_id)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${
                        isSelected ? "bg-muted" : ""
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={talent.profile_photo_url || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{talent.city || "—"}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Selected talent */}
          {selectedTalent && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedTalent.profile_photo_url || undefined} />
                <AvatarFallback>
                  {`${selectedTalent.first_name?.[0] || ""}${selectedTalent.last_name?.[0] || ""}`}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {selectedTalent.first_name} {selectedTalent.last_name}
                </p>
                <p className="text-xs text-muted-foreground">Destinatario selezionato</p>
              </div>
            </div>
          )}

          {/* Message */}
          {selectedUserId && (
            <div className="space-y-2">
              <Label>Messaggio (opzionale)</Label>
              <Textarea
                placeholder="Scrivi un messaggio iniziale..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Annulla
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedUserId || isCreating}
          >
            {isCreating ? "Creazione..." : "Inizia conversazione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
