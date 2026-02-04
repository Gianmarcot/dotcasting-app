import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { it } from "@/lib/i18n";
import { toast } from "sonner";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Accesso effettuato!");
          navigate("/talent");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Questa email è già registrata. Prova ad accedere.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Registrazione completata! Controlla la tua email per confermare l'account.");
        }
      }
    } catch (error) {
      toast.error("Si è verificato un errore. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1">
            <span className="text-muted-foreground text-lg">dot</span>
            <span className="text-3xl font-semibold text-foreground">Casting</span>
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
