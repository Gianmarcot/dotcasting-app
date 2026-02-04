import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building2, Banknote, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import type { ExploreCasting } from "@/hooks/useExploreCastings";

interface ApplyToCastingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casting: ExploreCasting | null;
}

export const ApplyToCastingDialog = ({ open, onOpenChange, casting }: ApplyToCastingDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [coverNote, setCoverNote] = useState("");

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !casting?.id) throw new Error("Missing user or casting");

      const { data, error } = await supabase
        .from("applications")
        .insert({
          casting_id: casting.id,
          talent_user_id: user.id,
          cover_note: coverNote.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore-castings"] });
      queryClient.invalidateQueries({ queryKey: ["talent-applications"] });
      toast({
        title: "Candidatura inviata!",
        description: "La tua candidatura è stata inviata con successo.",
      });
      setCoverNote("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Error applying:", error);
      toast({
        title: "Errore",
        description: error.message?.includes("duplicate") 
          ? "Ti sei già candidato a questo casting."
          : "Impossibile inviare la candidatura. Riprova.",
        variant: "destructive",
      });
    },
  });

  if (!casting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidati al casting</DialogTitle>
          <DialogDescription>
            Invia la tua candidatura per questo casting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Casting Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-foreground">{casting.title}</h3>
            
            <div className="flex flex-wrap gap-2">
              {casting.category && (
                <Badge variant="secondary">{casting.category}</Badge>
              )}
              {casting.company && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {casting.company.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {(casting.start_date || casting.end_date) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {casting.start_date && format(new Date(casting.start_date), "d MMM", { locale: itLocale })}
                  {casting.start_date && casting.end_date && " - "}
                  {casting.end_date && format(new Date(casting.end_date), "d MMM yyyy", { locale: itLocale })}
                </span>
              )}
              {casting.locations && casting.locations.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {casting.locations.join(", ")}
                </span>
              )}
              {casting.compensation_amount && (
                <span className="flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5" />
                  {casting.compensation_amount} {casting.currency || "EUR"}
                </span>
              )}
            </div>
          </div>

          {/* Cover Note */}
          <div className="space-y-2">
            <Label htmlFor="coverNote">Messaggio di presentazione (opzionale)</Label>
            <Textarea
              id="coverNote"
              placeholder="Presentati brevemente e spiega perché sei interessato a questo casting..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Un breve messaggio può aiutarti a distinguerti dagli altri candidati.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button 
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
          >
            {applyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Invia candidatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
