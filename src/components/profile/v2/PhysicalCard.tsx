import { useEffect, useState } from "react";
import { Shirt } from "lucide-react";
import {
  ETHNICITIES,
  EYE_COLORS,
  HAIR_COLORS,
  HAIR_LENGTHS,
  HAIR_TYPES,
  JACKET_SIZES,
  PANTS_SIZES,
  SHIRT_SIZES,
  SHOE_SIZES,
} from "@/lib/profileOptions";
import {
  FieldGrid,
  FloatingInput,
  FloatingSelect,
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
  YesNoRadio,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { toNumber, useAttributesAutoSave, useProfileAutoSave } from "./useProfileAutoSave";

const MEASURES = [
  { key: "height", label: "Altezza (cm)" },
  { key: "weight", label: "Peso (kg)" },
  { key: "chest", label: "Petto (cm)" },
  { key: "waist", label: "Vita (cm)" },
  { key: "hips", label: "Fianchi (cm)" },
  { key: "shoulder_width", label: "Larghezza spalle (cm)" },
  { key: "neck_size", label: "Misura collo camicia (cm)" },
] as const;

const MARKS = [
  { key: "has_vitiligo", label: "Vitiligine" },
  { key: "has_freckles", label: "Lentiggini" },
  { key: "has_diastema", label: "Diastema" },
  { key: "has_albinism", label: "Albinismo" },
  { key: "has_dwarfism", label: "Nanismo" },
  { key: "has_tattoos", label: "Tatuaggi" },
] as const;

export const PhysicalCard = () => {
  const { attributes, save } = useAttributesAutoSave();
  const { profile, save: saveProfile } = useProfileAutoSave();

  const [measures, setMeasures] = useState<Record<string, string>>({});
  const [sizes, setSizes] = useState({ jacket_size: "", shirt_size: "", pants_size: "", shoe_size: "" });
  const [hair, setHair] = useState({ hair_color: "", eye_color: "", hair_length: "", hair_type: "" });
  const [ethnicity, setEthnicity] = useState("");
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [foodAllergies, setFoodAllergies] = useState<boolean | null>(null);

  useEffect(() => {
    if (!attributes) return;
    setMeasures(
      Object.fromEntries(
        MEASURES.map((m) => [m.key, attributes[m.key] != null ? String(attributes[m.key]) : ""])
      )
    );
    setSizes({
      jacket_size: attributes.jacket_size ?? "",
      shirt_size: attributes.shirt_size ?? "",
      pants_size: attributes.pants_size ?? "",
      shoe_size: attributes.shoe_size ?? "",
    });
    setHair({
      hair_color: attributes.hair_color ?? "",
      eye_color: attributes.eye_color ?? "",
      hair_length: attributes.hair_length ?? "",
      hair_type: attributes.hair_type ?? "",
    });
    setMarks(Object.fromEntries(MARKS.map((m) => [m.key, !!attributes[m.key]])));
    setFoodAllergies(attributes.has_food_allergies ?? null);
  }, [attributes]);

  useEffect(() => {
    setEthnicity(profile?.ethnicity ?? "");
  }, [profile]);

  const measureField = (key: (typeof MEASURES)[number]["key"], label: string) => (
    <FloatingInput
      key={key}
      label={label}
      inputMode="decimal"
      value={measures[key] ?? ""}
      onChange={(v) => setMeasures((prev) => ({ ...prev, [key]: v }))}
      onBlur={() => save({ [key]: toNumber(measures[key] ?? "") })}
    />
  );

  return (
    <SectionCard icon={<Shirt strokeWidth={1} />} title="Aspetto fisico">
      <div>
        <GroupLabel>Corporatura</GroupLabel>
        <div className="space-y-4 sm:space-y-8">
          <FieldGrid cols={3}>
            {measureField("height", "Altezza (cm)")}
            {measureField("weight", "Peso (kg)")}
            {measureField("chest", "Petto (cm)")}
          </FieldGrid>
          <FieldGrid cols={3}>
            {measureField("waist", "Vita (cm)")}
            {measureField("hips", "Fianchi (cm)")}
            {measureField("shoulder_width", "Larghezza spalle (cm)")}
          </FieldGrid>
          <FieldGrid cols={3}>
            {measureField("neck_size", "Misura collo camicia (cm)")}
            <div className="hidden sm:block" />
            <div className="hidden sm:block" />
          </FieldGrid>
        </div>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Taglie</GroupLabel>
        <div className="space-y-4 sm:space-y-8">
          <FieldGrid cols={3}>
            <FloatingSelect
              label="Taglia giacca"
              value={sizes.jacket_size}
              onValueChange={(v) => {
                setSizes((p) => ({ ...p, jacket_size: v }));
                save({ jacket_size: v });
              }}
              options={toOptions(JACKET_SIZES)}
            />
            <FloatingSelect
              label="Taglia maglia"
              value={sizes.shirt_size}
              onValueChange={(v) => {
                setSizes((p) => ({ ...p, shirt_size: v }));
                save({ shirt_size: v });
              }}
              options={toOptions(SHIRT_SIZES)}
            />
            <FloatingSelect
              label="Taglia pantaloni"
              value={sizes.pants_size}
              onValueChange={(v) => {
                setSizes((p) => ({ ...p, pants_size: v }));
                save({ pants_size: v });
              }}
              options={toOptions(PANTS_SIZES)}
            />
          </FieldGrid>
          <FieldGrid cols={3}>
            <FloatingSelect
              label="Numero scarpe"
              value={sizes.shoe_size}
              onValueChange={(v) => {
                setSizes((p) => ({ ...p, shoe_size: v }));
                save({ shoe_size: v });
              }}
              options={toOptions(SHOE_SIZES)}
            />
            <div className="hidden sm:block" />
            <div className="hidden sm:block" />
          </FieldGrid>
        </div>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Capelli e occhi</GroupLabel>
        <div className="space-y-4 sm:space-y-8">
          <FieldGrid cols={3}>
            <FloatingSelect
              label="Colore capelli"
              value={hair.hair_color}
              onValueChange={(v) => {
                setHair((p) => ({ ...p, hair_color: v }));
                save({ hair_color: v });
              }}
              options={toOptions(HAIR_COLORS)}
            />
            <FloatingSelect
              label="Colore occhi"
              value={hair.eye_color}
              onValueChange={(v) => {
                setHair((p) => ({ ...p, eye_color: v }));
                save({ eye_color: v });
              }}
              options={toOptions(EYE_COLORS)}
            />
            <FloatingSelect
              label="Lunghezza capelli"
              value={hair.hair_length}
              onValueChange={(v) => {
                setHair((p) => ({ ...p, hair_length: v }));
                save({ hair_length: v });
              }}
              options={toOptions(HAIR_LENGTHS)}
            />
          </FieldGrid>
          <FieldGrid cols={2}>
            <FloatingSelect
              label="Etnia"
              value={ethnicity}
              onValueChange={(v) => {
                setEthnicity(v);
                saveProfile({ ethnicity: v });
              }}
              options={toOptions(ETHNICITIES)}
            />
            <FloatingSelect
              label="Tipologia capelli"
              value={hair.hair_type}
              onValueChange={(v) => {
                setHair((p) => ({ ...p, hair_type: v }));
                save({ hair_type: v });
              }}
              options={toOptions(HAIR_TYPES)}
            />
          </FieldGrid>
        </div>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Segni particolari</GroupLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
          {MARKS.map((m) => (
            <ProfileCheckbox
              key={m.key}
              checked={!!marks[m.key]}
              onCheckedChange={(checked) => {
                setMarks((prev) => ({ ...prev, [m.key]: checked }));
                save({ [m.key]: checked });
              }}
              label={m.label}
            />
          ))}
        </div>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Hai allergie o intolleranze alimentari?</GroupLabel>
        <YesNoRadio
          value={foodAllergies}
          onValueChange={(v) => {
            setFoodAllergies(v);
            save({ has_food_allergies: v });
          }}
        />
      </div>
    </SectionCard>
  );
};
