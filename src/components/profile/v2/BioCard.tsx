import { useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Json } from "@/integrations/supabase/types";
import { EDUCATION_LEVELS, LANGUAGES, LANGUAGE_LEVELS } from "@/lib/profileOptions";
import {
  CancelButton,
  ConfirmButton,
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  GroupHeading,
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
  ValueChip,
  YesNoRadio,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { useProfileForm } from "./ProfileFormContext";

const ABILITY_ITEMS = [
  { key: "ability_dance", label: "So ballare" },
  { key: "ability_sing", label: "So cantare" },
  {
    key: "ability_instruments",
    label: "So suonare degli strumenti musicali",
    detail: "ability_instruments_detail",
    detailLabel: "Quali strumenti suoni?",
  },
  {
    key: "ability_sports",
    label: "Pratico degli sport",
    detail: "ability_sports_detail",
    detailLabel: "Quali sport pratichi?",
  },
  { key: "ability_bartender", label: "Ho esperienza come bartender" },
  {
    key: "ability_other",
    label: "Altro",
    detail: "ability_other_detail",
    detailLabel: "Descrivi le altre abilità",
  },
] as const;

type LanguageLevels = Record<string, string>;

export const BioCard = () => {
  const { str, bool, triState, set, setMany, obj, arr } = useProfileForm();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ language: "", level: "" });

  const storedLevels = obj<LanguageLevels>("a", "language_levels");
  const levels: LanguageLevels =
    Object.keys(storedLevels).length > 0
      ? storedLevels
      : Object.fromEntries(arr("a", "languages").map((l) => [l, ""]));

  const setLanguages = (next: LanguageLevels) => {
    const keys = Object.keys(next);
    setMany("a", {
      languages: keys,
      language_levels: (keys.length > 0 ? next : null) as unknown as Json,
    });
  };

  return (
    <SectionCard icon={<GraduationCap strokeWidth={1} />} title="Bio, abilità e lingue">
      <div>
        <GroupHeading>Esperienze</GroupHeading>
        <FloatingTextarea
          label="Raccontaci delle tue esperienze"
          value={str("p", "bio")}
          onChange={(v) => set("p", "bio", v)}
        />
      </div>

      <SectionDivider />

      <div>
        <GroupHeading>Ulteriori abilità</GroupHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
          {ABILITY_ITEMS.map((a) => (
            <ProfileCheckbox
              key={a.key}
              checked={bool("a", a.key)}
              onCheckedChange={(checked) => set("a", a.key, checked)}
              label={a.label}
            />
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {ABILITY_ITEMS.filter((a) => "detail" in a && bool("a", a.key)).map((a) => {
            const detailKey = (a as { detail: string }).detail;
            const detailLabel = (a as { detailLabel: string }).detailLabel;
            return (
              <FloatingInput
                key={detailKey}
                label={detailLabel}
                value={str("a", detailKey)}
                onChange={(v) => set("a", detailKey, v)}
              />
            );
          })}
        </div>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Fai parte di una band o di un gruppo di artisti?</GroupLabel>
        <YesNoRadio
          value={triState("p", "has_band")}
          onValueChange={(v) => set("p", "has_band", v)}
        />
      </div>

      <SectionDivider />

      <div>
        <GroupHeading>Titolo di studio</GroupHeading>
        <FieldGrid cols={2}>
          <FloatingSelect
            label="Titolo di studio"
            value={str("p", "education_level")}
            onValueChange={(v) => set("p", "education_level", v)}
            options={toOptions(EDUCATION_LEVELS)}
          />
          <FloatingInput
            label="Ambito"
            value={str("p", "education_field")}
            onChange={(v) => set("p", "education_field", v)}
          />
        </FieldGrid>
      </div>

      <SectionDivider />

      <div>
        <GroupHeading>Lingue</GroupHeading>
        <div className="flex flex-wrap gap-2">
          {Object.entries(levels).map(([language, level]) => (
            <ValueChip
              key={language}
              onRemove={() => {
                const next = { ...levels };
                delete next[language];
                setLanguages(next);
              }}
            >
              <span>
                <span className="font-medium">{language}</span>
                {level ? ` — ${level}` : ""}
              </span>
            </ValueChip>
          ))}
        </div>

        {adding ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
              <FloatingSelect
                label="Lingua"
                value={draft.language}
                onValueChange={(v) => setDraft((p) => ({ ...p, language: v }))}
                options={toOptions(LANGUAGES.filter((l) => !(l in levels)))}
              />
              <FloatingSelect
                label="Livello"
                value={draft.level}
                onValueChange={(v) => setDraft((p) => ({ ...p, level: v }))}
                options={toOptions(LANGUAGE_LEVELS)}
              />
            </div>
            <div className="flex gap-2">
              <ConfirmButton
                disabled={!draft.language || !draft.level}
                onClick={() => {
                  setLanguages({ ...levels, [draft.language]: draft.level });
                  setDraft({ language: "", level: "" });
                  setAdding(false);
                }}
              />
              <CancelButton
                onClick={() => {
                  setDraft({ language: "", level: "" });
                  setAdding(false);
                }}
              />
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setAdding(true)}
            className="mt-4"
          >
            <Plus className="h-5 w-5" />
            Aggiungi lingua
          </Button>
        )}
      </div>
    </SectionCard>
  );
};
