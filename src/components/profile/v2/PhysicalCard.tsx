import { Shirt } from "lucide-react";
import {
  BRA_SIZES,
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
  GroupHeading,
  ProfileCheckbox,
  CheckboxGrid,
  RadioField,
  SectionCard,
  SectionDivider,
  YesNoRadio,
  toOptions,
} from "@/components/profile/fields/FormFields";
import { toNumber, useProfileForm } from "./ProfileFormContext";
import { chestLabel, visiblePhysicalFields } from "@/lib/roleVisibility";
import { isAdultBirthDate } from "@/lib/guardianship";
import type { ReactNode } from "react";

const MARKS = [
  { key: "has_vitiligo", label: "Vitiligine" },
  { key: "has_freckles", label: "Lentiggini" },
  { key: "has_diastema", label: "Diastema" },
  { key: "has_albinism", label: "Albinismo" },
  { key: "has_dwarfism", label: "Nanismo" },
  { key: "has_tattoos", label: "Tatuaggi" },
] as const;

/** Riempie la riga a 3 colonne con celle vuote per mantenere l'allineamento. */
const padRow = (nodes: ReactNode[]) => {
  const filled = [...nodes];
  while (filled.length % 3 !== 0) {
    filled.push(<div key={`pad-${filled.length}`} className="hidden sm:block" />);
  }
  return filled;
};

export const PhysicalCard = () => {
  const { str, bool, triState, set, arr, obj } = useProfileForm();

  const roles = arr("p", "talent_categories");
  const gender = str("p", "gender") || null;
  const isAdult = isAdultBirthDate(str("p", "birth_date") || null);
  const visible = visiblePhysicalFields({ roles, isAdult, gender });
  const show = (key: string) => visible.includes(key);

  const underwear = obj<Record<string, unknown>>("a", "underwear_sizes");
  const braSize = typeof underwear.bra === "string" ? underwear.bra : "";

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
      key={key}
      label={label}
      value={str("a", key)}
      onValueChange={(v) => set("a", key, v)}
      options={toOptions(options)}
    />
  );

  const bodyFields: ReactNode[] = [
    ...(show("height") ? [measureField("height", "Altezza (cm)")] : []),
    measureField("weight", "Peso (kg)"),
    ...(show("chest") ? [measureField("chest", chestLabel(gender))] : []),
    ...(show("waist") ? [measureField("waist", "Vita (cm)")] : []),
    ...(show("hips") ? [measureField("hips", "Fianchi (cm)")] : []),
    ...(show("shoulder_width")
      ? [measureField("shoulder_width", "Larghezza spalle (cm)")]
      : []),
    ...(show("neck_size") ? [measureField("neck_size", "Misura collo camicia (cm)")] : []),
  ];

  const sizeFields: ReactNode[] = [
    ...(show("jacket_size") ? [attrSelect("jacket_size", "Taglia giacca", JACKET_SIZES)] : []),
    attrSelect("shirt_size", "Taglia maglia", SHIRT_SIZES),
    ...(show("pants_size") ? [attrSelect("pants_size", "Taglia pantaloni", PANTS_SIZES)] : []),
    ...(show("shoe_size") ? [attrSelect("shoe_size", "Numero scarpe", SHOE_SIZES)] : []),
    ...(show("bra_size")
      ? [
          <FloatingSelect
            key="bra_size"
            label="Taglia reggiseno"
            value={braSize}
            onValueChange={(v) => set("a", "underwear_sizes", { ...underwear, bra: v })}
            options={toOptions(BRA_SIZES)}
          />,
        ]
      : []),
  ];

  const hairFields: ReactNode[] = [
    ...(show("hair_color") ? [attrSelect("hair_color", "Colore capelli", HAIR_COLORS)] : []),
    ...(show("eye_color") ? [attrSelect("eye_color", "Colore occhi", EYE_COLORS)] : []),
    ...(show("hair_length") ? [attrSelect("hair_length", "Lunghezza capelli", HAIR_LENGTHS)] : []),
    ...(show("hair_type") ? [attrSelect("hair_type", "Tipologia capelli", HAIR_TYPES)] : []),
    ...(show("ethnicity")
      ? [
          <FloatingSelect
            key="ethnicity"
            label="Etnia"
            value={str("p", "ethnicity")}
            onValueChange={(v) => set("p", "ethnicity", v)}
            options={toOptions(ETHNICITIES)}
          />,
        ]
      : []),
  ];

  return (
    <SectionCard icon={<Shirt strokeWidth={1} />} title="Aspetto fisico">
      <div>
        <GroupHeading>Corporatura</GroupHeading>
        <FieldGrid cols={3}>{padRow(bodyFields)}</FieldGrid>
      </div>

      <SectionDivider />

      <div>
        <GroupHeading>Taglie</GroupHeading>
        <FieldGrid cols={3}>{padRow(sizeFields)}</FieldGrid>
      </div>

      {hairFields.length > 0 && (
        <>
          <SectionDivider />
          <div>
            <GroupHeading>Capelli e occhi</GroupHeading>
            <FieldGrid cols={3}>{padRow(hairFields)}</FieldGrid>
          </div>
        </>
      )}

      <SectionDivider />

      <div>
        <GroupHeading>Segni particolari</GroupHeading>
        <CheckboxGrid cols={3}>
          {MARKS.map((m) => (
            <ProfileCheckbox
              key={m.key}
              checked={bool("a", m.key)}
              onCheckedChange={(checked) => set("a", m.key, checked)}
              label={m.label}
            />
          ))}
        </CheckboxGrid>
      </div>

      <SectionDivider />

      <RadioField label="Hai allergie o intolleranze alimentari?">
        <YesNoRadio
          value={triState("a", "has_food_allergies")}
          onValueChange={(v) => set("a", "has_food_allergies", v)}
        />
      </RadioField>
    </SectionCard>
  );
};
