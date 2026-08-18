import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentMedia } from "@/hooks/useTalentMedia";

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

  const photos = (media ?? []).filter((m) => m.media_type === "photo");
  const hasAbility = !!attributes && [
    attributes.ability_dance,
    attributes.ability_sing,
    attributes.ability_instruments,
    attributes.ability_sports,
    attributes.ability_bartender,
    attributes.ability_other,
  ].some(Boolean);

  const checks: { key: string; section: string; done: boolean }[] = [
    {
      key: "Anagrafica",
      section: "section-head",
      done: !!profile?.first_name && !!profile?.last_name,
    },
    { key: "Data di nascita", section: "section-head", done: !!profile?.birth_date },
    { key: "Contatti", section: "section-contacts", done: !!profile?.phone_number },
    { key: "Indirizzo", section: "section-address", done: !!profile?.residence_address },
    { key: "Documenti", section: "section-documents", done: !!profile?.fiscal_code },
    { key: "Foto", section: "section-media", done: photos.length >= 4 },
    {
      key: "Misure",
      section: "section-physical",
      done: !!attributes?.height && !!attributes?.weight,
    },
    {
      key: "Ruoli",
      section: "section-roles",
      done: (profile?.talent_categories ?? []).length > 0,
    },
    { key: "Biografia", section: "section-bio", done: !!profile?.bio },
    {
      key: "Competenze",
      section: "section-bio",
      done: (attributes?.languages ?? []).length > 0 || hasAbility,
    },
  ];

  const score = checks.filter((c) => c.done).length;
  const missing = checks.filter((c) => !c.done).slice(0, 4);
  const emoji = score >= 9 ? "🔥" : score >= 6 ? "💪" : "🌱";

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
              {missing.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => focusProfileSection(m.section)}
                  className="flex items-center gap-2 rounded-full text-left transition-opacity hover:opacity-70"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-field-label">
                    <Plus className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="text-[15px] text-foreground">{m.key}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
