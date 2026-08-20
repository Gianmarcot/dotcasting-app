import { useState } from "react";
import { Mail } from "lucide-react";
import { PHONE_PREFIXES } from "@/lib/profileOptions";
import {
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupHeading,
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
} from "@/components/profile/fields/FormFields";
import {
  ContactEmailField,
  PhoneFields,
  type PhoneValue,

} from "@/components/profile/fields/BasicInfoFields";

import { FieldSlot, useProfileForm } from "./ProfileFormContext";

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  x?: string;
}

const SOCIALS: { key: keyof SocialLinks; label: string; prefix: string }[] = [
  { key: "instagram", label: "Instagram", prefix: "@" },
  { key: "tiktok", label: "Tiktok", prefix: "@" },
  { key: "facebook", label: "Facebook", prefix: "www.facebook.com/" },
  { key: "youtube", label: "YouTube", prefix: "www.youtube.com/@" },
  { key: "linkedin", label: "LinkedIn", prefix: "www.linkedin.com/in/" },
  { key: "x", label: "X (Twitter)", prefix: "@" },
];

const prefixOptions = PHONE_PREFIXES.map((p) => ({
  value: p.code,
  label: `${p.code} ${p.country}`,
}));

export const ContactsCard = () => {
  const { str, set, setMany, obj } = useProfileForm();

  const socials = obj<SocialLinks>("p", "social_links");

  const phoneValue: PhoneValue = {
    phone_prefix: str("p", "phone_prefix") || "+39",
    phone_number: str("p", "phone_number"),
    whatsapp_prefix: str("p", "whatsapp_prefix") || str("p", "phone_prefix") || "+39",
    whatsapp_number: str("p", "whatsapp_number"),
  };

  return (
    <SectionCard icon={<Mail strokeWidth={1} />} title="Contatti">
      <FieldSlot name="contact_email">
        <ContactEmailField
          value={str("p", "contact_email")}
          onChange={(v) => set("p", "contact_email", v)}
        />
      </FieldSlot>

      <PhoneFields
        value={phoneValue}
        onChange={(patch) =>
          setMany("p", {
            ...("phone_prefix" in patch ? { phone_prefix: patch.phone_prefix } : {}),
            ...("phone_number" in patch ? { phone_number: patch.phone_number || null } : {}),
            ...("whatsapp_prefix" in patch ? { whatsapp_prefix: patch.whatsapp_prefix } : {}),
            ...("whatsapp_number" in patch
              ? { whatsapp_number: patch.whatsapp_number || null }
              : {}),
          })
        }
      />


      <FloatingInput
        label="Sito Web"
        value={str("p", "website_url")}
        onChange={(v) => set("p", "website_url", v)}
      />

      <div>
        <GroupHeading>Social media</GroupHeading>
        <FieldGrid cols={2}>
          {SOCIALS.map((s) => (
            <FloatingInput
              key={s.key}
              label={s.label}
              prefix={s.prefix}
              value={socials[s.key] ?? ""}
              onChange={(v) => set("p", "social_links", { ...socials, [s.key]: v })}
            />
          ))}
        </FieldGrid>
      </div>
    </SectionCard>
  );
};
