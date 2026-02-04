import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TalentDetailDialog } from "@/components/talents/TalentDetailDialog";
import type { TalentWithAttributes } from "@/hooks/useTalents";

interface SlotParticipant {
  id: string;
  talent_user_id: string;
  status: string | null;
  profile: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_photo_url: string | null;
    city: string | null;
    country: string | null;
    gender: string | null;
    birth_date: string | null;
    talent_categories: string[] | null;
    bio: string | null;
  } | null;
}

interface SlotParticipantsProps {
  slotId: string;
  bookingsCount: number;
}

export const SlotParticipants = ({ slotId, bookingsCount }: SlotParticipantsProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<TalentWithAttributes | null>(null);

  const { data: participants, isLoading } = useQuery({
    queryKey: ["slot-participants", slotId],
    queryFn: async () => {
      // Fetch bookings for this slot
      const { data: bookings, error } = await supabase
        .from("audition_bookings")
        .select("id, talent_user_id, status")
        .eq("audition_slot_id", slotId);

      if (error) throw error;
      if (!bookings || bookings.length === 0) return [];

      // Fetch profiles for the talent users
      const talentUserIds = bookings.map((b) => b.talent_user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, profile_photo_url, city, country, gender, birth_date, talent_categories, bio")
        .in("user_id", talentUserIds);

      if (profilesError) throw profilesError;

      // Map profiles to bookings
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      
      return bookings.map((booking) => ({
        ...booking,
        profile: profileMap.get(booking.talent_user_id) || null,
      })) as SlotParticipant[];
    },
    enabled: bookingsCount > 0 && expanded,
  });

  if (bookingsCount === 0) {
    return null;
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return "ring-2 ring-primary ring-offset-2";
      case "declined":
        return "opacity-50";
      case "invited":
        return "ring-2 ring-muted-foreground/30 ring-offset-2";
      default:
        return "";
    }
  };

  const handleTalentClick = (participant: SlotParticipant) => {
    if (participant.profile) {
      const talentData: TalentWithAttributes = {
        id: participant.profile.id,
        user_id: participant.profile.user_id,
        first_name: participant.profile.first_name,
        last_name: participant.profile.last_name,
        profile_photo_url: participant.profile.profile_photo_url,
        city: participant.profile.city,
        country: participant.profile.country,
        gender: participant.profile.gender,
        birth_date: participant.profile.birth_date,
        talent_categories: participant.profile.talent_categories,
        bio: participant.profile.bio,
        attributes: null,
      };
      setSelectedTalent(talentData);
    }
  };

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        <User className="h-3 w-3 mr-1" />
        {bookingsCount} partecipant{bookingsCount === 1 ? "e" : "i"}
        {expanded ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </Button>

      {expanded && (
        <div className="mt-2 pl-1">
          {isLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: Math.min(bookingsCount, 3) }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          ) : participants && participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-background border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleTalentClick(participant)}
                >
                  <Avatar className={`h-7 w-7 ${getStatusColor(participant.status)}`}>
                    <AvatarImage
                      src={participant.profile?.profile_photo_url || undefined}
                      alt={`${participant.profile?.first_name} ${participant.profile?.last_name}`}
                    />
                    <AvatarFallback className="text-xs bg-muted">
                      {getInitials(
                        participant.profile?.first_name || null,
                        participant.profile?.last_name || null
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium pr-1">
                    {participant.profile?.first_name} {participant.profile?.last_name?.[0]}.
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nessun partecipante</p>
          )}
        </div>
      )}

      {/* Talent Detail Dialog */}
      <TalentDetailDialog
        talent={selectedTalent}
        open={!!selectedTalent}
        onOpenChange={(open) => !open && setSelectedTalent(null)}
      />
    </div>
  );
};
