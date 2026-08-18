import { useState } from "react";
import { Eye } from "lucide-react";
import { TalentDetailModal } from "@/components/talents/detail/TalentDetailModal";
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
  const { isLoading, isDirty, resetKey, profileRow } = useProfileForm();
  const { pendingHref, confirmLeave, cancelLeave } = useUnsavedGuard(isDirty);
  const [previewOpen, setPreviewOpen] = useState(false);

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
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-[15px] text-foreground sm:w-auto"
          >
            <Eye className="h-5 w-5" />
            Visualizza preview
          </button>
        </header>


        <ProfileStrengthCard />
        <div key={resetKey} className="space-y-6">
          <div id="section-head" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <HeadCard />
          </div>
          <div id="section-contacts" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <ContactsCard />
          </div>
          <div id="section-address" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <AddressCard />
          </div>
          <div id="section-documents" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <DocumentsCard />
          </div>
          <div id="section-media" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <MediaCard />
          </div>
          <div id="section-physical" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <PhysicalCard />
          </div>
          <div id="section-roles" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <RolesCard />
          </div>
          <div id="section-bio" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <BioCard />
          </div>
          <div id="section-work" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <WorkTravelCard />
          </div>
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
