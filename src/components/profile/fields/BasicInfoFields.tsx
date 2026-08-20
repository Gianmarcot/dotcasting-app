import { useEffect, useState } from "react";
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

/**
 * Stato dei consensi WhatsApp:
 *  - "same"   → whatsapp = copia del telefono
 *  - "custom" → numero WhatsApp indipendente (obbligatorio)
 *  - "none"   → nessun WhatsApp, campi nulli
 */
export type WhatsappMode = "same" | "custom" | "none";

export interface PhoneValue {
  phone_prefix: string;
  phone_number: string;
  whatsapp_prefix: string;
  whatsapp_number: string;
}

const isEmptyPhoneValue = (v: PhoneValue) =>
  !v.phone_number.trim() && !v.whatsapp_number.trim();

/** Deduce lo stato delle spunte dai dati salvati (profilo già compilato). */
export const deriveWhatsappMode = (v: PhoneValue): WhatsappMode => {
  if (isEmptyPhoneValue(v)) return "same";
  const wa = v.whatsapp_number.trim();
  if (!wa) return "none";
  if (wa === v.phone_number.trim() && (v.whatsapp_prefix || "") === (v.phone_prefix || ""))
    return "same";
  return "custom";
};

export const isWhatsappValid = (mode: WhatsappMode, value: PhoneValue) =>
  mode !== "custom" || value.whatsapp_number.trim().length >= 6;

export const PhoneFields = ({
  value,
  onChange,
  onModeChange,
  error,
  whatsappError,
}: {
  value: PhoneValue;
  onChange: (patch: Partial<PhoneValue>) => void;
  onModeChange?: (mode: WhatsappMode) => void;
  error?: string | null;
  whatsappError?: string | null;
}) => {
  const [mode, setMode] = useState<WhatsappMode>(() => deriveWhatsappMode(value));
  // Il componente è condiviso col profilo: se i dati arrivano dopo il primo
  // render (fetch asincrono), lo stato delle spunte va ri-dedotto una volta.
  const hydrated = useRef(!isEmptyPhoneValue(value));

  useEffect(() => {
    if (hydrated.current || isEmptyPhoneValue(value)) return;
    hydrated.current = true;
    const next = deriveWhatsappMode(value);
    setMode(next);
    onModeChange?.(next);
  }, [value, onModeChange]);

  const applyMode = (next: WhatsappMode) => {
    setMode(next);
    onModeChange?.(next);
    if (next === "same") {
      onChange({
        whatsapp_prefix: value.phone_prefix,
        whatsapp_number: value.phone_number,
      });
    } else if (next === "none") {
      onChange({ whatsapp_prefix: value.phone_prefix, whatsapp_number: "" });
    } else {
      onChange({ whatsapp_prefix: value.phone_prefix, whatsapp_number: "" });
    }
  };

  const setPhone = (prefix: string, number: string) =>
    onChange({
      phone_prefix: prefix,
      phone_number: number,
      ...(mode === "same" ? { whatsapp_prefix: prefix, whatsapp_number: number } : {}),
    });

  return (
    <div className="space-y-4">
      <div>
        <GroupLabel>Numero di telefono</GroupLabel>
        <FieldCluster className="w-full max-w-[420px]">
          <FloatingSelect
            label="Prefisso"
            className="w-[110px] shrink-0"
            value={value.phone_prefix}
            onValueChange={(v) => setPhone(v, value.phone_number)}
            options={PHONE_PREFIX_OPTIONS}
          />
          <FloatingInput
            label="Numero"
            className="flex-1"
            inputMode="tel"
            value={value.phone_number}
            error={error}
            onChange={(v) => setPhone(value.phone_prefix, v)}
          />
        </FieldCluster>
      </div>

      <ProfileCheckbox
        checked={mode === "same"}
        onCheckedChange={(checked) => applyMode(checked ? "same" : "custom")}
        label="Ho WhatsApp su questo numero"
      />

      {mode !== "same" && (
        <div className="space-y-4">
          <FieldCluster className="w-full max-w-[420px]">
            <FloatingSelect
              label="Prefisso"
              className="w-[110px] shrink-0"
              value={value.whatsapp_prefix}
              disabled={mode === "none"}
              onValueChange={(v) => onChange({ whatsapp_prefix: v })}
              options={PHONE_PREFIX_OPTIONS}
            />
            <FloatingInput
              label="Numero WhatsApp"
              className="flex-1"
              inputMode="tel"
              disabled={mode === "none"}
              value={value.whatsapp_number}
              error={whatsappError}
              onChange={(v) => onChange({ whatsapp_number: v })}
            />
          </FieldCluster>

          <ProfileCheckbox
            checked={mode === "none"}
            onCheckedChange={(checked) => applyMode(checked ? "none" : "custom")}
            label="Non ho WhatsApp"
          />
        </div>
      )}
    </div>
  );
};

