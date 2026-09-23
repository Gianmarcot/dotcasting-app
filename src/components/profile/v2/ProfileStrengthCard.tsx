import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  AlignLeft,
  Calendar,
  Camera,
  ChevronDown,
  Clapperboard,
  FileText,
  MapPin,
  Phone,
  Ruler,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentMedia } from "@/hooks/useTalentMedia";
import { PHOTO_CATEGORIES } from "@/lib/mediaCategories";
import { visiblePhotoCategories, visiblePhysicalFields } from "@/lib/roleVisibility";
import { isAdultBirthDate } from "@/lib/guardianship";
import { fiscalStatusOf } from "@/lib/fiscalStatus";
import { NoticeBox } from "@/components/profile/fields/FormFields";

const TOTAL = 10;

/** Scrolls to a profile section and briefly highlights it. */
export const focusProfileSection = (sectionId: string) => {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("ring-2", "ring-primary/40", "ring-offset-2", "ring-offset-background");
  window.setTimeout(() => {
    el.classList.remove("ring-2", "ring-primary/40", "ring-offset-2", "ring-offset-background");
  }, 1600);
};

export const ProfileStrengthCard = () => {
  const { data: profile } = useProfile();
  const { data: attributes } = useTalentAttributes();
  const { data: media } = useTalentMedia();
  const [collapsed, setCollapsed] = useState(false);

  // Il punteggio considera solo le categorie e i campi visibili per questi ruoli.
  const roles = profile?.talent_categories ?? [];
  const photoKeys = visiblePhotoCategories(roles);
  const requiredPhotos = PHOTO_CATEGORIES.filter(
    (c) => photoKeys.includes(c.key) && "minRequired" in c
  );
  const photosDone = requiredPhotos.every(
    (c) =>
      (media ?? []).filter((m) => m.media_type === "photo" && m.category === c.key).length >=
      ((c as { minRequired: number }).minRequired ?? 1)
  );
  const physicalKeys = visiblePhysicalFields({
    roles,
    isAdult: isAdultBirthDate(profile?.birth_date),
    gender: profile?.gender,
  });
  const measuresDone = physicalKeys.length
    ? physicalKeys.every((k) =>
        k === "ethnicity"
          ? !!profile?.ethnicity
          : !!(attributes as Record<string, unknown> | undefined)?.[k]
      )
    : !!attributes?.weight;
  const hasAbility = !!attributes && [
    attributes.ability_dance,
    attributes.ability_sing,
    attributes.ability_instruments,
    attributes.ability_sports,
    attributes.ability_bartender,
    attributes.ability_other,
  ].some(Boolean);

  const checks: { key: string; section: string; done: boolean; icon: LucideIcon }[] = [
    {
      key: "Anagrafica",
      section: "section-head",
      icon: User,
      done: !!profile?.first_name && !!profile?.last_name,
    },
    { key: "Data di nascita", section: "section-head", icon: Calendar, done: !!profile?.birth_date },
    { key: "Contatti", section: "section-contacts", icon: Phone, done: !!profile?.phone_number },
    {
      key: "Indirizzo",
      section: "section-address",
      icon: MapPin,
      done: !!profile?.residence_address,
    },
    {
      key: "Documenti",
      section: "section-documents",
      icon: FileText,
      done: !!profile?.fiscal_code,
    },
    { key: "Foto", section: "section-media", icon: Camera, done: photosDone },
    { key: "Misure", section: "section-physical", icon: Ruler, done: measuresDone },
    {
      key: "Ruoli",
      section: "section-roles",
      icon: Clapperboard,
      done: (profile?.talent_categories ?? []).length > 0,
    },
    { key: "Biografia", section: "section-bio", icon: AlignLeft, done: !!profile?.bio },
    {
      key: "Competenze",
      section: "section-bio",
      icon: Sparkles,
      done: (attributes?.languages ?? []).length > 0 || hasAbility,
    },
  ];

  const score = checks.filter((c) => c.done).length;
  const missing = checks.filter((c) => !c.done).slice(0, 6);
  const emoji = score >= 9 ? "🔥" : score >= 6 ? "💪" : "🌱";
  // Avviso solo per chi ha dichiarato di avere un CF italiano senza averlo inserito.
  const fiscalMissing = fiscalStatusOf(profile) === "missing";

  return (
    <section className="rounded-[24px] bg-profile-strength p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-medium text-foreground">
          Forza del Profilo: {score}/{TOTAL} {emoji}
        </p>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Espandi" : "Comprimi"}
          className="text-foreground"
        >
          <ChevronDown className={cn("h-5 w-5 transition-transform", !collapsed && "rotate-180")} />
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="mt-8 flex gap-[1%]">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  i < score ? "bg-primary" : "bg-background"
                )}
              />
            ))}
          </div>

          {missing.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-6">
              {missing.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => focusProfileSection(m.section)}
                    className="flex items-center gap-2 rounded-full text-left transition-opacity hover:opacity-70"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-field-label text-foreground">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="text-[15px] text-foreground">{m.key}</span>
                  </button>
                );
              })}
            </div>
          )}

          {fiscalMissing && (
            <NoticeBox
              tone="warning"
              icon={<AlertTriangle strokeWidth={1.5} />}
              className="mt-8"
            >
              <span>
                Manca il tuo codice fiscale. Senza questo dato non possiamo contrattualizzarti per un
                lavoro: completalo per essere pronto quando arriva l'occasione.{" "}
                <button
                  type="button"
                  onClick={() => focusProfileSection("section-documents")}
                  className="underline underline-offset-2"
                >
                  Inserisci il codice fiscale
                </button>
              </span>
            </NoticeBox>
          )}
        </>
      )}
    </section>
  );
};
