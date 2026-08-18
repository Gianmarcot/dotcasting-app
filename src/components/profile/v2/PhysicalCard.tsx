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
import { toNumber, useProfileForm } from "./ProfileFormContext";

const MARKS = [
  { key: "has_vitiligo", label: "Vitiligine" },
  { key: "has_freckles", label: "Lentiggini" },
  { key: "has_diastema", label: "Diastema" },
  { key: "has_albinism", label: "Albinismo" },
  { key: "has_dwarfism", label: "Nanismo" },
  { key: "has_tattoos", label: "Tatuaggi" },
] as const;

export const PhysicalCard = () => {
  const { str, bool, triState, set } = useProfileForm();

  const measureField = (key: string, label: string) => (
    <FloatingInput
      key={key}
      label={label}
      inputMode="decimal"
      value={str("a", key)}
      onChange={(v) => set("a", key, v === "" ? null : toNumber(v))}
    />
  );

  const attrSelect = (key: string, label: string, options: readonly string[]) => (
    <FloatingSelect
      label={label}
      value={str("a", key)}
      onValueChange={(v) => set("a", key, v)}
      options={toOptions(options)}
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
            {attrSelect("jacket_size", "Taglia giacca", JACKET_SIZES)}
            {attrSelect("shirt_size", "Taglia maglia", SHIRT_SIZES)}
            {attrSelect("pants_size", "Taglia pantaloni", PANTS_SIZES)}
          </FieldGrid>
          <FieldGrid cols={3}>
            {attrSelect("shoe_size", "Numero scarpe", SHOE_SIZES)}
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
            {attrSelect("hair_color", "Colore capelli", HAIR_COLORS)}
            {attrSelect("eye_color", "Colore occhi", EYE_COLORS)}
            {attrSelect("hair_length", "Lunghezza capelli", HAIR_LENGTHS)}
          </FieldGrid>
          <FieldGrid cols={2}>
            <FloatingSelect
              label="Etnia"
              value={str("p", "ethnicity")}
              onValueChange={(v) => set("p", "ethnicity", v)}
              options={toOptions(ETHNICITIES)}
            />
            {attrSelect("hair_type", "Tipologia capelli", HAIR_TYPES)}
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
              checked={bool("a", m.key)}
              onCheckedChange={(checked) => set("a", m.key, checked)}
              label={m.label}
            />
          ))}
        </div>
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Hai allergie o intolleranze alimentari?</GroupLabel>
        <YesNoRadio
          value={triState("a", "has_food_allergies")}
          onValueChange={(v) => set("a", "has_food_allergies", v)}
        />
      </div>
    </SectionCard>
  );
};
