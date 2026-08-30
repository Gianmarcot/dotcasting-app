import { useEffect, useState } from "react";
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
import {
  clearEmailChangePending,
  getPendingEmail,
  markCredentialsUpdated,
  markEmailChangePending,
  needsCredentialsUpdate,
} from "@/lib/signupMode";

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

  // Cambio email in attesa di conferma: sopravvive al ricaricamento perché
  // vive sui metadati dell'account.
  const pendingEmail = getPendingEmail(user);

  useEffect(() => {
    // Conferma avvenuta: l'account ha la nuova email, lo stato di attesa si chiude.
    const requested = user?.user_metadata?.pending_email;
    if (typeof requested === "string" && requested && !pendingEmail) {
      void clearEmailChangePending();
    }
  }, [user, pendingEmail]);

  const fromGuardianship = needsCredentialsUpdate(user, profile?.guardian_user_id ?? null);

  const passwordError =
    password && password.length < 8 ? "Almeno 8 caratteri" : undefined;
  const password2Error =
    password2 && password2 !== password ? "Le password non coincidono" : undefined;

  const submit = async () => {
    if (passwordError || password2Error) return;
    setPending(true);
    try {
      const emailChanged = !!email.trim() && email.trim() !== user?.email;
      if (emailChanged || password) {
        const { error } = await supabase.auth.updateUser({
          ...(emailChanged ? { email: email.trim() } : {}),
          ...(password ? { password } : {}),
        });
        if (error) throw error;
      }
      if (emailChanged) await markEmailChangePending(email.trim());

      const waPrefix = whatsappMode === "same" ? phone.phone_prefix : phone.whatsapp_prefix;
      const waNumber =
        (whatsappMode === "same" ? phone.phone_number : phone.whatsapp_number).trim() || null;

      // contact_email non viene scritta: la propaga il database quando il
      // cambio dell'email dell'account viene confermato.
      await updateProfile.mutateAsync({
        phone_prefix: phone.phone_prefix,
        phone_number: phone.phone_number.trim() || null,
        whatsapp_prefix: whatsappMode === "none" ? null : waPrefix,
        whatsapp_number: whatsappMode === "none" ? null : waNumber,
      });

      await markCredentialsUpdated();
      if (emailChanged) {
        toast.success(
          `Dati aggiornati. Conferma la nuova email dal link inviato a ${email.trim()}.`
        );
      } else {
        toast.success("Dati di accesso aggiornati");
        navigate("/talent/profile");
      }
    } catch (error) {
      console.error("update access:", error);
      toast.error("Aggiornamento non riuscito. Riprova.");
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (!pendingEmail) return;
    const { error } = await supabase.auth.updateUser({ email: pendingEmail });
    if (error) {
      console.error("resend email change:", error);
      toast.error("Invio non riuscito. Riprova.");
      return;
    }
    await markEmailChangePending(pendingEmail);
    toast.success(`Link inviato di nuovo a ${pendingEmail}`);
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
          {fromGuardianship
            ? "Il profilo era gestito da un genitore o tutore: email, telefono e password attuali sono i suoi, e conosce anche la password. Aggiornali per essere l'unico a poter accedere."
            : "Cambia l'email di accesso, il telefono o la password. Il nuovo indirizzo diventa attivo solo dopo la conferma dal link che ti inviamo."}
        </p>

        <div>
          <FloatingInput
            label="Email di accesso"
            type="email"
            value={email}
            onChange={setEmail}
          />
          {pendingEmail ? (
            <div className="mt-3 rounded-[20px] bg-field px-5 py-4">
              <p className="text-[15px] text-foreground">
                Cambio email in attesa di conferma.
              </p>
              <p className="mt-1 text-[13px] text-field-label">
                Abbiamo inviato un link a <strong>{pendingEmail}</strong>. Fino al click resta
                attiva <strong>{user?.email}</strong>.
              </p>
              <button
                type="button"
                className="dc-link-action mt-3 inline-block"
                onClick={() => void resend()}
              >
                Invia di nuovo
              </button>
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-field-label">
              Indirizzo attualmente in vigore: <strong>{user?.email}</strong>.
            </p>
          )}
        </div>

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
