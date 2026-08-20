import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isAdultBirthDate } from "@/lib/guardianship";

const NoticeShell = ({
  icon,
  title,
  children,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) => (
  <div className="dc-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex gap-4">
      <span className="mt-0.5 shrink-0 text-amber">{icon}</span>
      <div>
        <h2 className="font-display text-base uppercase tracking-wide text-foreground">{title}</h2>
        <p className="mt-2 max-w-2xl text-[15px] text-field-label">{children}</p>
      </div>
    </div>
    <div className="shrink-0">{action}</div>
  </div>
);

/**
 * Avviso di conversione: compare quando la data di nascita indica 18 anni
 * compiuti e il profilo è ancora tutelato. La conversione è sempre esplicita.
 */
export const MaturityNotice = ({
  birthDate,
  guardianUserId,
}: {
  birthDate: string | null | undefined;
  guardianUserId: string | null | undefined;
}) => {
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!guardianUserId || !isAdultBirthDate(birthDate)) return null;

  const convert = async () => {
    setPending(true);
    try {
      const { error } = await supabase.rpc("convert_guardian_profile_to_adult");
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profilo convertito: ora è intestato a te");
      navigate("/talent/aggiorna-accesso");
    } catch (error) {
      console.error("convert profile:", error);
      toast.error("Conversione non riuscita. Riprova.");
    } finally {
      setPending(false);
    }
  };

  return (
    <NoticeShell
      icon={<AlertTriangle strokeWidth={1.5} className="h-6 w-6" />}
      title="Hai compiuto 18 anni"
      action={
        <Button type="button" size="lg" disabled={pending} onClick={() => void convert()}>
          Converti in profilo autonomo
        </Button>
      }
    >
      Il profilo è ancora gestito da un tutore. Convertilo per gestirlo in autonomia: i dati
      del profilo restano invariati.
    </NoticeShell>
  );
};

/**
 * Dopo la conversione: invito insistente ma non bloccante ad aggiornare le
 * credenziali, che sono ancora quelle del genitore.
 */
export const UpdateAccessNotice = ({ show }: { show: boolean }) => {
  const navigate = useNavigate();
  if (!show) return null;

  return (
    <NoticeShell
      icon={<KeyRound strokeWidth={1.5} className="h-6 w-6" />}
      title="Aggiorna i tuoi dati di accesso"
      action={
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => navigate("/talent/aggiorna-accesso")}
        >
          Aggiorna ora
        </Button>
      }
    >
      Email, telefono e password sono ancora quelli del genitore, che conosce anche la password.
      Aggiornali per essere l'unico a poter accedere al profilo.
    </NoticeShell>
  );
};
