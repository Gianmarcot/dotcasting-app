import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { FloatingInput } from "@/components/ui/field";
import { PillTabs } from "@/components/ui/pill-tabs";
import { SectionCard } from "@/components/profile/fields/FormFields";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  clearEmailChangePending,
  getPendingEmail,
  markCredentialsUpdated,
  markEmailChangePending,
  needsCredentialsUpdate,
} from "@/lib/signupMode";

type Tab = "email" | "password";

/**
 * Unico punto di modifica delle credenziali: email di accesso e password,
 * separate in due tab. Il telefono si modifica dalla pagina profilo.
 */
const TalentUpdateAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const [tab, setTab] = useState<Tab>("email");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
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

  const passwordError = password && password.length < 8 ? "Almeno 8 caratteri" : undefined;
  const password2Error =
    password2 && password2 !== password ? "Le password non coincidono" : undefined;

  const submitEmail = async () => {
    const next = email.trim();
    if (!next || next === user?.email) {
      toast.error("Inserisci un indirizzo diverso da quello attuale");
      return;
    }
    setPending(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: next });
      if (error) throw error;
      await markEmailChangePending(next);
      await markCredentialsUpdated();
      toast.success(`Conferma la nuova email dal link inviato a ${next}.`);
    } catch (error) {
      console.error("update email:", error);
      toast.error("Aggiornamento non riuscito. Riprova.");
    } finally {
      setPending(false);
    }
  };

  const submitPassword = async () => {
    if (!password) {
      toast.error("Inserisci la nuova password");
      return;
    }
    if (passwordError || password2Error || password !== password2) {
      toast.error("Controlla la nuova password e la conferma");
      return;
    }
    // Chi arriva dalla tutela non conosce una "propria" password attuale.
    if (!fromGuardianship && !currentPassword) {
      toast.error("Inserisci la password attuale");
      return;
    }
    setPending(true);
    try {
      if (!fromGuardianship) {
        if (!user?.email) {
          toast.error("Sessione non valida, effettua di nuovo l'accesso");
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (signInError) {
          toast.error("La password attuale non è corretta");
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await markCredentialsUpdated();
      setCurrentPassword("");
      setPassword("");
      setPassword2("");
      toast.success("Password aggiornata");
      navigate("/talent/profile");
    } catch (error) {
      console.error("update password:", error);
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
    <Surface variant="base" className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-8 sm:pt-16">
      <button
        type="button"
        onClick={() => navigate("/talent/profile")}
        className="dc-link-action mb-8 inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Torna al profilo
      </button>

      <SectionCard
        className="rounded-3xl"
        icon={<KeyRound strokeWidth={1} />}
        title="Aggiorna i dati di accesso"
      >
        <p className="text-[15px] text-field-label">
          {fromGuardianship
            ? "Il profilo era gestito da un genitore o tutore: email e password attuali sono le sue. Aggiornale per essere l'unico a poter accedere."
            : "Cambia l'email di accesso oppure la password. Il nuovo indirizzo diventa attivo solo dopo la conferma dal link che ti inviamo."}
        </p>

        <div className="flex justify-center">
          <PillTabs
            ariaLabel="Dato da aggiornare"
            value={tab}
            onChange={(next) => setTab(next)}
            options={[
              { value: "email" as const, label: "Email", icon: Mail },
              { value: "password" as const, label: "Password", icon: Lock },
            ]}
          />
        </div>

        {tab === "email" ? (
          <>
            <div>
              <FloatingInput
                label="Email di accesso"
                type="email"
                value={email}
                onChange={setEmail}
              />
              {pendingEmail ? (
                <div className="mt-3 rounded-2xl bg-field px-5 py-4">
                  <p className="text-[15px] text-foreground">Cambio email in attesa di conferma.</p>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate("/talent/profile")}
              >
                {fromGuardianship ? "Lo faccio dopo" : "Annulla"}
              </Button>
              <Button type="button" size="lg" disabled={pending} onClick={() => void submitEmail()}>
                Aggiorna email
              </Button>
            </div>
          </>
        ) : (
          <>
            {!fromGuardianship && (
              <FloatingInput
                label="Password attuale"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
            )}
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
                {fromGuardianship ? "Lo faccio dopo" : "Annulla"}
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={pending}
                onClick={() => void submitPassword()}
              >
                Aggiorna password
              </Button>
            </div>
          </>
        )}
      </SectionCard>
    </Surface>
  );
};

export default TalentUpdateAccess;
