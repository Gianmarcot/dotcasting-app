import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useTalentAttributes } from "@/hooks/useTalentAttributes";
import { useTalentMedia } from "@/hooks/useTalentMedia";

const TOTAL = 10;

export const ProfileStrengthCard = () => {
  const { data: profile } = useProfile();
  const { data: attributes } = useTalentAttributes();
  const { data: media } = useTalentMedia();
  const [collapsed, setCollapsed] = useState(false);

  const photos = (media ?? []).filter((m) => m.media_type === "photo");

  const checks = [
    { key: "Anagrafica", done: !!profile?.first_name && !!profile?.last_name },
    { key: "Data di nascita", done: !!profile?.birth_date },
    { key: "Contatti", done: !!profile?.phone_number },
    { key: "Indirizzo", done: !!profile?.residence_address },
    { key: "Documenti", done: !!profile?.fiscal_code },
    { key: "Foto", done: photos.length >= 4 },
    { key: "Misure", done: !!attributes?.height && !!attributes?.weight },
    { key: "Ruoli", done: (profile?.talent_categories ?? []).length > 0 },
    { key: "Biografia", done: !!profile?.bio },
    { key: "Lingue", done: (attributes?.languages ?? []).length > 0 },
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
          <ChevronDown className={cn("h-5 w-5 transition-transform", collapsed && "-rotate-90")} />
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
                <div key={m.key} className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-field-label">
                    <Plus className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="text-[15px] text-foreground">{m.key}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
