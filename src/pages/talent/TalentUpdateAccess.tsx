import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { FloatingInput } from "@/components/ui/field";
import { SectionCard } from "@/components/profile/fields/FormFields";
import { PhoneFields, deriveWhatsappMode, type WhatsappMode } from "@/components/profile/fields/BasicInfoFields";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { markCredentialsUpdated } from "@/lib/signupMode";

/**
 * Passaggio dopo la conversione di un profilo tutelato: email, telefono e
 * password sono ancora del genitore. Insistente ma non bloccante.
 */
const TalentUpdateAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phone, setPhone] = useState({
    phone_prefix: profile?.phone_prefix ?? "+39",
    phone_number: profile?.phone_number ?? "",
    whatsapp_prefix: profile?.whatsapp_prefix ?? profile?.phone_prefix ?? "+39",
    whatsapp_number: profile?.whatsapp_number ?? "",
  });
  const [whatsappMode, setWhatsappMode] = useState<WhatsappMode>(() =>
    deriveWhatsappMode({
      phone_prefix: profile?.phone_prefix ?? "+39",
      phone_number: profile?.phone_number ?? "",
      whatsapp_prefix: profile?.whatsapp_prefix ?? "+39",
      whatsapp_number: profile?.whatsapp_number ?? "",
    })
  );
  const [pending, setPending] = useState(false);

  const passwordError =
    password && password.length < 8 ? "Almeno 8 caratteri" : undefined;
  const password2Error =
    password2 && password2 !== password ? "Le password non coincidono" : undefined;

  const submit = async () => {
    if (passwordError || password2Error) return;
    setPending(true);
    try {
      const emailChanged = email.trim() && email.trim() !== user?.email;
      if (emailChanged || password) {
        const { error } = await supabase.auth.updateUser({
          ...(emailChanged ? { email: email.trim() } : {}),
          ...(password ? { password } : {}),
        });
        if (error) throw error;
      }

      const waPrefix = whatsappMode === "same" ? phone.phone_prefix : phone.whatsapp_prefix;
      const waNumber =
        (whatsappMode === "same" ? phone.phone_number : phone.whatsapp_number).trim() || null;

      await updateProfile.mutateAsync({
        contact_email: email.trim() || null,
        phone_prefix: phone.phone_prefix,
        phone_number: phone.phone_number.trim() || null,
        whatsapp_prefix: whatsappMode === "none" ? null : waPrefix,
        whatsapp_number: whatsappMode === "none" ? null : waNumber,
      });

      await markCredentialsUpdated();
      toast.success(
        emailChanged
          ? "Dati aggiornati. Conferma la nuova email dal link che ti abbiamo inviato."
          : "Dati di accesso aggiornati"
      );
      navigate("/talent/profile");
    } catch (error) {
      console.error("update access:", error);
      toast.error("Aggiornamento non riuscito. Riprova.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Surface variant="muted" className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-8 sm:pt-16">
      <button
        type="button"
        onClick={() => navigate("/talent/profile")}
        className="dc-link-action mb-8 inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Torna al profilo
      </button>

      <SectionCard icon={<KeyRound strokeWidth={1} />} title="Aggiorna i dati di accesso">
        <p className="text-[15px] text-field-label">
          Il profilo era gestito da un genitore o tutore: email, telefono e password attuali sono
          i suoi, e conosce anche la password. Aggiornali per essere l'unico a poter accedere.
        </p>

        <FloatingInput label="Email di accesso" type="email" value={email} onChange={setEmail} />

        <PhoneFields
          value={phone}
          onChange={(patch) => setPhone((prev) => ({ ...prev, ...patch }))}
          onModeChange={setWhatsappMode}
        />

        <FloatingInput
          label="Nuova password"
          type="password"
          value={password}
          error={passwordError}
          onChange={setPassword}
        />
        <FloatingInput
          label="Conferma nuova password"
          type="password"
          value={password2}
          error={password2Error}
          onChange={setPassword2}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate("/talent/profile")}
          >
            Lo faccio dopo
          </Button>
          <Button type="button" size="lg" disabled={pending} onClick={() => void submit()}>
            Salva e continua
          </Button>
        </div>
      </SectionCard>
    </Surface>
  );
};

export default TalentUpdateAccess;
