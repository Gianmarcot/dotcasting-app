import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { PHONE_PREFIXES } from "@/lib/profileOptions";
import {
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
} from "@/components/profile/fields/FormFields";
import { useProfileAutoSave } from "./useProfileAutoSave";

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
  const { profile, save } = useProfileAutoSave();

  const [contactEmail, setContactEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+39");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappPrefix, setWhatsappPrefix] = useState("+39");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socials, setSocials] = useState<SocialLinks>({});

  useEffect(() => {
    if (!profile) return;
    setContactEmail(profile.contact_email ?? "");
    setPhonePrefix(profile.phone_prefix ?? "+39");
    setPhoneNumber(profile.phone_number ?? "");
    setWhatsappPrefix(profile.whatsapp_prefix ?? "+39");
    setWhatsappNumber(profile.whatsapp_number ?? "");
    setSameWhatsapp(
      !!profile.phone_number &&
        profile.phone_number === profile.whatsapp_number &&
        (profile.phone_prefix ?? "+39") === (profile.whatsapp_prefix ?? "+39")
    );
    setWebsiteUrl(profile.website_url ?? "");
    setSocials((profile.social_links as SocialLinks) ?? {});
  }, [profile]);

  const commitSocials = (next: SocialLinks) => {
    save({ social_links: next as unknown as Json });
  };

  const commitPhone = (prefix: string, number: string, mirror: boolean) => {
    save({
      phone_prefix: prefix,
      phone_number: number || null,
      ...(mirror ? { whatsapp_prefix: prefix, whatsapp_number: number || null } : {}),
    });
  };

  return (
    <SectionCard icon={<Mail strokeWidth={1} />} title="Contatti">
      <FloatingInput
        label="Email di contatto"
        type="email"
        inputMode="email"
        value={contactEmail}
        onChange={setContactEmail}
        onBlur={() => save({ contact_email: contactEmail || null })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
        <div>
          <GroupLabel>Numero di telefono</GroupLabel>
          <div className="flex gap-2">
            <FloatingSelect
              label="Prefisso"
              className="w-[110px] shrink-0"
              value={phonePrefix}
              onValueChange={(v) => {
                setPhonePrefix(v);
                if (sameWhatsapp) setWhatsappPrefix(v);
                commitPhone(v, phoneNumber, sameWhatsapp);
              }}
              options={prefixOptions}
            />
            <FloatingInput
              label="Numero"
              className="flex-1"
              inputMode="tel"
              value={phoneNumber}
              onChange={(v) => {
                setPhoneNumber(v);
                if (sameWhatsapp) setWhatsappNumber(v);
              }}
              onBlur={() => commitPhone(phonePrefix, phoneNumber, sameWhatsapp)}
            />
          </div>
        </div>
        <div className="flex items-end pb-5">
          <ProfileCheckbox
            checked={sameWhatsapp}
            onCheckedChange={(checked) => {
              setSameWhatsapp(checked);
              if (checked) {
                setWhatsappPrefix(phonePrefix);
                setWhatsappNumber(phoneNumber);
                save({ whatsapp_prefix: phonePrefix, whatsapp_number: phoneNumber || null });
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
            onValueChange={(v) => {
              setWhatsappPrefix(v);
              save({ whatsapp_prefix: v });
            }}
            options={prefixOptions}
          />
          <FloatingInput
            label="Numero"
            className="flex-1"
            inputMode="tel"
            disabled={sameWhatsapp}
            value={whatsappNumber}
            onChange={setWhatsappNumber}
            onBlur={() => save({ whatsapp_number: whatsappNumber || null })}
          />
        </div>
      </div>

      <FloatingInput
        label="Sito Web"
        value={websiteUrl}
        onChange={setWebsiteUrl}
        onBlur={() => save({ website_url: websiteUrl || null })}
      />

      <div>
        <GroupLabel>Social Media</GroupLabel>
        <FieldGrid cols={2}>
          {SOCIALS.map((s) => (
            <FloatingInput
              key={s.key}
              label={s.label}
              prefix={s.prefix}
              value={socials[s.key] ?? ""}
              onChange={(v) => setSocials((prev) => ({ ...prev, [s.key]: v }))}
              onBlur={() => commitSocials(socials)}
            />
          ))}
        </FieldGrid>
      </div>
    </SectionCard>
  );
};
