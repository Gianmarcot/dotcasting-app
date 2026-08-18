import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
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
import { ProfileFormProvider, useProfileForm } from "@/components/profile/v2/ProfileFormContext";
import { ProfileSaveBar } from "@/components/profile/v2/ProfileSaveBar";
import { useUnsavedGuard } from "@/components/profile/v2/useUnsavedGuard";
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

const ProfileContent = () => {
  const { isLoading, isDirty, resetKey } = useProfileForm();
  const { pendingHref, confirmLeave, cancelLeave } = useUnsavedGuard(isDirty);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28">
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
        <div key={resetKey} className="space-y-6">
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
      </div>

      <ProfileSaveBar />

      <AlertDialog open={!!pendingHref} onOpenChange={(open) => !open && cancelLeave()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifiche non salvate</AlertDialogTitle>
            <AlertDialogDescription>
              Hai modifiche non salvate sul tuo profilo. Se esci ora andranno perse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave}>Resta sulla pagina</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Esci senza salvare</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const TalentProfileV2 = () => (
  <ProfileFormProvider>
    <ProfileContent />
  </ProfileFormProvider>
);

export default TalentProfileV2;
