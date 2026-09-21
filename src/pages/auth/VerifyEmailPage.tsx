import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectBase } from "@/lib/appUrl";
import {
  clearPendingSignupEmail,
  getPendingSignupEmail,
  setPendingSignupEmail,
} from "@/lib/pendingSignup";

const RESEND_DELAY = 60;

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as { email?: string; password?: string };

  const [email, setEmail] = useState(state.email ?? getPendingSignupEmail() ?? "");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_DELAY);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const passwordRef = useRef<string | undefined>(state.password);

  const redirectTo = `${getAuthRedirectBase()}/email-confermata`;

  useEffect(() => {
    if (email) setPendingSignupEmail(email);
  }, [email]);

  useEffect(() => {
    if (!email) navigate("/auth", { replace: true });
  }, [email, navigate]);

  // Conto alla rovescia
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  // Avanzamento automatico appena la verifica risulta avvenuta
  const goOnboarding = useCallback(() => {
    clearPendingSignupEmail();
    navigate("/talent/onboarding", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const check = (session: { user?: { email_confirmed_at?: string | null } } | null) => {
      if (session?.user?.email_confirmed_at) goOnboarding();
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => check(session));

    void supabase.auth.getSession().then(({ data }) => check(data.session));

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void supabase.auth.getSession().then(({ data }) => check(data.session));
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [goOnboarding]);

  const handleResend = async () => {
    setIsBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setIsBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSecondsLeft(RESEND_DELAY);
    setStatusMessage("Ti abbiamo inviato un nuovo link.");
  };

  const handleChangeEmail = async () => {
    const value = newEmail.trim();
    if (!value) return;
    setIsBusy(true);

    const { data: sessionData } = await supabase.auth.getSession();

    let error: { message: string } | null = null;
    if (sessionData.session) {
      const res = await supabase.auth.updateUser({ email: value }, { emailRedirectTo: redirectTo });
      error = res.error;
    } else if (passwordRef.current) {
      const res = await supabase.auth.signUp({
        email: value,
        password: passwordRef.current,
        options: { emailRedirectTo: redirectTo },
      });
      error = res.error;
    } else {
      setIsBusy(false);
      navigate("/auth", { replace: true });
      return;
    }

    setIsBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setEmail(value);
    setNewEmail("");
    setEditing(false);
    setSecondsLeft(RESEND_DELAY);
    setStatusMessage("Ti abbiamo inviato il link al nuovo indirizzo.");
  };

  const waiting = secondsLeft > 0;

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-8 text-center">
        <Mail className="h-12 w-12 text-foreground" strokeWidth={1} aria-hidden />

        <div className="space-y-4">
          <h1 className="font-tenor text-2xl uppercase tracking-wide text-foreground">
            Controlla la tua email
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Abbiamo inviato un link di conferma a
            <br />
            <span className="select-text text-foreground">{email}</span>
            <br />
            <br />
            Aprilo per attivare il profilo. Se non lo trovi, controlla spam e promozioni.
          </p>
        </div>

        {editing ? (
          <Surface variant="muted" className="w-full bg-transparent">
            <div className="w-full space-y-3">
              <FloatingInput
                label="Nuovo indirizzo email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={newEmail}
                onChange={setNewEmail}
              />
              <Button
                className="h-12 w-full"
                size="lg"
                onClick={handleChangeEmail}
                disabled={isBusy || !newEmail.trim()}
              >
                Conferma indirizzo
              </Button>
              <Button
                variant="secondary"
                className="h-12 w-full"
                size="lg"
                onClick={() => {
                  setEditing(false);
                  setNewEmail("");
                }}
                disabled={isBusy}
              >
                Annulla
              </Button>
            </div>
          </Surface>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <Button
              className="h-12 w-full"
              size="lg"
              onClick={handleResend}
              disabled={waiting || isBusy}
            >
              Invia di nuovo
            </Button>
            <Button
              variant="secondary"
              className="h-12 w-full"
              size="lg"
              onClick={() => setEditing(true)}
              disabled={isBusy}
            >
              Ho sbagliato indirizzo
            </Button>
          </div>
        )}

        {/* Riga di stato: spazio sempre riservato */}
        <p
          className="min-h-5 text-sm font-medium text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {waiting ? (
            <span aria-hidden>{`Invia di nuovo tra ${secondsLeft}s`}</span>
          ) : (
            statusMessage ?? <span className="sr-only">Puoi inviare di nuovo il link.</span>
          )}
        </p>
      </div>
    </AuthShell>
  );
};

export default VerifyEmailPage;
