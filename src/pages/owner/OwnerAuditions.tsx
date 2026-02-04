import { useState } from "react";
import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Calendar, MapPin, Video, Clock, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { useAuditionEvents, useDeleteAuditionEvent, AuditionEvent } from "@/hooks/useAuditions";
import { CreateAuditionDialog } from "@/components/auditions/CreateAuditionDialog";

export const OwnerAuditions = () => {
  const { data: events, isLoading } = useAuditionEvents();
  const deleteEvent = useDeleteAuditionEvent();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteEventId) {
      await deleteEvent.mutateAsync(deleteEventId);
      setDeleteEventId(null);
    }
  };

  const getTotalBookings = (event: AuditionEvent) => {
    return event.slots?.reduce((acc, slot) => acc + (slot.bookings_count || 0), 0) || 0;
  };

  const getTotalCapacity = (event: AuditionEvent) => {
    return event.slots?.reduce((acc, slot) => acc + (slot.capacity || 1), 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">
            {it.backoffice.auditionScheduling}
          </h1>
          <p className="text-muted-foreground mt-1">
            Programma e gestisci i provini
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Provino
        </Button>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="border-0 shadow-sm">
              <CardContent className="p-0">
                <Accordion type="single" collapsible>
                  <AccordionItem value={event.id} className="border-0">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <div className="flex items-start justify-between w-full pr-4">
                        <div className="space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="text-foreground text-lg font-medium">
                              {event.title}
                            </h3>
                            {event.is_virtual && (
                              <Badge variant="secondary" className="text-xs">
                                <Video className="h-3 w-3 mr-1" />
                                Virtuale
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.casting?.title}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {event.start_datetime && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(event.start_datetime), "EEEE d MMMM yyyy", {
                                  locale: itLocale,
                                })}
                              </span>
                            )}
                            {event.start_datetime && event.end_datetime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(event.start_datetime), "HH:mm")} -{" "}
                                {format(new Date(event.end_datetime), "HH:mm")}
                              </span>
                            )}
                            {event.is_virtual ? (
                              event.virtual_link_url && (
                                <span className="flex items-center gap-1">
                                  <Video className="h-4 w-4" />
                                  Link disponibile
                                </span>
                              )
                            ) : (
                              event.location_text && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location_text}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-semibold text-foreground">
                            {getTotalBookings(event)}/{getTotalCapacity(event)}
                          </p>
                          <p className="text-xs text-muted-foreground">slot prenotati</p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-4">
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Slot orari ({event.slots?.length || 0})
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteEventId(event.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Elimina evento
                          </Button>
                        </div>

                        {event.slots && event.slots.length > 0 ? (
                          <div className="grid gap-2">
                            {event.slots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium">
                                    {format(new Date(slot.start_datetime), "HH:mm")} -{" "}
                                    {format(new Date(slot.end_datetime), "HH:mm")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {slot.bookings_count || 0}/{slot.capacity || 1}
                                  </span>
                                  {(slot.bookings_count || 0) >= (slot.capacity || 1) && (
                                    <Badge variant="secondary" className="text-xs">
                                      Pieno
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Nessuno slot configurato
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nessun provino programmato
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea il primo evento di provino per iniziare
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Provino
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateAuditionDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina provino</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo evento? Tutti gli slot e le
              prenotazioni associate verranno eliminati. Questa azione non può essere
              annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{it.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {it.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerAuditions;
