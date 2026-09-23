import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProfileCheckbox } from "@/components/profile/fields/FormFields";
import { parseSignupMode, type SignupMode } from "@/lib/signupMode";
import { AuthShell, TERMS_URL } from "@/components/auth/AuthShell";
import { getPendingSignupEmail, setPendingSignupEmail } from "@/lib/pendingSignup";

import { it } from "@/lib/i18n";
import { getAuthRedirectBase } from "@/lib/appUrl";
import { toast } from "sonner";
import { User } from "lucide-react";
import { ParentChildIcon } from "@/components/icons/ParentChildIcon";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, userRole, isLoading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const signupMode = parseSignupMode(searchParams.get("mode"));
  const isGuardianMode = signupMode === "guardian";

  const handleModeChange = (value: SignupMode) => {
    setSearchParams({ mode: value }, { replace: true });
  };

  // Registrazione in attesa di verifica: riporta l'utente alla schermata di attesa
  useEffect(() => {
    if (authLoading || user) return;
    const pending = getPendingSignupEmail();
    if (pending) {
      navigate("/verifica-email", { state: { email: pending }, replace: true });
    }
  }, [authLoading, user, navigate]);

  // Redirect if already logged in - check onboarding for talents
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (user && !authLoading && userRole) {
        if (userRole === "owner" || userRole === "admin" || userRole === "editor") {
          navigate("/owner", { replace: true });
        } else if (userRole === "talent") {
          const { data } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data?.onboarding_completed) {
            navigate("/talent", { replace: true });
          } else {
            navigate("/talent/onboarding", { replace: true });
          }
        }
      }
    };

    checkAndRedirect();
  }, [user, userRole, authLoading, navigate]);

  const consentsValid = isLogin || (termsAccepted && ageConfirmed);
  const submitDisabled = isLoading || !consentsValid;

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Inserisci la tua email per ricevere il link di recupero");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAuthRedirectBase()}/reset-password`,
    });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ti abbiamo inviato un'email per reimpostare la password.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!email || !password) {
      toast.error(it.validation.required);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error(it.validation.passwordMatch);
      return;
    }

    if (password.length < 8) {
      toast.error(it.validation.passwordMin);
      return;
    }

    if (!consentsValid) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Credenziali non valide. Verifica email e password.");
          } else if (error.message.includes("Email not confirmed")) {
            setPendingSignupEmail(email);
            navigate("/verifica-email", { state: { email, password } });
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Accesso effettuato!");
        }
      } else {
        const { error } = await signUp(email, password, { signupMode });
        if (error) {
          if (error.message.includes("already registered") || error.message.includes("User already registered")) {
            toast.error("Questa email è già registrata. Prova ad accedere.");
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
        } else {
          setPendingSignupEmail(email);
          navigate("/verifica-email", { state: { email, password } });
        }
      }
    } catch (error) {
      toast.error("Si è verificato un errore. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell>
      <div className="text-center mb-8 space-y-1">
        <h1 className="font-tenor uppercase tracking-wide text-2xl md:text-3xl text-foreground">
          {isLogin
            ? it.auth.loginTitle
            : isGuardianMode
              ? "Crea l'account come tutore"
              : it.auth.signupTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin
            ? it.auth.loginSubtitle
            : isGuardianMode
              ? "Gestirai tu il profilo della persona di cui sei tutore"
              : it.auth.signupSubtitle}
        </p>

        {!isLogin && (
          <div className="pt-3 space-y-3">
            <SegmentedControl
              aria-label="Modalità di registrazione"
              value={signupMode}
              onChange={handleModeChange}
              options={[
                {
                  value: "self",
                  label: "Mi registro",
                  icon: <User size={48} strokeWidth={1} />,
                },
                {
                  value: "guardian",
                  label: "Registro un minore",
                  icon: <ParentChildIcon size={48} />,
                },
              ]}
            />
            <div className="grid place-items-center text-xs font-medium text-center text-[var(--grey-600)]">
              <span className="col-start-1 row-start-1 invisible px-4">
                Crei un profilo per te.
              </span>
              <span className="col-start-1 row-start-1 invisible px-4">
                Crei un profilo per un minore o un adulto di cui sei tutore.
              </span>
              <span className="col-start-1 row-start-1">
                {isGuardianMode
                  ? "Crei un profilo per un minore o un adulto di cui sei tutore."
                  : "Crei un profilo per te."}
              </span>
            </div>
          </div>
        )}
      </div>

      <Surface variant="muted" className="bg-transparent">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label={it.auth.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
          />

          <FloatingInput
            label={it.auth.password}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />

          {!isLogin && (
            <FloatingInput
              label={it.auth.confirmPassword}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={
                confirmPassword && confirmPassword !== password
                  ? it.validation.passwordMatch
                  : null
              }
            />
          )}

          {!isLogin && (
            <div className="space-y-3 pt-2">
              <ProfileCheckbox
                checked={termsAccepted}
                onCheckedChange={setTermsAccepted}
                label={
                  <span className="text-[15px] text-foreground">
                    Ho letto e accetto i{" "}
                    <a
                      href={TERMS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      termini e le condizioni
                    </a>
                  </span>
                }
              />
              <ProfileCheckbox
                checked={ageConfirmed}
                onCheckedChange={setAgeConfirmed}
                label={
                  <span className="text-[15px] text-foreground">
                    {isGuardianMode
                      ? "Confermo di essere maggiorenne e tutore legale"
                      : "Confermo di aver compiuto 18 anni"}
                  </span>
                }
              />
              {submitted && !consentsValid && (
                <p className="text-xs text-destructive">
                  Devi accettare i termini e confermare di essere maggiorenne per continuare
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="h-12 w-full" size="lg" disabled={submitDisabled}>
            {isLoading ? it.common.loading : (isLogin ? it.auth.login : it.auth.signup)}
          </Button>

          {isLogin && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary font-medium hover:underline transition-colors"
              >
                {it.auth.forgotPassword}
              </button>
            </div>
          )}
        </form>
      </Surface>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? (
            <>
              {it.auth.noAccount}{" "}
              <span className="text-primary font-medium hover:underline">{it.auth.signup}</span>
            </>
          ) : (
            <>
              {it.auth.hasAccount}{" "}
              <span className="text-primary font-medium hover:underline">{it.auth.login}</span>
            </>
          )}
        </button>
      </div>
    </AuthShell>
  );
};

export default AuthPage;
