import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck, MailWarning, MailX } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectBase } from "@/lib/appUrl";
import { clearPendingSignupEmail, getPendingSignupEmail } from "@/lib/pendingSignup";

type Outcome = "loading" | "confirmed" | "expired" | "already";

export const EmailConfirmedPage = () => {
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<Outcome>("loading");
  const [isBusy, setIsBusy] = useState(false);

  const hashParams = useMemo(
    () => new URLSearchParams(window.location.hash.replace(/^#/, "")),
    [],
  );

  useEffect(() => {
    const error = hashParams.get("error_code") ?? hashParams.get("error");
    const description = (hashParams.get("error_description") ?? "").toLowerCase();

    if (error) {
      setOutcome(description.includes("already") ? "already" : "expired");
      return;
    }

    let done = false;
    const resolve = (confirmed: boolean) => {
      if (done) return;
      if (confirmed) {
        done = true;
        clearPendingSignupEmail();
        setOutcome("confirmed");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      resolve(Boolean(session?.user?.email_confirmed_at)),
    );

    void supabase.auth.getSession().then(({ data }) => {
      resolve(Boolean(data.session?.user?.email_confirmed_at));
      setTimeout(() => {
        if (!done) setOutcome("expired");
      }, 2500);
    });

    return () => subscription.unsubscribe();
  }, [hashParams]);

  // Se l'utente non agisce, prosegui comunque
  useEffect(() => {
    if (outcome !== "confirmed") return;
    const id = setTimeout(() => navigate("/talent/onboarding", { replace: true }), 5000);
    return () => clearTimeout(id);
  }, [outcome, navigate]);

  const handleNewLink = async () => {
    const email = getPendingSignupEmail();
    if (!email) {
      navigate("/auth", { replace: true });
      return;
    }
    setIsBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${getAuthRedirectBase()}/email-confermata` },
    });
    setIsBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate("/verifica-email", { state: { email }, replace: true });
  };

  const content = {
    loading: {
      icon: <MailCheck className="h-12 w-12 text-foreground" strokeWidth={1} aria-hidden />,
      title: "Verifica in corso",
      body: "Stiamo controllando il tuo link di conferma.",
      action: null as React.ReactNode,
    },
    confirmed: {
      icon: <MailCheck className="h-12 w-12 text-foreground" strokeWidth={1} aria-hidden />,
      title: "Email confermata",
      body: "Il tuo account è attivo. Ora completiamo il profilo.",
      action: (
        <Button
          className="h-12 w-full"
          size="lg"
          onClick={() => navigate("/talent/onboarding", { replace: true })}
        >
          Inizia
        </Button>
      ),
    },
    expired: {
      icon: <MailWarning className="h-12 w-12 text-foreground" strokeWidth={1} aria-hidden />,
      title: "Questo link non è più valido",
      body: "I link di conferma scadono dopo un po' per sicurezza. Richiedine uno nuovo.",
      action: (
        <Button className="h-12 w-full" size="lg" onClick={handleNewLink} disabled={isBusy}>
          Invia un nuovo link
        </Button>
      ),
    },
    already: {
      icon: <MailX className="h-12 w-12 text-foreground" strokeWidth={1} aria-hidden />,
      title: "Hai già confermato questa email",
      body: "Il tuo account è attivo: puoi accedere.",
      action: (
        <Button className="h-12 w-full" size="lg" onClick={() => navigate("/auth")}>
          Vai all'accesso
        </Button>
      ),
    },
  }[outcome];

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-8 text-center">
        {content.icon}

        <div className="space-y-4">
          <h1 className="font-tenor text-2xl uppercase tracking-wide text-foreground">
            {content.title}
          </h1>
          <p className="text-sm font-medium text-muted-foreground">{content.body}</p>
        </div>

        {content.action && <div className="flex w-full flex-col gap-3">{content.action}</div>}
      </div>
    </AuthShell>
  );
};

export default EmailConfirmedPage;
