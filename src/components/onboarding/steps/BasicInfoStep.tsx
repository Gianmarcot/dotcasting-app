import { GroupLabel } from "@/components/profile/fields/FormFields";
import {
  BirthDateFields,
  ContactEmailField,
  GenderFields,
  NameFields,
  PhoneFields,
  type BasicInfoErrors,
  type BasicInfoValue,
  type WhatsappMode,
} from "@/components/profile/fields/BasicInfoFields";


export interface BasicInfoStepState extends BasicInfoValue {
  whatsapp_prefix: string;
  whatsapp_number: string;
}

export const BasicInfoStep = ({
  value,
  errors,
  whatsappError,
  onChange,
  onWhatsappModeChange,
}: {
  value: BasicInfoStepState;
  errors: BasicInfoErrors;
  whatsappError?: string | null;
  onChange: (patch: Partial<BasicInfoStepState>) => void;
  onWhatsappModeChange: (mode: WhatsappMode) => void;
}) => (



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
  </div>

);

