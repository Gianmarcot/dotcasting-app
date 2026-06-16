import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const pwdSchema = z
  .object({
    password: z.string().min(8, "La password deve avere almeno 8 caratteri").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Le password non coincidono",
    path: ["confirm"],
  });

export const AccountSection = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = pwdSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password aggiornata");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante l'aggiornamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="dc-card p-6 md:p-8 space-y-4">
        <div>
          <h3 className="font-tenor uppercase tracking-wide text-lg text-foreground">
            Email di accesso
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            L'indirizzo email associato al tuo account.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled readOnly />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="dc-card p-6 md:p-8 space-y-5">
        <div>
          <h3 className="font-tenor uppercase tracking-wide text-lg text-foreground">
            Cambia password
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Minimo 8 caratteri.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nuova password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Conferma password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="rounded-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Aggiorna password
          </Button>
        </div>
      </form>
    </div>
  );
};
