import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type InviteInfo = { email?: string; role?: string; status?: string };

export default function AcceptInvitation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.rpc("get_invitation_by_token", { p_token: token });
      setInfo((data ?? {}) as InviteInfo);
      setLoading(false);
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La password deve avere almeno 8 caratteri");
      return;
    }
    if (password !== confirm) {
      toast.error("Le password non coincidono");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("accept-team-invitation", {
        body: { token, password },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Account creato, ora puoi accedere");
      navigate("/auth", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Errore");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const valid = info && info.email && info.status === "pending";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="dc-card p-8 max-w-md w-full space-y-6">
        <div>
          <h1 className="font-tenor uppercase tracking-wide text-2xl text-foreground">
            Attiva il tuo account
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {valid
              ? `Sei stato invitato come ${info?.role === "admin" ? "Admin" : "Owner"}. Imposta una password per ${info?.email}.`
              : "L'invito non è valido o è scaduto."}
          </p>
        </div>

        {valid ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwd">Password</Label>
              <Input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpwd">Conferma password</Label>
              <Input
                id="cpwd"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crea account
            </Button>
          </form>
        ) : (
          <Button onClick={() => navigate("/auth")} className="w-full rounded-full">
            Vai al login
          </Button>
        )}
      </div>
    </div>
  );
}
