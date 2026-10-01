import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { GuardianCard } from "@/components/profile/v2/GuardianCard";
import { MaturityNotice, UpdateAccessNotice } from "@/components/profile/v2/MaturityNotice";
import { useAuth } from "@/contexts/AuthContext";
import { needsCredentialsUpdate } from "@/lib/signupMode";

const ProfileContentInner = ({ adminMode = false }: { adminMode?: boolean }) => {
  const { isLoading, isDirty, resetKey, profileRow } = useProfileForm();
  const { pendingHref, confirmLeave, cancelLeave } = useUnsavedGuard(isDirty);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(false);
  const guardianUserId = profileRow?.guardian_user_id ?? null;
  const displayName = [profileRow?.first_name, profileRow?.last_name].filter(Boolean).join(" ");
  const isPublished = !!profileRow?.onboarding_completed;

  const publish = async () => {
    if (!profileRow) return;
    const missing: string[] = [];
    if (!profileRow.first_name) missing.push("Nome");
    if (!profileRow.last_name) missing.push("Cognome");
    if (!profileRow.talent_categories?.length) missing.push("Almeno un ruolo");
    if (missing.length) {
      toast.error(`Campi mancanti: ${missing.join(", ")}`);
      return;
    }
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", profileRow.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["profile", profileRow.id] });
      toast.success("Profilo pubblicato");
    } catch {
      toast.error("Errore nella pubblicazione del profilo");
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profileRow) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Profilo non trovato</p>
        {adminMode && (
          <Button variant="outline" size="lg" onClick={() => navigate("/owner/talents")} className="mt-4">
            Torna al Database talenti
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="-mx-4 w-auto animate-fade-up pb-28 md:mx-auto md:w-full md:max-w-[1040px]">
        <div className="space-y-6">
          <header className="flex flex-col gap-6 px-6 pb-2 sm:flex-row sm:items-center sm:justify-between md:gap-3 md:px-0 md:pb-0">
            <div>
              {adminMode && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/owner/talents")} className="mb-4">
                  <ArrowLeft />
                  Database talenti
                </Button>
              )}
              <h1 className="font-display text-[21px] uppercase text-foreground md:text-2xl">
                {adminMode ? "Modifica profilo" : "Il mio profilo"}
              </h1>
              {adminMode && displayName && <p className="mt-1 text-[15px] text-field-label">{displayName}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {adminMode && !isPublished && (
                <Button size="lg" onClick={() => void publish()} disabled={publishing}>
                  <CheckCircle2 />
                  {publishing ? "Pubblicazione..." : "Pubblica profilo"}
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={() => setPreviewOpen(true)}>
                <Eye />
                Visualizza preview
              </Button>
            </div>
          </header>

          {adminMode && !isPublished && (
            <div className="dc-card flex items-start gap-3 border-l-4 border-l-warning p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Profilo in attesa di pubblicazione</p>
                <p className="mt-1 text-muted-foreground">Compila almeno nome, cognome e un ruolo per pubblicarlo.</p>
              </div>
            </div>
          )}
          {!adminMode && (
            <>
              <MaturityNotice birthDate={profileRow.birth_date} guardianUserId={guardianUserId} />
              <UpdateAccessNotice show={needsCredentialsUpdate(user, guardianUserId)} />
            </>
          )}
        </div>

        {/* Forza del Profilo e sezioni: su mobile il box forza è attaccato alla
            prima sezione, su desktop lo spazio torna 24px. */}
        <div className="mt-6 md:space-y-6">
          <ProfileStrengthCard initiallyCollapsed={adminMode} />
          <div key={resetKey} className="space-y-6">
          <div id="section-head" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <HeadCard />
          </div>
          <div id="section-contacts" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <ContactsCard />
          </div>
          {guardianUserId && (
            <div id="section-guardian" className="scroll-mt-6 rounded-[24px] transition-shadow">
              <GuardianCard guardianUserId={guardianUserId} />
            </div>
          )}
          <div id="section-address" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <AddressCard />
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
          <div id="section-documents" className="scroll-mt-6 rounded-[24px] transition-shadow">
            <DocumentsCard />
          </div>
          </div>
        </div>
      </div>

      <ProfileSaveBar />

      {profileRow?.id && (
        <TalentDetailModal
          profileIds={[profileRow.id]}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          showAllMedia={adminMode}
          isOwnerView={adminMode}
        />
      )}

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

export const ProfileContent = ({
  adminMode = false,
  externalProfileId,
}: {
  adminMode?: boolean;
  externalProfileId?: string;
}) => (
  <ProfileFormProvider externalProfileId={externalProfileId}>
    <ProfileContentInner adminMode={adminMode} />
  </ProfileFormProvider>
);

export const TalentProfileV2 = () => <ProfileContent />;

export default TalentProfileV2;
