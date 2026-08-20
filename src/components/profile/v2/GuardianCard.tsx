import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/profile/fields/FormFields";
import {
  GuardianFields,
  EMPTY_GUARDIAN,
  validateGuardian,
  type GuardianErrors,
  type GuardianValue,
} from "@/components/profile/fields/GuardianFields";
import {
  deriveWhatsappMode,
  isWhatsappValid,
  type WhatsappMode,
} from "@/components/profile/fields/BasicInfoFields";
import { useGuardian, useUpdateGuardian } from "@/hooks/useGuardian";
import { isAdultBirthDate } from "@/lib/guardianship";

/**
 * Dati del tutore di un profilo tutelato. Vive fuori dal form del profilo
 * (scrive su `guardians`) e ha un salvataggio dedicato.
 */
export const GuardianCard = ({ guardianUserId }: { guardianUserId: string }) => {
  const { data: row } = useGuardian(guardianUserId);
  const updateGuardian = useUpdateGuardian();

  const [value, setValue] = useState<GuardianValue>(EMPTY_GUARDIAN);
  const [touched, setTouched] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState<WhatsappMode>("same");

  useEffect(() => {
    if (!row) return;
    const next: GuardianValue = {
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      birth_date: row.birth_date ?? "",
      contact_email: row.contact_email ?? "",
      phone_prefix: row.phone_prefix ?? "+39",
      phone_number: row.phone_number ?? "",
      whatsapp_prefix: row.whatsapp_prefix ?? row.phone_prefix ?? "+39",
      whatsapp_number: row.whatsapp_number ?? "",
    };
    setValue(next);
    setWhatsappMode(deriveWhatsappMode(next));
  }, [row]);

  const errors: GuardianErrors = validateGuardian(value);
  const whatsappValid = isWhatsappValid(whatsappMode, value);
  const canSave = Object.keys(errors).length === 0 && whatsappValid && touched;

  const save = async () => {
    const waPrefix = whatsappMode === "same" ? value.phone_prefix : value.whatsapp_prefix;
    const waNumber =
      (whatsappMode === "same" ? value.phone_number : value.whatsapp_number).trim() || null;
    try {
      await updateGuardian.mutateAsync({
        first_name: value.first_name.trim(),
        last_name: value.last_name.trim(),
        birth_date: value.birth_date || null,
        age_confirmed: isAdultBirthDate(value.birth_date),
        contact_email: value.contact_email.trim() || null,
        phone_prefix: value.phone_prefix,
        phone_number: value.phone_number.trim() || null,
        whatsapp_prefix: whatsappMode === "none" ? null : waPrefix,
        whatsapp_number: whatsappMode === "none" ? null : waNumber,
      });
      setTouched(false);
      toast.success("Dati del tutore aggiornati");
    } catch (error) {
      console.error("guardian save:", error);
      toast.error("Errore nel salvataggio. Riprova.");
    }
  };

  return (
    <SectionCard icon={<ShieldCheck strokeWidth={1} />} title="Tutore legale/genitore">
      <p className="text-[15px] text-field-label">
        Questi sono i contatti usati dall'agenzia per il profilo tutelato.
      </p>

      <GuardianFields
        value={value}
        errors={touched ? errors : {}}
        whatsappError={touched && !whatsappValid ? "Inserisci un numero WhatsApp valido" : undefined}
        onChange={(patch) => {
          setTouched(true);
          setValue((prev) => ({ ...prev, ...patch }));
        }}
        onWhatsappModeChange={(mode) => {
          setTouched(true);
          setWhatsappMode(mode);
        }}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={!canSave || updateGuardian.isPending}
          onClick={() => void save()}
        >
          Salva dati del tutore
        </Button>
      </div>
    </SectionCard>
  );
};

export default GuardianCard;
