import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Bell, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const TalentSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleting(true);
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) {
      let msg = "Non è stato possibile eliminare l'account. Riprova più tardi.";
      try {
        const body = await (error as { context?: Response }).context?.json();
        if (body?.error) msg = body.error;
      } catch { /* risposta non leggibile */ }
      toast.error(msg);
      setDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    toast.success("Account eliminato");
    navigate("/auth", { replace: true });
  };


  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div>
        <h1 className="font-display uppercase tracking-wide text-[21px] text-foreground md:text-2xl">Impostazioni Account</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le impostazioni del tuo account e le preferenze
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicurezza
          </CardTitle>
          <CardDescription>
            Gestisci le credenziali di accesso al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">
              L'email di accesso si modifica dalla pagina dei dati di accesso.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Email e password</p>
              <p className="text-sm text-muted-foreground">
                Aggiorna le credenziali di accesso al tuo account
              </p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/talent/aggiorna-accesso")}>
              Aggiorna i dati di accesso
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifiche
          </CardTitle>
          <CardDescription>
            Scegli quali notifiche ricevere
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium">Nuovi casting</p>
              <p className="text-sm text-muted-foreground">
                Ricevi notifiche quando vengono pubblicati nuovi casting
              </p>
            </div>
            <Switch defaultChecked className="shrink-0 mt-0.5" />
          </div>
          <Separator />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium">Aggiornamenti candidature</p>
              <p className="text-sm text-muted-foreground">
                Notifiche sullo stato delle tue candidature
              </p>
            </div>
            <Switch defaultChecked className="shrink-0 mt-0.5" />
          </div>
          <Separator />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium">Messaggi</p>
              <p className="text-sm text-muted-foreground">
                Ricevi notifiche per nuovi messaggi
              </p>
            </div>
            <Switch defaultChecked className="shrink-0 mt-0.5" />
          </div>
          <Separator />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium">Email promozionali</p>
              <p className="text-sm text-muted-foreground">
                Suggerimenti e novità sulla piattaforma
              </p>
            </div>
            <Switch className="shrink-0 mt-0.5" />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zona pericolosa
          </CardTitle>
          <CardDescription>
            Azioni irreversibili sul tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Elimina account</p>
              <p className="text-sm text-muted-foreground">
                Elimina permanentemente il tuo account e tutti i dati associati
              </p>
            </div>
            <AlertDialog onOpenChange={(o) => !o && setConfirmText("")}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">Elimina account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminare l'account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Profilo, foto, documenti e candidature verranno cancellati definitivamente.
                    Scrivi ELIMINA per confermare.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ELIMINA"
                  aria-label="Conferma eliminazione"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={confirmText.trim().toUpperCase() !== "ELIMINA" || deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Eliminazione…" : "Elimina definitivamente"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentSettings;
