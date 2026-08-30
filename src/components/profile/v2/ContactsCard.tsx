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
import { useGuardian } from "@/hooks/useGuardian";
import { formatPhone, guardianFullName } from "@/lib/guardianship";

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

/** Contatti del tutore in sola lettura: su un profilo tutelato non si modificano qui. */
const GuardianContactsBox = ({ guardianUserId }: { guardianUserId: string }) => {
  const { data: guardian } = useGuardian(guardianUserId);
  const rows: { label: string; value: string }[] = [];
  const name = guardianFullName(guardian);
  if (name) rows.push({ label: "Tutore", value: name });
  if (guardian?.contact_email) rows.push({ label: "Email", value: guardian.contact_email });
  const tel = formatPhone(guardian?.phone_prefix, guardian?.phone_number);
  if (tel) rows.push({ label: "Telefono", value: tel });
  const wa = formatPhone(guardian?.whatsapp_prefix, guardian?.whatsapp_number);
  if (wa) rows.push({ label: "WhatsApp", value: wa });

  return (
    <div className="rounded-[20px] bg-field px-5 py-6 sm:px-6">
      <p className="text-[15px] text-field-label">
        Il profilo è tutelato: i contatti sono quelli del tutore e non si modificano da qui.
      </p>
      <dl className="mt-6 space-y-4">
        {rows.length ? (
          rows.map((r) => (
            <div key={r.label}>
              <dt className="text-[13px] text-field-label">{r.label}</dt>
              <dd className="text-[15px] text-foreground">{r.value}</dd>
            </div>
          ))
        ) : (
          <p className="text-[15px] text-foreground">Nessun contatto del tutore inserito.</p>
        )}
      </dl>
      <a href="#section-guardian" className="dc-link-action mt-6 inline-block">
        Modifica i dati del tutore
      </a>
    </div>
  );
};

export const ContactsCard = () => {
  const { str, set, setMany, obj, profileRow } = useProfileForm();
  const guardianUserId = profileRow?.guardian_user_id ?? null;

  const socials = obj<SocialLinks>("p", "social_links");

  const phoneValue: PhoneValue = {
    phone_prefix: str("p", "phone_prefix") || "+39",
    phone_number: str("p", "phone_number"),
    whatsapp_prefix: str("p", "whatsapp_prefix") || str("p", "phone_prefix") || "+39",
    whatsapp_number: str("p", "whatsapp_number"),
  };

  return (
    <SectionCard icon={<Mail strokeWidth={1} />} title="Contatti">
      {guardianUserId ? (
        <GuardianContactsBox guardianUserId={guardianUserId} />
      ) : (
        <>
      {/* Email in sola lettura: coincide con l'email dell'account. */}
      <AccountEmailField />


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
        </>
      )}

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
