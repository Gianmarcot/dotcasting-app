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

  const phonePrefix = str("p", "phone_prefix") || "+39";
  const phoneNumber = str("p", "phone_number");
  const whatsappPrefix = str("p", "whatsapp_prefix") || "+39";
  const whatsappNumber = str("p", "whatsapp_number");
  const socials = obj<SocialLinks>("p", "social_links");

  const [sameWhatsapp, setSameWhatsapp] = useState(
    () => !!phoneNumber && phoneNumber === whatsappNumber && phonePrefix === whatsappPrefix
  );

  const setPhone = (prefix: string, number: string) => {
    setMany("p", {
      phone_prefix: prefix,
      phone_number: number || null,
      ...(sameWhatsapp ? { whatsapp_prefix: prefix, whatsapp_number: number || null } : {}),
    });
  };

  return (
    <SectionCard icon={<EnvelopeOpenIcon />} title="Contatti">
      <FieldSlot name="contact_email">
        <FloatingInput
          label="Email di contatto"
          type="email"
          inputMode="email"
          value={str("p", "contact_email")}
          onChange={(v) => set("p", "contact_email", v)}
        />
      </FieldSlot>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <GroupLabel>Numero di telefono</GroupLabel>
          <div className="flex gap-2">
            <FloatingSelect
              label="Prefisso"
              className="w-[110px] shrink-0"
              value={phonePrefix}
              onValueChange={(v) => setPhone(v, phoneNumber)}
              options={prefixOptions}
            />
            <FloatingInput
              label="Numero"
              className="flex-1"
              inputMode="tel"
              value={phoneNumber}
              onChange={(v) => setPhone(phonePrefix, v)}
            />
          </div>
        </div>
        <div className="flex items-end pb-5">
          <ProfileCheckbox
            checked={sameWhatsapp}
            onCheckedChange={(checked) => {
              setSameWhatsapp(checked);
              if (checked) {
                setMany("p", {
                  whatsapp_prefix: phonePrefix,
                  whatsapp_number: phoneNumber || null,
                });
              }
            }}
            label="Ho WhatsApp su questo numero"
          />
        </div>
      </div>

      <div>
        <GroupLabel>WhatsApp</GroupLabel>
        <div className="flex gap-2 sm:max-w-[472px]">
          <FloatingSelect
            label="Prefisso"
            className="w-[110px] shrink-0"
            value={whatsappPrefix}
            disabled={sameWhatsapp}
            onValueChange={(v) => set("p", "whatsapp_prefix", v)}
            options={prefixOptions}
          />
          <FloatingInput
            label="Numero"
            className="flex-1"
            inputMode="tel"
            disabled={sameWhatsapp}
            value={whatsappNumber}
            onChange={(v) => set("p", "whatsapp_number", v)}
          />
        </div>
      </div>

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
