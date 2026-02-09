import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { it } from "@/lib/i18n";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, userRole, isLoading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in - check onboarding for talents
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (user && !authLoading && userRole) {
        if (userRole === "owner" || userRole === "admin") {
          navigate("/owner", { replace: true });
        } else if (userRole === "talent") {
          // Check if onboarding is complete
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          // Navigation will happen via useEffect when user state updates
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered") || error.message.includes("User already registered")) {
            toast.error("Questa email è già registrata. Prova ad accedere.");
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Registrazione completata! Puoi ora accedere.");
          // With auto-confirm, the user will be logged in automatically via onAuthStateChange
        }
      }
    } catch (error) {
      toast.error("Si è verificato un errore. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1">
            <img src={logo} alt="dotCasting" className="h-8" />
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              {isLogin ? it.auth.loginTitle : it.auth.signupTitle}
            </CardTitle>
            <CardDescription>
              {isLogin ? it.auth.loginSubtitle : it.auth.signupSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{it.auth.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{it.auth.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{it.auth.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? it.common.loading : (isLogin ? it.auth.login : it.auth.signup)}
              </Button>
            </form>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
