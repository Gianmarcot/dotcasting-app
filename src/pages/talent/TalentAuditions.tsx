import { useState } from "react";
import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Video, Clock, ExternalLink, Settings2 } from "lucide-react";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import {
  useTalentAuditionBookings,
  useUpdateBookingStatus,
  AuditionBooking,
} from "@/hooks/useAuditions";
import { SelectAuditionSlotDialog } from "@/components/auditions/SelectAuditionSlotDialog";

const statusColors: Record<string, string> = {
  invited: "bg-[#C88500]/15 text-[#9A6700] border-[#C88500]/20",
  confirmed: "bg-[#729128]/15 text-[#729128] border-[#729128]/20",
  declined: "bg-[#A30A2B]/15 text-[#A30A2B] border-[#A30A2B]/20",
  reschedule_requested: "bg-[#C88500]/15 text-[#9A6700] border-[#C88500]/20",
};

const statusLabels: Record<string, string> = {
  invited: "Invitato",
  confirmed: "Confermato",
  declined: "Rifiutato",
  reschedule_requested: "Riprogrammazione richiesta",
};

interface AuditionCardProps {
  booking: AuditionBooking;
  onConfirm: () => void;
  onDecline: () => void;
  onSelectSlot: () => void;
  isPending: boolean;
}

const AuditionCard = ({ booking, onConfirm, onDecline, onSelectSlot, isPending }: AuditionCardProps) => {
  const slot = booking.slot;
  const event = slot?.audition_event;
  const slotDate = slot ? new Date(slot.start_datetime) : null;
  const isUpcoming = slotDate ? isFuture(slotDate) : false;
  const isPastEvent = slotDate ? isPast(slotDate) : false;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-foreground font-medium">
                {event?.title || "Provino"}
              </h3>
              <Badge className={statusColors[booking.status || "invited"]}>
                {statusLabels[booking.status || "invited"]}
              </Badge>
              {isPastEvent && (
                <Badge variant="outline" className="text-xs">
                  Passato
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {event?.casting?.title}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
              {slotDate && (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(slotDate, "EEEE d MMMM yyyy", { locale: itLocale })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(slotDate, "HH:mm")}
                    {slot?.end_datetime && ` - ${format(new Date(slot.end_datetime), "HH:mm")}`}
                  </span>
                </>
              )}
              {event?.is_virtual ? (
                <span className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  {it.auditions.virtual}
                </span>
              ) : event?.location_text ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location_text}
                </span>
              ) : null}
            </div>

            {isUpcoming && slotDate && (
              <p className="text-xs text-primary">
                {formatDistanceToNow(slotDate, { addSuffix: true, locale: itLocale })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {booking.status === "invited" && isUpcoming && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDecline}
                  disabled={isPending}
                >
                  {it.auditions.decline}
                </Button>
                <Button size="sm" onClick={onSelectSlot} disabled={isPending}>
                  <Settings2 className="h-4 w-4 mr-1" />
                  Scegli orario
                </Button>
              </>
            )}

            {booking.status === "confirmed" && isUpcoming && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectSlot}
                disabled={isPending}
              >
                <Settings2 className="h-4 w-4 mr-1" />
                Cambia orario
              </Button>
            )}

            {booking.status === "confirmed" && event?.is_virtual && event.virtual_link_url && isUpcoming && (
              <Button size="sm" variant="outline" asChild>
                <a href={event.virtual_link_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Partecipa
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TalentAuditions = () => {
  const [selectedBooking, setSelectedBooking] = useState<AuditionBooking | null>(null);
  const { data: bookings, isLoading } = useTalentAuditionBookings();
  const updateStatus = useUpdateBookingStatus();

  const handleConfirm = (bookingId: string) => {
    updateStatus.mutate({ bookingId, status: "confirmed" });
  };

  const handleDecline = (bookingId: string) => {
    updateStatus.mutate({ bookingId, status: "declined" });
  };

  const handleSelectSlot = (booking: AuditionBooking) => {
    setSelectedBooking(booking);
  };

  // Separate upcoming and past bookings
  const upcomingBookings = bookings?.filter((b) => {
    const slotDate = b.slot?.start_datetime ? new Date(b.slot.start_datetime) : null;
    return slotDate && isFuture(slotDate);
  }) || [];

  const pastBookings = bookings?.filter((b) => {
    const slotDate = b.slot?.start_datetime ? new Date(b.slot.start_datetime) : null;
    return slotDate && isPast(slotDate);
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl text-foreground">{it.auditions.title}</h1>
        <p className="text-muted-foreground mt-1">
          I tuoi prossimi provini e appuntamenti
        </p>
      </div>

      {/* Upcoming auditions */}
      <div className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          {it.auditions.upcoming}
        </h2>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <AuditionCard
                key={booking.id}
                booking={booking}
                onConfirm={() => handleConfirm(booking.id)}
                onDecline={() => handleDecline(booking.id)}
                onSelectSlot={() => handleSelectSlot(booking)}
                isPending={updateStatus.isPending}
              />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nessun provino in programma
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past auditions */}
      {pastBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            {it.auditions.past}
          </h2>

          <div className="space-y-4 opacity-70">
            {pastBookings.map((booking) => (
              <AuditionCard
                key={booking.id}
                booking={booking}
                onConfirm={() => {}}
                onDecline={() => {}}
                onSelectSlot={() => {}}
                isPending={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Select Slot Dialog */}
      <SelectAuditionSlotDialog
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default TalentAuditions;
