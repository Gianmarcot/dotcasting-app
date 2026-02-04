import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditionSlot {
  id: string;
  audition_event_id: string;
  start_datetime: string;
  end_datetime: string;
  capacity: number | null;
  notes: string | null;
  bookings_count?: number;
}

export interface AuditionEvent {
  id: string;
  casting_id: string;
  title: string;
  type: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  location_text: string | null;
  is_virtual: boolean | null;
  virtual_link_url: string | null;
  created_at: string;
  created_by_user_id: string | null;
  casting?: {
    id: string;
    title: string;
  } | null;
  slots?: AuditionSlot[];
}

export interface AuditionBooking {
  id: string;
  audition_slot_id: string;
  talent_user_id: string;
  application_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  slot?: AuditionSlot & {
    audition_event?: AuditionEvent;
  };
}

// Fetch all audition events (for owners)
export const useAuditionEvents = () => {
  return useQuery({
    queryKey: ["audition-events"],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("audition_events")
        .select(`
          *,
          casting:castings(id, title)
        `)
        .order("start_datetime", { ascending: true });

      if (error) throw error;

      // Fetch slots for each event
      const eventsWithSlots = await Promise.all(
        (events || []).map(async (event) => {
          const { data: slots } = await supabase
            .from("audition_slots")
            .select("*")
            .eq("audition_event_id", event.id)
            .order("start_datetime", { ascending: true });

          // Get booking counts for each slot
          const slotsWithCounts = await Promise.all(
            (slots || []).map(async (slot) => {
              const { count } = await supabase
                .from("audition_bookings")
                .select("*", { count: "exact", head: true })
                .eq("audition_slot_id", slot.id);

              return { ...slot, bookings_count: count || 0 };
            })
          );

          return { ...event, slots: slotsWithCounts };
        })
      );

      return eventsWithSlots as AuditionEvent[];
    },
  });
};

// Fetch bookings for a talent
export const useTalentAuditionBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["talent-audition-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("audition_bookings")
        .select(`
          *,
          slot:audition_slots(
            *,
            audition_event:audition_events(
              *,
              casting:castings(id, title)
            )
          )
        `)
        .eq("talent_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AuditionBooking[];
    },
    enabled: !!user,
  });
};

// Create audition event
export const useCreateAuditionEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      castingId,
      title,
      type,
      startDatetime,
      endDatetime,
      locationText,
      isVirtual,
      virtualLinkUrl,
      slots,
    }: {
      castingId: string;
      title: string;
      type?: string;
      startDatetime?: string;
      endDatetime?: string;
      locationText?: string;
      isVirtual?: boolean;
      virtualLinkUrl?: string;
      slots?: { startDatetime: string; endDatetime: string; capacity?: number }[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Create the event
      const { data: event, error: eventError } = await supabase
        .from("audition_events")
        .insert({
          casting_id: castingId,
          title,
          type: type || "audition",
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          location_text: locationText,
          is_virtual: isVirtual || false,
          virtual_link_url: virtualLinkUrl,
          created_by_user_id: user.id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create slots if provided
      if (slots && slots.length > 0) {
        const slotsData = slots.map((slot) => ({
          audition_event_id: event.id,
          start_datetime: slot.startDatetime,
          end_datetime: slot.endDatetime,
          capacity: slot.capacity || 1,
        }));

        const { error: slotsError } = await supabase
          .from("audition_slots")
          .insert(slotsData);

        if (slotsError) throw slotsError;
      }

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition-events"] });
      toast({
        title: "Provino creato",
        description: "L'evento di provino è stato creato con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile creare il provino.",
        variant: "destructive",
      });
    },
  });
};

// Book an audition slot (for talents)
export const useBookAuditionSlot = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      slotId,
      applicationId,
    }: {
      slotId: string;
      applicationId?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("audition_bookings")
        .insert({
          audition_slot_id: slotId,
          talent_user_id: user.id,
          application_id: applicationId || null,
          status: "confirmed",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-audition-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["audition-events"] });
      toast({
        title: "Prenotazione confermata",
        description: "Il tuo slot per il provino è stato prenotato.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile prenotare lo slot.",
        variant: "destructive",
      });
    },
  });
};

// Update booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: "confirmed" | "declined" | "reschedule_requested";
    }) => {
      const { data, error } = await supabase
        .from("audition_bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["talent-audition-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["audition-events"] });
      
      const messages: Record<string, string> = {
        confirmed: "Partecipazione confermata",
        declined: "Partecipazione rifiutata",
        reschedule_requested: "Richiesta riprogrammazione inviata",
      };
      
      toast({
        title: messages[variables.status] || "Stato aggiornato",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato.",
        variant: "destructive",
      });
    },
  });
};

// Delete audition event
export const useDeleteAuditionEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      // First delete all slots (bookings will cascade)
      await supabase
        .from("audition_slots")
        .delete()
        .eq("audition_event_id", eventId);

      const { error } = await supabase
        .from("audition_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition-events"] });
      toast({
        title: "Provino eliminato",
        description: "L'evento è stato eliminato con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il provino.",
        variant: "destructive",
      });
    },
  });
};
