import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AuditionBooking, AuditionSlot } from "@/hooks/useAuditions";

interface SelectAuditionSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: AuditionBooking | null;
}

interface SlotWithCount extends AuditionSlot {
  bookings_count: number;
}

export const SelectAuditionSlotDialog = ({
  open,
  onOpenChange,
  booking,
}: SelectAuditionSlotDialogProps) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const queryClient = useQueryClient();

  const eventId = booking?.slot?.audition_event?.id;
  const currentSlotId = booking?.slot?.id;

  // Fetch all available slots for this event
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["event-slots", eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data: slotsData, error } = await supabase
        .from("audition_slots")
        .select("*")
        .eq("audition_event_id", eventId)
        .order("start_datetime", { ascending: true });

      if (error) throw error;

      // Get booking counts for each slot
      const slotsWithCounts = await Promise.all(
        (slotsData || []).map(async (slot) => {
          const { count } = await supabase
            .from("audition_bookings")
            .select("*", { count: "exact", head: true })
            .eq("audition_slot_id", slot.id)
            .neq("status", "declined");

          return { ...slot, bookings_count: count || 0 } as SlotWithCount;
        })
      );

      return slotsWithCounts;
    },
    enabled: open && !!eventId,
  });

  // Filter available slots (not full, or is current slot)
  const availableSlots = useMemo(() => {
    return slots.filter((slot) => {
      const capacity = slot.capacity || 1;
      const booked = slot.bookings_count || 0;
      return booked < capacity || slot.id === currentSlotId;
    });
  }, [slots, currentSlotId]);

  // Mutation to change the booking's slot
  const changeSlotMutation = useMutation({
    mutationFn: async (newSlotId: string) => {
      if (!booking) throw new Error("Prenotazione non trovata");

      const { data, error } = await supabase
        .from("audition_bookings")
        .update({
          audition_slot_id: newSlotId,
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-audition-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["event-slots"] });
      toast({
        title: "Slot confermato",
        description: "Hai confermato la tua partecipazione al provino.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile cambiare lo slot.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedSlotId("");
    onOpenChange(false);
  };

  const handleConfirm = () => {
    const slotToConfirm = selectedSlotId || currentSlotId;
    if (slotToConfirm) {
      changeSlotMutation.mutate(slotToConfirm);
    }
  };

  const formatSlotDate = (slot: SlotWithCount) => {
    const start = new Date(slot.start_datetime);
    return format(start, "EEEE d MMMM", { locale: itLocale });
  };

  const formatSlotTime = (slot: SlotWithCount) => {
    const start = new Date(slot.start_datetime);
    const end = new Date(slot.end_datetime);
    return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  };

  const eventTitle = booking?.slot?.audition_event?.title || "Provino";
  const castingTitle = booking?.slot?.audition_event?.casting?.title;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scegli lo slot del provino</DialogTitle>
          <DialogDescription>
            Seleziona l'orario che preferisci per <strong>{eventTitle}</strong>
            {castingTitle && <span className="block text-xs mt-1">{castingTitle}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Caricamento slot...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuno slot disponibile per questo evento.
            </p>
          ) : (
            <RadioGroup
              value={selectedSlotId || currentSlotId || ""}
              onValueChange={setSelectedSlotId}
              className="space-y-3"
            >
              {availableSlots.map((slot) => {
                const capacity = slot.capacity || 1;
                const booked = slot.bookings_count || 0;
                const remaining = capacity - booked;
                const isCurrentSlot = slot.id === currentSlotId;
                const isFull = remaining <= 0 && !isCurrentSlot;

                return (
                  <div key={slot.id} className="relative">
                    <RadioGroupItem
                      value={slot.id}
                      id={slot.id}
                      disabled={isFull}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={slot.id}
                      className={`
                        flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                        peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                        hover:border-primary/50
                        ${isFull ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{formatSlotDate(slot)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatSlotTime(slot)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCurrentSlot && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Assegnato
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {remaining}/{capacity}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={changeSlotMutation.isPending || (!selectedSlotId && !currentSlotId)}
          >
            {changeSlotMutation.isPending ? "Conferma..." : "Conferma partecipazione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
