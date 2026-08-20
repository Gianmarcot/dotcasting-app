import { GroupLabel } from "@/components/profile/fields/FormFields";
import {
  BirthDateFields,
  ContactEmailField,
  GenderFields,
  NameFields,
  PhoneFields,
  type BasicInfoErrors,
  type BasicInfoValue,
} from "@/components/profile/fields/BasicInfoFields";

export interface BasicInfoStepState extends BasicInfoValue {
  whatsapp_same: boolean;
}

export const BasicInfoStep = ({
  value,
  errors,
  onChange,
}: {
  value: BasicInfoStepState;
  errors: BasicInfoErrors;
  onChange: (patch: Partial<BasicInfoStepState>) => void;
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
      prefix={value.phone_prefix}
      number={value.phone_number}
      whatsappSame={value.whatsapp_same}
      error={errors.phone_number}
      onChange={(prefix, number) => onChange({ phone_prefix: prefix, phone_number: number })}
      onWhatsappSameChange={(checked) => onChange({ whatsapp_same: checked })}
    />
  </div>
);
