import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { ProfileStrengthCard } from "@/components/profile/v2/ProfileStrengthCard";
import { HeadCard } from "@/components/profile/v2/HeadCard";
import { ContactsCard } from "@/components/profile/v2/ContactsCard";
import { AddressCard } from "@/components/profile/v2/AddressCard";
import { DocumentsCard } from "@/components/profile/v2/DocumentsCard";
import { MediaCard } from "@/components/profile/v2/MediaCard";
import { PhysicalCard } from "@/components/profile/v2/PhysicalCard";
import { RolesCard } from "@/components/profile/v2/RolesCard";
import { BioCard } from "@/components/profile/v2/BioCard";
import { WorkTravelCard } from "@/components/profile/v2/WorkTravelCard";

export const TalentProfileV2 = () => {
  const { isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1040px] animate-fade-up space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl uppercase text-foreground">Il mio profilo</h1>
        <Link to="/talent/profile/preview">
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-[15px] text-foreground sm:w-auto">
            <Eye className="h-5 w-5" />
            Visualizza preview
          </button>
        </Link>
      </header>

      <ProfileStrengthCard />
      <HeadCard />
      <ContactsCard />
      <AddressCard />
      <DocumentsCard />
      <MediaCard />
      <PhysicalCard />
      <RolesCard />
      <BioCard />
      <WorkTravelCard />
    </div>
  );
};

export default TalentProfileV2;
