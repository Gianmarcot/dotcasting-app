import { GENDER_IDENTITIES, MONTHS, PHONE_PREFIXES } from "@/lib/profileOptions";
import {
  FieldCluster,
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupLabel,
  ProfileCheckbox,
  ProfileRadioGroup,
  RadioField,
  toOptions,
} from "@/components/profile/fields/FormFields";

/* --------------------------------------------------------------------------
 * Gruppi di campi anagrafici condivisi fra il profilo talent e l'onboarding.
 * Unica definizione di label, opzioni e validazione: chi li usa passa solo
 * valore, handler ed eventuali errori.
 * ------------------------------------------------------------------------ */

export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
export const YEARS = Array.from({ length: 80 }, (_, i) =>
  String(new Date().getFullYear() - 16 - i)
);

export const MONTH_OPTIONS = MONTHS.map((m, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: m,
}));

export const PHONE_PREFIX_OPTIONS = PHONE_PREFIXES.map((p) => ({
  value: p.code,
  label: `${p.code} ${p.country}`,
}));

export interface BasicInfoValue {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  gender_identity: string;
  contact_email: string;
  phone_prefix: string;
  phone_number: string;
}

export type BasicInfoErrors = Partial<Record<keyof BasicInfoValue, string>>;

/** Campi che il profilo considera obbligatori per l'anagrafica di base. */
export const BASIC_INFO_REQUIRED: (keyof BasicInfoValue)[] = [
  "first_name",
  "last_name",
  "birth_date",
  "gender",
  "contact_email",
  "phone_number",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateBasicInfo = (value: BasicInfoValue): BasicInfoErrors => {
  const errors: BasicInfoErrors = {};
  if (!value.first_name.trim()) errors.first_name = "Inserisci il tuo nome";
  if (!value.last_name.trim()) errors.last_name = "Inserisci il tuo cognome";
  if (!value.birth_date) errors.birth_date = "Inserisci la tua data di nascita";
  if (!value.gender) errors.gender = "Seleziona un'opzione";
  if (!value.contact_email.trim()) errors.contact_email = "Inserisci un'email di contatto";
  else if (!EMAIL_RE.test(value.contact_email.trim()))
    errors.contact_email = "Inserisci un'email valida";
  if (!value.phone_number.trim()) errors.phone_number = "Inserisci un numero di telefono";
  else if (value.phone_number.replace(/\D/g, "").length < 6)
    errors.phone_number = "Numero di telefono non valido";
  return errors;
};

export const isBasicInfoValid = (value: BasicInfoValue) =>
  Object.keys(validateBasicInfo(value)).length === 0;

/* --------------------------------- Nome ----------------------------------- */

export const NameFields = ({
  firstName,
  lastName,
  onChange,
  errors,
}: {
  firstName: string;
  lastName: string;
  onChange: (patch: { first_name?: string; last_name?: string }) => void;
  errors?: BasicInfoErrors;
}) => (
  <FieldGrid cols={2}>
    <FloatingInput
      label="Nome"
      value={firstName}
      error={errors?.first_name}
      onChange={(v) => onChange({ first_name: v })}
    />
    <FloatingInput
      label="Cognome"
      value={lastName}
      error={errors?.last_name}
      onChange={(v) => onChange({ last_name: v })}
    />
  </FieldGrid>
);

/* ----------------------------- Data di nascita ----------------------------- */

export const splitBirthDate = (birthDate: string) => {
  const [y = "", m = "", d = ""] = (birthDate || "").split("-");
  return { day: d, month: m, year: y };
};

export const BirthDateFields = ({
  birthDate,
  onChange,
  error,
  className,
}: {
  birthDate: string;
  onChange: (value: string | null) => void;
  error?: string | null;
  className?: string;
}) => {
  const fromProp = splitBirthDate(birthDate);
  // Le parti selezionate vivono in locale: una data incompleta non è ancora
  // salvabile, ma le select devono comunque mostrare la scelta dell'utente.
  const [parts, setParts] = useState(fromProp);

  useEffect(() => {
    if (birthDate) setParts(splitBirthDate(birthDate));
  }, [birthDate]);

  const setPart = (part: "day" | "month" | "year", value: string) => {
    const next = { ...parts, [part]: value };
    setParts(next);
    onChange(
      next.day && next.month && next.year
        ? `${next.year}-${next.month}-${next.day}`
        : null
    );
  };

  return (
    <FieldCluster className={className}>
      <FloatingSelect
        label="Giorno"
        className="flex-1"
        value={parts.day}
        error={error}
        onValueChange={(v) => setPart("day", v)}
        options={toOptions(DAYS)}
      />
      <FloatingSelect
        label="Mese"
        className="flex-1"
        value={parts.month}
        error={error ? " " : undefined}
        onValueChange={(v) => setPart("month", v)}
        options={MONTH_OPTIONS}
      />
      <FloatingSelect
        label="Anno"
        className="flex-1"
        value={parts.year}
        error={error ? " " : undefined}
        onValueChange={(v) => setPart("year", v)}
        options={toOptions(YEARS)}
      />

    </FieldCluster>
  );
};

/* ---------------------------------- Sesso --------------------------------- */

export const GenderFields = ({
  gender,
  genderIdentity,
  onChange,
  errors,
  showGroupLabel = false,
}: {
  gender: string;
  genderIdentity: string;
  onChange: (patch: { gender?: string; gender_identity?: string }) => void;
  errors?: BasicInfoErrors;
  showGroupLabel?: boolean;
}) => (
  <div>
    {showGroupLabel && <GroupLabel>Sesso</GroupLabel>}
    <FieldGrid cols={2}>
      <div>
        {showGroupLabel ? (
          <div className="flex h-full items-center">
            <ProfileRadioGroup
              value={gender}
              onValueChange={(v) => onChange({ gender: v })}
              options={[
                { value: "M", label: "M" },
                { value: "F", label: "F" },
              ]}
            />
          </div>
        ) : (
          <RadioField label="Sesso">
            <ProfileRadioGroup
              value={gender}
              onValueChange={(v) => onChange({ gender: v })}
              options={[
                { value: "M", label: "M" },
                { value: "F", label: "F" },
              ]}
            />
          </RadioField>
        )}
        {errors?.gender && (
          <p className="mt-2 text-xs text-destructive">{errors.gender}</p>
        )}
      </div>
      <FloatingSelect
        label="Identità di genere"
        value={genderIdentity}
        onValueChange={(v) => onChange({ gender_identity: v })}
        options={toOptions([...GENDER_IDENTITIES])}
      />
    </FieldGrid>
  </div>
);

/* ------------------------------- Contatti --------------------------------- */

export const ContactEmailField = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) => (
  <FloatingInput
    label="Email di contatto"
    type="email"
    inputMode="email"
    value={value}
    error={error}
    onChange={onChange}
  />
);

export const PhoneFields = ({
  prefix,
  number,
  whatsappSame,
  onChange,
  onWhatsappSameChange,
  error,
}: {
  prefix: string;
  number: string;
  whatsappSame: boolean;
  onChange: (prefix: string, number: string) => void;
  onWhatsappSameChange: (checked: boolean) => void;
  error?: string | null;
}) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
    <div>
      <GroupLabel>Numero di telefono</GroupLabel>
      <div className="flex gap-2">
        <FloatingSelect
          label="Prefisso"
          className="w-[110px] shrink-0"
          value={prefix}
          onValueChange={(v) => onChange(v, number)}
          options={PHONE_PREFIX_OPTIONS}
        />
        <FloatingInput
          label="Numero"
          className="flex-1"
          inputMode="tel"
          value={number}
          error={error}
          onChange={(v) => onChange(prefix, v)}
        />
      </div>
    </div>
    <div className="flex items-end pb-5">
      <ProfileCheckbox
        checked={whatsappSame}
        onCheckedChange={onWhatsappSameChange}
        label="Ho WhatsApp su questo numero"
      />
    </div>
  </div>
);
