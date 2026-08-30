import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Tag, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUploadMedia } from "@/hooks/useTalentMedia";
import { useGuardianBootstrap } from "@/hooks/useGuardianBootstrap";
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
import {
  EMPTY_GUARDIAN,
  validateGuardian,
  type GuardianErrors,
  type GuardianValue,
} from "@/components/profile/fields/GuardianFields";
import { isGuardianSignup } from "@/lib/signupMode";
import { isAdultBirthDate } from "@/lib/guardianship";
import { useUpdateGuardian } from "@/hooks/useGuardian";
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
  const updateGuardian = useUpdateGuardian();
  const uploadMedia = useUploadMedia();

  // Registrazione con la porta "tutore": il primo step raccoglie anche i dati
  // del tutore, unici contatti del profilo tutelato.
  const isGuardianMode = isGuardianSignup(user);

  // Account registrato come tutore: predispone riga guardians + tutela sul profilo.
  useGuardianBootstrap();


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

  // Dati del tutore (solo in modalità tutore). L'email non è raccolta: è
  // quella dell'account, propagata dal database su profiles.contact_email.
  const [guardian, setGuardian] = useState<GuardianValue>(EMPTY_GUARDIAN);
  const [guardianWhatsappMode, setGuardianWhatsappMode] = useState<WhatsappMode>("same");


  const guardianErrors: GuardianErrors = useMemo(
    () => (isGuardianMode ? validateGuardian(guardian) : {}),
    [isGuardianMode, guardian]
  );
  const guardianWhatsappValid = isWhatsappValid(guardianWhatsappMode, guardian);
  const guardianVisibleErrors: GuardianErrors = basicTouched ? guardianErrors : {};
  const guardianWhatsappError =
    basicTouched && !guardianWhatsappValid ? "Inserisci un numero WhatsApp valido" : undefined;
  const guardianValid = Object.keys(guardianErrors).length === 0 && guardianWhatsappValid;

  const errors: BasicInfoErrors = useMemo(() => {
    const all = validateBasicInfo(basic);
    // L'email non è più un campo del form: arriva dall'account.
    const { contact_email, phone_number, ...withoutContacts } = all;
    if (isGuardianMode) return withoutContacts;
    // Il minore non ha contatti propri; il talent adulto conserva il telefono.
    return { ...withoutContacts, ...(phone_number ? { phone_number } : {}) };
  }, [basic, isGuardianMode]);

  const whatsappValid = isGuardianMode ? true : isWhatsappValid(whatsappMode, basic);
  const whatsappError =
    basicTouched && !whatsappValid ? "Inserisci un numero WhatsApp valido" : undefined;
  const basicValid =
    Object.keys(errors).length === 0 && whatsappValid && (!isGuardianMode || guardianValid);
  const visibleErrors: BasicInfoErrors = basicTouched ? errors : {};


  const whatsappPrefixToSave =
    whatsappMode === "same" ? basic.phone_prefix : basic.whatsapp_prefix;
  const whatsappNumberToSave =
    (whatsappMode === "same" ? basic.phone_number : basic.whatsapp_number).trim() || null;

  const photoValid = !!photoFile || !!profile?.profile_photo_url;


  /* ------------------------------- salvataggi ------------------------------ */

  const saveBasic = async () => {
    if (isGuardianMode) {
      const guardianWhatsappPrefix =
        guardianWhatsappMode === "same" ? guardian.phone_prefix : guardian.whatsapp_prefix;
      const guardianWhatsappNumber =
        (guardianWhatsappMode === "same"
          ? guardian.phone_number
          : guardian.whatsapp_number
        ).trim() || null;

      await updateGuardian.mutateAsync({
        first_name: guardian.first_name.trim(),
        last_name: guardian.last_name.trim(),
        birth_date: guardian.birth_date || null,
        age_confirmed: isAdultBirthDate(guardian.birth_date),
        // contact_email non viene scritta: la propaga il database.
        phone_prefix: guardian.phone_prefix,
        phone_number: guardian.phone_number.trim() || null,
        whatsapp_prefix: guardianWhatsappMode === "none" ? null : guardianWhatsappPrefix,
        whatsapp_number: guardianWhatsappMode === "none" ? null : guardianWhatsappNumber,
      });

      await updateProfile.mutateAsync({
        first_name: basic.first_name.trim(),
        last_name: basic.last_name.trim(),
        birth_date: basic.birth_date || null,
        gender: basic.gender || null,
        gender_identity: basic.gender_identity || null,
        guardian_user_id: user?.id ?? null,
        age_confirmed: isAdultBirthDate(basic.birth_date),
      });
      setBasicSaved(true);
      return;
    }

    await updateProfile.mutateAsync({
      first_name: basic.first_name.trim(),
      last_name: basic.last_name.trim(),
      birth_date: basic.birth_date || null,
      gender: basic.gender || null,
      gender_identity: basic.gender_identity || null,
      // contact_email non viene scritta: la propaga il database dall'account.
      phone_prefix: basic.phone_prefix,
      phone_number: basic.phone_number.trim() || null,
      whatsapp_prefix: whatsappMode === "none" ? null : whatsappPrefixToSave,
      whatsapp_number: whatsappMode === "none" ? null : whatsappNumberToSave,

      age_confirmed: true,
    });
    setBasicSaved(true);
  };

  const saveRoles = async () => {
    if (!rolesDirty) return;
    await updateProfile.mutateAsync({ talent_categories: roles.length ? roles : null });
    setRolesDirty(false);
  };

  // Ultimo step: carica la foto (obbligatoria) e chiude l'onboarding.
  const savePhoto = async () => {
    if (photoFile) {
      const media = await uploadMedia.mutateAsync({
        file: photoFile,
        mediaType: "photo",
        category: "main_photos",
      });
      if (media?.url) await updateProfile.mutateAsync({ profile_photo_url: media.url });
      setPhotoFile(null);
    }
    await updateProfile.mutateAsync({ onboarding_completed: true });
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

  // Finché l'onboarding non è concluso non esiste un profilo utilizzabile:
  // uscire significa disconnettersi.
  const leave = async () => {
    if (!profile?.onboarding_completed) {
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
      return;
    }
    navigate("/talent/profile", { replace: true });
  };

  const handleExit = () => setExitOpen(true);



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
            nextDisabled={
              (step === 1 && !basicValid) ||
              (step === 2 && roles.length === 0) ||
              (step === 3 && !photoValid)
            }
            loading={saving}
            onBack={step > 1 ? () => setStep(step - 1) : undefined}
            onNext={goNext}
          >
            {step === 1 && (
              <BasicInfoStep
                value={basic}
                errors={visibleErrors}
                whatsappError={whatsappError}
                
                onWhatsappModeChange={setWhatsappMode}
                guardian={
                  isGuardianMode
                    ? {
                        value: guardian,
                        errors: guardianVisibleErrors,
                        whatsappError: guardianWhatsappError,
                        onChange: (patch) => {
                          setBasicTouched(true);
                          setBasicSaved(false);
                          setGuardian((prev) => ({ ...prev, ...patch }));
                        },
                        onWhatsappModeChange: setGuardianWhatsappMode,
                      }
                    : undefined
                }
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
                error={roles.length === 0 ? "Seleziona almeno un ruolo per continuare" : null}
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
                error={
                  photoError ??
                  (photoValid ? null : "Carica una foto profilo per continuare")
                }
                onSelectFile={handlePhoto}
              />
            )}
          </OnboardingCard>
        </div>

        <OnboardingFooter />
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
