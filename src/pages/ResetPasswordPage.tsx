import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Il link di recupero crea una sessione temporanea: attendiamo che sia attiva.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La password deve contenere almeno 8 caratteri");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password aggiornata!");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1">
            <img src={logo} alt="dotCasting" className="h-8" />
          </Link>
        </div>

        <div className="text-center mb-8 space-y-1">
          <h1 className="font-tenor uppercase tracking-wide text-2xl md:text-3xl text-foreground">
            Imposta una nuova password
          </h1>
          <p className="text-sm text-muted-foreground">
            {ready
              ? "Scegli una nuova password per il tuo account"
              : "Apri questa pagina dal link ricevuto via email"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Nuova password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
          />
          <FloatingInput
            label="Conferma password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={
              confirmPassword && confirmPassword !== password
                ? "Le password non coincidono"
                : null
            }
          />
          <Button type="submit" size="lg" className="w-full" disabled={isLoading || !ready}>
            {isLoading ? "Caricamento..." : "Aggiorna password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Torna all'accesso
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
