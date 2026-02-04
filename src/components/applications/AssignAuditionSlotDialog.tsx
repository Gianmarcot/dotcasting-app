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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Users } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { useAuditionEvents, type AuditionEvent, type AuditionSlot } from "@/hooks/useAuditions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ApplicationWithDetails } from "@/hooks/useApplications";

interface AssignAuditionSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: ApplicationWithDetails | null;
  onSuccess?: () => void;
}

export const AssignAuditionSlotDialog = ({
  open,
  onOpenChange,
  application,
  onSuccess,
}: AssignAuditionSlotDialogProps) => {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  const { data: events = [], isLoading } = useAuditionEvents();
  const queryClient = useQueryClient();

  // Filter events by casting if the application has a casting_id
  const filteredEvents = useMemo(() => {
    if (!application?.casting_id) return events;
    return events.filter((event) => event.casting_id === application.casting_id);
  }, [events, application?.casting_id]);

  const selectedEvent = filteredEvents.find((e) => e.id === selectedEventId);
  const availableSlots = selectedEvent?.slots?.filter((slot) => {
    const capacity = slot.capacity || 1;
    const booked = slot.bookings_count || 0;
    return booked < capacity;
  }) || [];

  const selectedSlot = availableSlots.find((s) => s.id === selectedSlotId);

  const assignSlotMutation = useMutation({
    mutationFn: async () => {
      if (!application || !selectedSlotId) throw new Error("Dati mancanti");

      const { data, error } = await supabase
        .from("audition_bookings")
        .insert({
          audition_slot_id: selectedSlotId,
          talent_user_id: application.talent_user_id,
          application_id: application.id,
          status: "invited",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition-events"] });
      queryClient.invalidateQueries({ queryKey: ["owner-applications"] });
      toast({
        title: "Slot assegnato",
        description: "Il talent è stato invitato al provino.",
      });
      handleClose();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile assegnare lo slot.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedEventId("");
    setSelectedSlotId("");
    onOpenChange(false);
  };

  const handleAssign = () => {
    assignSlotMutation.mutate();
  };

  const formatSlotTime = (slot: AuditionSlot) => {
    const start = new Date(slot.start_datetime);
    const end = new Date(slot.end_datetime);
    return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  };

  const formatEventDate = (event: AuditionEvent) => {
    if (!event.start_datetime) return "Data non definita";
    return format(new Date(event.start_datetime), "EEEE d MMMM yyyy", { locale: itLocale });
  };

  const talentName = application
    ? `${application.profile?.first_name || ""} ${application.profile?.last_name || ""}`.trim() || "Talent"
    : "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assegna slot provino</DialogTitle>
          <DialogDescription>
            Seleziona l'evento e lo slot per invitare <strong>{talentName}</strong> al provino.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Selection */}
          <div className="space-y-2">
            <Label>Evento provino</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Caricamento eventi...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nessun evento disponibile per questo casting.
              </div>
            ) : (
              <Select value={selectedEventId} onValueChange={(val) => {
                setSelectedEventId(val);
                setSelectedSlotId("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un evento" />
                </SelectTrigger>
                <SelectContent>
                  {filteredEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex items-center gap-2">
                        <span>{event.title}</span>
                        {event.is_virtual && <Video className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Event Details */}
          {selectedEvent && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatEventDate(selectedEvent)}</span>
              </div>
              {selectedEvent.location_text && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.location_text}</span>
                </div>
              )}
              {selectedEvent.is_virtual && selectedEvent.virtual_link_url && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>Provino virtuale</span>
                </div>
              )}
            </div>
          )}

          {/* Slot Selection */}
          {selectedEventId && (
            <div className="space-y-2">
              <Label>Slot orario</Label>
              {availableSlots.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Nessuno slot disponibile per questo evento.
                </div>
              ) : (
                <Select value={selectedSlotId} onValueChange={setSelectedSlotId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona uno slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => {
                      const capacity = slot.capacity || 1;
                      const booked = slot.bookings_count || 0;
                      const remaining = capacity - booked;

                      return (
                        <SelectItem key={slot.id} value={slot.id}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{formatSlotTime(slot)}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {remaining}/{capacity}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Selected Slot Summary */}
          {selectedSlot && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <div className="font-medium text-primary">Slot selezionato</div>
              <div className="text-muted-foreground mt-1">
                {format(new Date(selectedSlot.start_datetime), "EEEE d MMMM", { locale: itLocale })} alle{" "}
                {formatSlotTime(selectedSlot)}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedSlotId || assignSlotMutation.isPending}
          >
            {assignSlotMutation.isPending ? "Assegnazione..." : "Assegna slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
