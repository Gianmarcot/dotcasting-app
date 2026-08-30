import { GroupLabel, ProfileCheckbox } from "@/components/profile/fields/FormFields";
import { AccountEmailField } from "@/components/profile/fields/AccountEmailField";
import {
  BirthDateFields,
  NameFields,
  PhoneFields,
  type WhatsappMode,
} from "@/components/profile/fields/BasicInfoFields";
import { isAdultBirthDate } from "@/lib/guardianship";



/* --------------------------------------------------------------------------
 * Campi del tutore legale / genitore. Scrivono su `guardians`: sono gli unici
 * contatti di un profilo tutelato. Riusano gli stessi gruppi di campi del
 * profilo talent: nessun form nuovo.
 *
 * Nessun campo email: l'email del tutore è quella dell'account, propagata dal
 * database su `profiles.contact_email`. Il client non la scrive mai.
 * ------------------------------------------------------------------------ */

export interface GuardianValue {
  first_name: string;
  last_name: string;
  birth_date: string;
  phone_prefix: string;
  phone_number: string;
  whatsapp_prefix: string;
  whatsapp_number: string;
}

export type GuardianErrors = Partial<Record<keyof GuardianValue, string>>;

export const EMPTY_GUARDIAN: GuardianValue = {
  first_name: "",
  last_name: "",
  birth_date: "",
  phone_prefix: "+39",
  phone_number: "",
  whatsapp_prefix: "+39",
  whatsapp_number: "",
};

export const validateGuardian = (value: GuardianValue): GuardianErrors => {
  const errors: GuardianErrors = {};
  if (!value.first_name.trim()) errors.first_name = "Inserisci il nome del tutore";
  if (!value.last_name.trim()) errors.last_name = "Inserisci il cognome del tutore";
  if (!value.birth_date) errors.birth_date = "Inserisci la data di nascita del tutore";
  else if (!isAdultBirthDate(value.birth_date))
    errors.birth_date = "Il tutore deve essere maggiorenne";
  if (!value.phone_number.trim()) errors.phone_number = "Inserisci un numero di telefono";
  else if (value.phone_number.replace(/\D/g, "").length < 6)
    errors.phone_number = "Numero di telefono non valido";
  return errors;
};

export const isGuardianValid = (value: GuardianValue) =>
  Object.keys(validateGuardian(value)).length === 0;

/**
 * Email in sola lettura: coincide sempre con l'email di accesso dell'account,
 * ed è il database a propagarla su `profiles.contact_email`.
 */
const ReadOnlyAccountEmail = () => {
  const { user } = useAuth();
  return (
    <div>
      <FloatingInput
        label="Email di contatto"
        type="email"
        value={user?.email ?? ""}
        disabled
        onChange={() => undefined}
      />
      <p className="mt-2 text-[13px] text-field-label">
        Coincide con l'email di accesso. Si aggiorna dalla pagina dei dati di accesso.
      </p>
    </div>
  );
};


export const GuardianFields = ({
  value,
  errors,
  whatsappError,
  onChange,
  onWhatsappModeChange,
}: {
  value: GuardianValue;
  errors: GuardianErrors;
  whatsappError?: string | null;
  onChange: (patch: Partial<GuardianValue>) => void;
  onWhatsappModeChange: (mode: WhatsappMode) => void;
}) => {
  const isAdult = isAdultBirthDate(value.birth_date);

  return (
    <div className="space-y-8">
      <NameFields
        firstName={value.first_name}
        lastName={value.last_name}
        errors={{ first_name: errors.first_name, last_name: errors.last_name }}
        onChange={onChange}
      />

      <div>
        <GroupLabel>Data di nascita</GroupLabel>
        <BirthDateFields
          birthDate={value.birth_date}
          error={errors.birth_date}
          className="w-full max-w-[420px]"
          onChange={(v) => onChange({ birth_date: v ?? "" })}
        />
        <div className="mt-8">
          {/* Conferma derivata dalla data di nascita, come nel flusso normale. */}
          <ProfileCheckbox
            label="Confermo di aver compiuto 18 anni"
            checked={isAdult}
            disabled
            onCheckedChange={() => undefined}
          />
        </div>
      </div>

      <ReadOnlyAccountEmail />


      <PhoneFields
        value={{
          phone_prefix: value.phone_prefix,
          phone_number: value.phone_number,
          whatsapp_prefix: value.whatsapp_prefix,
          whatsapp_number: value.whatsapp_number,
        }}
        error={errors.phone_number}
        whatsappError={whatsappError}
        onChange={onChange}
        onModeChange={onWhatsappModeChange}
      />
    </div>
  );
};
