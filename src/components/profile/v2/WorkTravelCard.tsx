import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DRIVING_LICENSES } from "@/lib/profileOptions";
import {
  CancelButton,
  ConfirmButton,
  FloatingInput,
  GroupHeading,
  ProfileCheckbox,
  CheckboxGrid,
  RadioField,
  SectionCard,
  SectionDivider,
  ValueChip,
  YesNoRadio,
} from "@/components/profile/fields/FormFields";
import { GeoFields, type AddressValue } from "@/components/profile/fields/AddressFields";
import { UploadBlock } from "./UploadBlock";
import { useProfileForm } from "./ProfileFormContext";

export const WorkTravelCard = () => {
  const { str, arr, triState, set, saveNow, profileRow } = useProfileForm();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<AddressValue>({});

  const cities = arr("p", "work_cities");
  const licenses = arr("p", "driving_licenses");

  const toggleLicense = (license: string) => {
    const next = licenses.includes(license)
      ? licenses.filter((l) => l !== license)
      : [...licenses, license];
    set("p", "driving_licenses", next);
  };

  const draftLabel = [draft.city, draft.province, draft.state].filter(Boolean).join(", ");

  return (
    <SectionCard icon={<Briefcase strokeWidth={1} />} title="Lavoro e viaggi">
      <div>
        <GroupHeading>Occupazione principale</GroupHeading>
        <FloatingInput
          label="Occupazione principale"
          value={str("p", "main_occupation")}
          onChange={(v) => set("p", "main_occupation", v)}
        />
      </div>

      <SectionDivider />

      <UploadBlock
        label="CV"
        description="Allega il tuo CV in formato PDF, massimo 10MB. Il file è privato e visibile solo a te e allo staff dell'agenzia."
        buttonLabel="Carica CV"
        accept="application/pdf"
        fileNamePrefix="cv"
        currentPath={profileRow?.cv_url ?? null}
        onUploaded={(path) => saveNow("p", { cv_url: path })}
      />

      <SectionDivider />

      <div>
        <GroupHeading>Città di appoggio</GroupHeading>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <ValueChip
              key={city}
              onRemove={() => set("p", "work_cities", cities.filter((c) => c !== city))}
            >
              {city}
            </ValueChip>
          ))}
        </div>

        {adding ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              <GeoFields value={draft} onChange={setDraft} />
            </div>
            <div className="flex gap-2">
              <ConfirmButton
                disabled={!draftLabel || cities.includes(draftLabel)}
                onClick={() => {
                  set("p", "work_cities", [...cities, draftLabel]);
                  setDraft({});
                  setAdding(false);
                }}
              />
              <CancelButton
                onClick={() => {
                  setDraft({});
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
            Aggiungi città
          </Button>
        )}
      </div>

      <SectionDivider />

      <div>
        <GroupHeading>Patenti</GroupHeading>
        <CheckboxGrid cols={4}>
          {DRIVING_LICENSES.map((license) => (
            <ProfileCheckbox
              key={license}
              checked={licenses.includes(license)}
              onCheckedChange={() => toggleLicense(license)}
              label={license}
            />
          ))}
        </CheckboxGrid>
      </div>

      <RadioField label="Possiedo un'automobile">
        <YesNoRadio value={triState("p", "has_car")} onValueChange={(v) => set("p", "has_car", v)} />
      </RadioField>

      <RadioField label="Possiedo una moto">
        <YesNoRadio
          value={triState("p", "has_motorbike")}
          onValueChange={(v) => set("p", "has_motorbike", v)}
        />
      </RadioField>
    </SectionCard>
  );
};
