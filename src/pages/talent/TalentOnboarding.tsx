import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Tag, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUploadMedia } from "@/hooks/useTalentMedia";
import { Surface } from "@/components/ui/surface";
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
import {
  OnboardingCard,
  OnboardingFooter,
  OnboardingHeader,
  OnboardingStepper,
} from "@/components/onboarding/OnboardingChrome";
import {
  BasicInfoStep,
  type BasicInfoStepState,
} from "@/components/onboarding/steps/BasicInfoStep";
import { RolesStep } from "@/components/onboarding/steps/RolesStep";
import { PhotoStep } from "@/components/onboarding/steps/PhotoStep";
import {
  isWhatsappValid,
  validateBasicInfo,
  type BasicInfoErrors,
  type WhatsappMode,
} from "@/components/profile/fields/BasicInfoFields";


const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];

const EMPTY_BASIC: BasicInfoStepState = {
  first_name: "",
  last_name: "",
  birth_date: "",
  gender: "",
  gender_identity: "",
  contact_email: "",
  phone_prefix: "+39",
  phone_number: "",
  whatsapp_prefix: "+39",
  whatsapp_number: "",

};



export const TalentOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadMedia = useUploadMedia();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  // Step 1 — anagrafica: nulla viene scritto prima di "Avanti".
  const [basic, setBasic] = useState<BasicInfoStepState>(EMPTY_BASIC);
  const [basicTouched, setBasicTouched] = useState(false);
  const [basicSaved, setBasicSaved] = useState(false);

  // Step 2 — ruoli
  const [roles, setRoles] = useState<string[]>([]);
  const [rolesDirty, setRolesDirty] = useState(false);

  // Step 3 — foto
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Stato delle spunte WhatsApp (dedotto dal componente condiviso).
  const [whatsappMode, setWhatsappMode] = useState<WhatsappMode>("same");

  const errors: BasicInfoErrors = useMemo(() => validateBasicInfo(basic), [basic]);
  const whatsappValid = isWhatsappValid(whatsappMode, basic);
  const whatsappError =
    basicTouched && !whatsappValid ? "Inserisci un numero WhatsApp valido" : undefined;
  const termsError =
    basicTouched && !basic.terms_accepted
      ? "Devi accettare i termini e le condizioni per continuare"
      : undefined;
  const basicValid =
    Object.keys(errors).length === 0 && whatsappValid && basic.terms_accepted;
  const visibleErrors: BasicInfoErrors = basicTouched ? errors : {};


  const whatsappPrefixToSave =
    whatsappMode === "same" ? basic.phone_prefix : basic.whatsapp_prefix;
  const whatsappNumberToSave =
    (whatsappMode === "same" ? basic.phone_number : basic.whatsapp_number).trim() || null;

  const stepDirty =
    step === 1 ? basicTouched && !basicSaved : step === 2 ? rolesDirty : !!photoFile;


  /* ------------------------------- salvataggi ------------------------------ */

  const saveBasic = async () => {
    await updateProfile.mutateAsync({
      first_name: basic.first_name.trim(),
      last_name: basic.last_name.trim(),
      birth_date: basic.birth_date || null,
      gender: basic.gender || null,
      gender_identity: basic.gender_identity || null,
      contact_email: basic.contact_email.trim() || null,
      phone_prefix: basic.phone_prefix,
      phone_number: basic.phone_number.trim() || null,
      whatsapp_prefix: whatsappMode === "none" ? null : whatsappPrefixToSave,
      whatsapp_number: whatsappMode === "none" ? null : whatsappNumberToSave,

      age_confirmed: true,
      onboarding_completed: true,
    });
    setBasicSaved(true);
  };

  const saveRoles = async () => {
    if (!rolesDirty) return;
    await updateProfile.mutateAsync({ talent_categories: roles.length ? roles : null });
    setRolesDirty(false);
  };

  const savePhoto = async () => {
    if (!photoFile) return;
    const media = await uploadMedia.mutateAsync({
      file: photoFile,
      mediaType: "photo",
      category: "main_photos",
    });
    if (media?.url) await updateProfile.mutateAsync({ profile_photo_url: media.url });
    setPhotoFile(null);
  };

  const saveCurrentStep = async () => {
    if (step === 1) return saveBasic();
    if (step === 2) return saveRoles();
    return savePhoto();
  };

  /* -------------------------------- azioni -------------------------------- */

  const goNext = async () => {
    setSaving(true);
    try {
      await saveCurrentStep();
      if (step < 3) setStep(step + 1);
      else {
        toast.success("Benvenuto in dotCasting!");
        navigate("/talent/profile", { replace: true });
      }
    } catch (error) {
      console.error("Onboarding save error:", error);
      toast.error("Errore nel salvataggio. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  const leave = async () => {
    if (step === 1 && !basicSaved && !profile?.onboarding_completed) {
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
      return;
    }
    navigate("/talent/profile", { replace: true });
  };

  const handleExit = () => {
    if (stepDirty) setExitOpen(true);
    else void leave();
  };

  const handleLater = async () => {
    setSaving(true);
    try {
      await saveCurrentStep();
      navigate("/talent/profile", { replace: true });
    } catch (error) {
      console.error("Onboarding save error:", error);
      toast.error("Errore nel salvataggio. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = (file: File) => {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Il file deve essere in formato JPG o PNG");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Il file non può superare i 5MB");
      return;
    }
    setPhotoError(null);
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ---------------------------------- UI ---------------------------------- */

  const cardProps = {
    1: {
      icon: <User strokeWidth={1} />,
      title: "INFORMAZIONI DI BASE",
      subtitle: undefined as string | undefined,
      nextLabel: "Avanti",
    },
    2: {
      icon: <Tag strokeWidth={1} />,
      title: "SELEZIONA I TUOI RUOLI",
      subtitle: "Che tipo di talento sei?",
      nextLabel: "Avanti",
    },
    3: {
      icon: <Camera strokeWidth={1} />,
      title: "IMMAGINE PROFILO",
      subtitle:
        "Imposta una foto di base, potrai caricare tutte le altre foto dal profilo.",
      nextLabel: "Iniziamo",
    },
  }[step as 1 | 2 | 3];

  return (
    <Surface variant="muted" className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <OnboardingHeader onExit={handleExit} />

        <div className="mt-6">
          <OnboardingStepper current={step} />
          <OnboardingCard
            icon={cardProps.icon}
            title={cardProps.title}
            subtitle={cardProps.subtitle}
            nextLabel={cardProps.nextLabel}
            nextDisabled={step === 1 && !basicValid}
            loading={saving}
            onBack={step > 1 ? () => setStep(step - 1) : undefined}
            onNext={goNext}
          >
            {step === 1 && (
              <BasicInfoStep
                value={basic}
                errors={visibleErrors}
                whatsappError={whatsappError}
                termsError={termsError}
                onWhatsappModeChange={setWhatsappMode}
                onChange={(patch) => {
                  setBasicTouched(true);
                  setBasicSaved(false);
                  setBasic((prev) => ({ ...prev, ...patch }));
                }}
              />


            )}
            {step === 2 && (
              <RolesStep
                selected={roles}
                onToggle={(role) => {
                  setRolesDirty(true);
                  setRoles((prev) =>
                    prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
                  );
                }}
              />
            )}
            {step === 3 && (
              <PhotoStep
                previewUrl={photoPreview ?? profile?.profile_photo_url ?? null}
                error={photoError}
                onSelectFile={handlePhoto}
              />
            )}
          </OnboardingCard>
        </div>

        <OnboardingFooter onLater={step > 1 ? handleLater : undefined} />
      </div>

      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uscire senza salvare?</AlertDialogTitle>
            <AlertDialogDescription>
              I dati inseriti in questo passaggio e non ancora salvati andranno persi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Torna indietro</AlertDialogCancel>
            <AlertDialogAction onClick={() => void leave()}>Esci comunque</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Surface>
  );
};

export default TalentOnboarding;
