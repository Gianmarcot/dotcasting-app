import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Bell, Eye, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TalentSettings = () => {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword) {
      toast.error("Inserisci la password attuale");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("La password deve avere almeno 8 caratteri");
      return;
    }
    if (!user?.email) {
      toast.error("Sessione non valida, effettua di nuovo l'accesso");
      return;
    }

    setIsLoading(true);
    try {
      // Re-authenticate to verify the current password before allowing the change.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      });
      if (signInError) {
        toast.error("La password attuale non è corretta");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success("Password aggiornata con successo!");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Errore durante l'aggiornamento della password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div>
        <h1 className="text-2xl text-foreground">Impostazioni Account</h1>
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

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email e password</p>
              <p className="text-sm text-muted-foreground">
                Aggiorna le credenziali di accesso al tuo account
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/talent/aggiorna-accesso")}>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Nuovi casting</p>
              <p className="text-sm text-muted-foreground">
                Ricevi notifiche quando vengono pubblicati nuovi casting
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aggiornamenti candidature</p>
              <p className="text-sm text-muted-foreground">
                Notifiche sullo stato delle tue candidature
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Messaggi</p>
              <p className="text-sm text-muted-foreground">
                Ricevi notifiche per nuovi messaggi
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email promozionali</p>
              <p className="text-sm text-muted-foreground">
                Suggerimenti e novità sulla piattaforma
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy
          </CardTitle>
          <CardDescription>
            Controlla la visibilità del tuo profilo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profilo pubblico</p>
              <p className="text-sm text-muted-foreground">
                Il tuo profilo può essere trovato dai casting director
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mostra età</p>
              <p className="text-sm text-muted-foreground">
                Mostra la tua età nel profilo pubblico
              </p>
            </div>
            <Switch defaultChecked />
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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Elimina account</p>
              <p className="text-sm text-muted-foreground">
                Elimina permanentemente il tuo account e tutti i dati associati
              </p>
            </div>
            <Button variant="destructive">Elimina account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentSettings;
