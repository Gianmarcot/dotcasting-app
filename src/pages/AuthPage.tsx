import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProfileCheckbox } from "@/components/profile/fields/FormFields";
import { parseSignupMode, type SignupMode } from "@/lib/signupMode";

import { it } from "@/lib/i18n";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { ParentChildIcon } from "@/components/icons/ParentChildIcon";
import logo from "@/assets/logo.png";
import slide1 from "@/assets/auth-slide-1.jpg.asset.json";
import slide2 from "@/assets/auth-slide-2.jpg.asset.json";
import slide3 from "@/assets/auth-slide-3.jpg.asset.json";
import slide4 from "@/assets/auth-slide-4.jpg.asset.json";

const SLIDES = [slide1.url, slide2.url, slide3.url, slide4.url];

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const { user, userRole, isLoading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const signupMode = parseSignupMode(searchParams.get("mode"));
  const isGuardianMode = signupMode === "guardian";

  const handleModeChange = (value: SignupMode) => {
    setSearchParams({ mode: value }, { replace: true });
  };


  // Auto-advance slider
  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

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
            toast.error("Email non confermata. Controlla la tua casella di posta.");
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
          toast.success("Registrazione completata! Puoi ora accedere.");
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

  const goPrev = () => setSlideIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const goNext = () => setSlideIndex((i) => (i + 1) % SLIDES.length);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — image slider */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0 w-[45%] max-w-[720px] overflow-hidden md:rounded-r-[2rem] bg-black">

        {SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover md:rounded-r-[2rem] transition-opacity duration-700 ease-out [transform:translateZ(0)] ${
              i === slideIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 md:rounded-r-[2rem] pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col justify-end p-10">

          <div className="flex items-end justify-between gap-6">
            <div className="text-white max-w-md">
              <h2 className="font-tenor uppercase tracking-wide text-3xl md:text-4xl leading-tight">
                La piattaforma di casting
              </h2>
              <p className="mt-3 text-sm md:text-base text-white/80">
                Crea il tuo profilo, carica i tuoi materiali e fatti notare dal mondo del casting.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Precedente"
                className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Successiva"
                className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form (no card) */}
      <div className="flex-1 min-h-screen flex items-center justify-center p-6 md:p-12">

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-1">
              <img src={logo} alt="dotCasting" className="h-8" />
            </Link>
          </div>

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
                value={email}
                onChange={setEmail}
              />

              <FloatingInput
                label={it.auth.password}
                type="password"
                value={password}
                onChange={setPassword}
              />

              {!isLogin && (
                <FloatingInput
                  label={it.auth.confirmPassword}
                  type="password"
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
                          href="/termini"
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitDisabled}
              >

                {isLoading ? it.common.loading : (isLogin ? it.auth.login : it.auth.signup)}
              </Button>
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
                  <span className="text-primary font-medium">{it.auth.signup}</span>
                </>
              ) : (
                <>
                  {it.auth.hasAccount}{" "}
                  <span className="text-primary font-medium">{it.auth.login}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
