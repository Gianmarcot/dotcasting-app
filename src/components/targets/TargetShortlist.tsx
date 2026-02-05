import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { List, Trash2, ChevronDown, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CastingTarget } from "@/hooks/useTargets";
import {
  useShortlist,
  useRemoveFromShortlist,
  useUpdateShortlistStatus,
  useUpdateShortlistNotes,
  SHORTLIST_STATUSES,
  type ShortlistStatus,
} from "@/hooks/useShortlist";

interface TargetShortlistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CastingTarget | null;
}

export const TargetShortlist = ({
  open,
  onOpenChange,
  target,
}: TargetShortlistProps) => {
  const { toast } = useToast();
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const { data: shortlistItems = [], isLoading } = useShortlist(target?.id || null);
  const removeFromShortlist = useRemoveFromShortlist();
  const updateStatus = useUpdateShortlistStatus();
  const updateNotes = useUpdateShortlistNotes();

  const handleRemove = async (shortlistId: string) => {
    if (!target) return;
    try {
      await removeFromShortlist.mutateAsync({ shortlistId, targetId: target.id });
      toast({
        title: "Rimosso dalla shortlist",
        description: "Il talent è stato rimosso",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (shortlistId: string, status: ShortlistStatus) => {
    if (!target) return;
    try {
      await updateStatus.mutateAsync({ shortlistId, status, targetId: target.id });
      toast({
        title: "Stato aggiornato",
        description: `Stato cambiato in "${SHORTLIST_STATUSES.find(s => s.value === status)?.label}"`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore",
        variant: "destructive",
      });
    }
  };

  const handleStartEditNotes = (shortlistId: string, currentNotes: string | null) => {
    setEditingNotesId(shortlistId);
    setNotesValue(currentNotes || "");
  };

  const handleSaveNotes = async () => {
    if (!target || !editingNotesId) return;
    try {
      await updateNotes.mutateAsync({
        shortlistId: editingNotesId,
        notes: notesValue,
        targetId: target.id,
      });
      toast({
        title: "Note salvate",
        description: "Le note sono state aggiornate",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore",
        variant: "destructive",
      });
    }
    setEditingNotesId(null);
    setNotesValue("");
  };

  const getStatusConfig = (status: string) => {
    return SHORTLIST_STATUSES.find(s => s.value === status) || SHORTLIST_STATUSES[0];
  };

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Shortlist per "{target.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 border-b">
          <Badge variant="secondary">{shortlistItems.length} talenti</Badge>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 py-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </Card>
            ))
          ) : shortlistItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>La shortlist è vuota</p>
              <p className="text-sm mt-1">Aggiungi talenti dalla vista Match</p>
            </div>
          ) : (
            shortlistItems.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const isEditingNotes = editingNotesId === item.id;

              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={item.profile?.profile_photo_url || undefined} />
                      <AvatarFallback>
                        {item.profile?.first_name?.[0]}
                        {item.profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {item.profile?.first_name} {item.profile?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.profile?.city || "Città non specificata"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className={`${statusConfig.color} border-0`}>
                                {statusConfig.label}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {SHORTLIST_STATUSES.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  onClick={() => handleStatusChange(item.id, s.value)}
                                >
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEditNotes(item.id, item.notes)}
                            title="Note"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id)}
                            className="text-destructive hover:text-destructive"
                            title="Rimuovi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {item.notes && !isEditingNotes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{item.notes}"
                        </p>
                      )}

                      {isEditingNotes && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            placeholder="Aggiungi note su questo talent..."
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingNotesId(null);
                                setNotesValue("");
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annulla
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveNotes}
                              disabled={updateNotes.isPending}
                            >
                              Salva
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
