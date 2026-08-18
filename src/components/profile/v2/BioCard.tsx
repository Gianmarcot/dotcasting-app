import { useEffect, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { EDUCATION_LEVELS, LANGUAGES, LANGUAGE_LEVELS } from "@/lib/profileOptions";
import {
  CancelButton,
  ConfirmButton,
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
  ValueChip,
  YesNoRadio,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { useAttributesAutoSave, useProfileAutoSave } from "./useProfileAutoSave";

const ABILITY_ITEMS = [
  { key: "ability_dance", label: "So ballare" },
  { key: "ability_sing", label: "So cantare" },
  { key: "ability_instruments", label: "So suonare degli strumenti musicali", detail: "ability_instruments_detail", detailLabel: "Quali strumenti suoni?" },
  { key: "ability_sports", label: "Pratico degli sport", detail: "ability_sports_detail", detailLabel: "Quali sport pratichi?" },
  { key: "ability_bartender", label: "Ho esperienza come bartender" },
  { key: "ability_other", label: "Altro", detail: "ability_other_detail", detailLabel: "Descrivi le altre abilità" },
] as const;

type LanguageLevels = Record<string, string>;

export const BioCard = () => {
  const { profile, save: saveProfile } = useProfileAutoSave();
  const { attributes, save } = useAttributesAutoSave();

  const [bio, setBio] = useState("");
  const [abilities, setAbilities] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [hasBand, setHasBand] = useState<boolean | null>(null);
  const [educationLevel, setEducationLevel] = useState("");
  const [educationField, setEducationField] = useState("");
  const [levels, setLevels] = useState<LanguageLevels>({});
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ language: "", level: "" });

  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio ?? "");
    setHasBand(profile.has_band ?? null);
    setEducationLevel(profile.education_level ?? "");
    setEducationField(profile.education_field ?? "");
  }, [profile]);

  useEffect(() => {
    if (!attributes) return;
    setAbilities(Object.fromEntries(ABILITY_ITEMS.map((a) => [a.key, !!attributes[a.key]])));
    setDetails({
      ability_instruments_detail: attributes.ability_instruments_detail ?? "",
      ability_sports_detail: attributes.ability_sports_detail ?? "",
      ability_other_detail: attributes.ability_other_detail ?? "",
    });
    const stored = (attributes.language_levels as LanguageLevels | null) ?? null;
    if (stored) {
      setLevels(stored);
    } else {
      setLevels(Object.fromEntries((attributes.languages ?? []).map((l) => [l, ""])));
    }
  }, [attributes]);

  const persistLanguages = (next: LanguageLevels) => {
    setLevels(next);
    const keys = Object.keys(next);
    save({
      languages: keys.length > 0 ? keys : null,
      language_levels: (keys.length > 0 ? next : null) as unknown as Json,
    });
  };

  return (
    <SectionCard icon={<GraduationCap strokeWidth={1} />} title="Bio, abilità e lingue">
      <div>
        <GroupLabel>Esperienze</GroupLabel>
        <FloatingTextarea
          label="Raccontaci delle tue esperienze"
          value={bio}
          onChange={setBio}
          onBlur={() => saveProfile({ bio: bio || null })}
        />
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Ulteriori abilità</GroupLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
          {ABILITY_ITEMS.map((a) => (
            <ProfileCheckbox
              key={a.key}
              checked={!!abilities[a.key]}
              onCheckedChange={(checked) => {
                setAbilities((prev) => ({ ...prev, [a.key]: checked }));
                save({ [a.key]: checked });
              }}
              label={a.label}
            />
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {ABILITY_ITEMS.filter((a) => "detail" in a && abilities[a.key]).map((a) => {
            const detailKey = (a as { detail: string }).detail;
            const detailLabel = (a as { detailLabel: string }).detailLabel;
            return (
              <FloatingInput
                key={detailKey}
                label={detailLabel}
                value={details[detailKey] ?? ""}
                onChange={(v) => setDetails((prev) => ({ ...prev, [detailKey]: v }))}
                onBlur={() => save({ [detailKey]: details[detailKey] || null })}
              />
            );
          })}
        </div>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Fai parte di una band o di un gruppo di artisti?</GroupLabel>
        <YesNoRadio
          value={hasBand}
          onValueChange={(v) => {
            setHasBand(v);
            saveProfile({ has_band: v });
          }}
        />
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Titolo di studio</GroupLabel>
        <FieldGrid cols={2}>
          <FloatingSelect
            label="Titolo di studio"
            value={educationLevel}
            onValueChange={(v) => {
              setEducationLevel(v);
              saveProfile({ education_level: v });
            }}
            options={toOptions(EDUCATION_LEVELS)}
          />
          <FloatingInput
            label="Ambito"
            value={educationField}
            onChange={setEducationField}
            onBlur={() => saveProfile({ education_field: educationField || null })}
          />
        </FieldGrid>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Lingue</GroupLabel>
        <div className="flex flex-wrap gap-2">
          {Object.entries(levels).map(([language, level]) => (
            <ValueChip
              key={language}
              onRemove={() => {
                const next = { ...levels };
                delete next[language];
                persistLanguages(next);
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
                  persistLanguages({ ...levels, [draft.language]: draft.level });
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
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 flex h-12 items-center gap-2 rounded-full border border-border bg-background px-5 text-[15px] text-foreground"
          >
            <Plus className="h-5 w-5" />
            Aggiungi lingua
          </button>
        )}
      </div>
    </SectionCard>
  );
};
