import { GroupLabel, SectionDivider } from "@/components/profile/fields/FormFields";
import {
  BirthDateFields,
  ContactEmailField,
  GenderFields,
  NameFields,
  PhoneFields,
  YEARS_ALL,
  type BasicInfoErrors,
  type BasicInfoValue,
  type WhatsappMode,
} from "@/components/profile/fields/BasicInfoFields";
import {
  GuardianFields,
  type GuardianErrors,
  type GuardianValue,
} from "@/components/profile/fields/GuardianFields";


export interface BasicInfoStepState extends BasicInfoValue {
  whatsapp_prefix: string;
  whatsapp_number: string;
}

export interface GuardianStepProps {
  value: GuardianValue;
  errors: GuardianErrors;
  whatsappError?: string | null;
  onChange: (patch: Partial<GuardianValue>) => void;
  onWhatsappModeChange: (mode: WhatsappMode) => void;
}

const SectionTitle = ({ children }: { children: string }) => (
  <h3 className="mb-8 font-display text-base uppercase tracking-wide text-foreground">
    {children}
  </h3>
);

export const BasicInfoStep = ({
  value,
  errors,
  whatsappError,
  onChange,
  onWhatsappModeChange,
  guardian,
}: {
  value: BasicInfoStepState;
  errors: BasicInfoErrors;
  whatsappError?: string | null;
  onChange: (patch: Partial<BasicInfoStepState>) => void;
  onWhatsappModeChange: (mode: WhatsappMode) => void;
  /** Presente solo in modalità tutore: il primo step ha due sezioni. */
  guardian?: GuardianStepProps;
}) => {
  const isGuardian = !!guardian;

  /* Anagrafica del talent. In modalità tutore è il minore e non ha contatti
     propri: email e telefono non vengono mostrati, nemmeno vuoti. */
  const talentFields = (
    <div className="space-y-8">
      <NameFields
        firstName={value.first_name}
        lastName={value.last_name}
        errors={errors}
        onChange={onChange}
      />

      <div>
        <GroupLabel>Data di nascita</GroupLabel>
        <BirthDateFields
          birthDate={value.birth_date}
          error={errors.birth_date}
          className="w-full max-w-[420px]"
          years={isGuardian ? YEARS_ALL : undefined}
          onChange={(v) => onChange({ birth_date: v ?? "" })}
        />
      </div>

      <GenderFields
        gender={value.gender}
        genderIdentity={value.gender_identity}
        errors={errors}
        showGroupLabel
        onChange={onChange}
      />

      {!isGuardian && (
        <>
          <ContactEmailField
            value={value.contact_email}
            error={errors.contact_email}
            onChange={(v) => onChange({ contact_email: v })}
          />

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
        </>
      )}
    </div>
  );

  if (!isGuardian) return talentFields;

  return (
    <div>
      <section>
        <SectionTitle>Tutore legale/genitore</SectionTitle>
        <GuardianFields
          value={guardian.value}
          errors={guardian.errors}
          whatsappError={guardian.whatsappError}
          onChange={guardian.onChange}
          onWhatsappModeChange={guardian.onWhatsappModeChange}
        />
      </section>

      <SectionDivider className="my-12" />

      <section>
        <SectionTitle>Minore o tutelato</SectionTitle>
        {talentFields}
      </section>
    </div>
  );
};
