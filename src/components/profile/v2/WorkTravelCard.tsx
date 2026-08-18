import { useEffect, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { DRIVING_LICENSES } from "@/lib/profileOptions";
import {
  CancelButton,
  ConfirmButton,
  FloatingInput,
  GroupLabel,
  ProfileCheckbox,
  SectionCard,
  SectionDivider,
  ValueChip,
  YesNoRadio,
} from "@/components/profile/fields/FormFields";
import { GeoFields, type AddressValue } from "@/components/profile/fields/AddressFields";
import { UploadBlock } from "./UploadBlock";
import { useProfileAutoSave } from "./useProfileAutoSave";

export const WorkTravelCard = () => {
  const { profile, save } = useProfileAutoSave();

  const [occupation, setOccupation] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [licenses, setLicenses] = useState<string[]>([]);
  const [hasCar, setHasCar] = useState<boolean | null>(null);
  const [hasMotorbike, setHasMotorbike] = useState<boolean | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<AddressValue>({});

  useEffect(() => {
    if (!profile) return;
    setOccupation(profile.main_occupation ?? "");
    setCities(profile.work_cities ?? []);
    setLicenses(profile.driving_licenses ?? []);
    setHasCar(profile.has_car ?? null);
    setHasMotorbike(profile.has_motorbike ?? null);
  }, [profile]);

  const persistCities = (next: string[]) => {
    setCities(next);
    save({ work_cities: next.length > 0 ? next : null });
  };

  const toggleLicense = (license: string) => {
    const next = licenses.includes(license)
      ? licenses.filter((l) => l !== license)
      : [...licenses, license];
    setLicenses(next);
    save({ driving_licenses: next.length > 0 ? next : null });
  };

  const draftLabel = [draft.city, draft.province, draft.state].filter(Boolean).join(", ");

  return (
    <SectionCard icon={<Briefcase strokeWidth={1} />} title="Lavoro e viaggi">
      <div>
        <GroupLabel>Occupazione principale</GroupLabel>
        <FloatingInput
          label="Occupazione principale"
          value={occupation}
          onChange={setOccupation}
          onBlur={() => save({ main_occupation: occupation || null })}
        />
      </div>

      <SectionDivider />

      <UploadBlock
        label="CV"
        description="Allega il tuo CV in formato PDF, massimo 10MB. Il file è privato e visibile solo a te e allo staff dell'agenzia."
        buttonLabel="Carica CV"
        accept="application/pdf"
        fileNamePrefix="cv"
        currentPath={profile?.cv_url ?? null}
        onUploaded={(path) => save({ cv_url: path })}
      />

      <SectionDivider />

      <div>
        <GroupLabel>Città di appoggio</GroupLabel>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <ValueChip key={city} onRemove={() => persistCities(cities.filter((c) => c !== city))}>
              {city}
            </ValueChip>
          ))}
        </div>

        {adding ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
              <GeoFields value={draft} onChange={setDraft} />
            </div>
            <div className="flex gap-2">
              <ConfirmButton
                disabled={!draftLabel || cities.includes(draftLabel)}
                onClick={() => {
                  persistCities([...cities, draftLabel]);
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
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 flex h-12 items-center gap-2 rounded-full border border-border bg-background px-5 text-[15px] text-foreground"
          >
            <Plus className="h-5 w-5" />
            Aggiungi città
          </button>
        )}
      </div>

      <SectionDivider />

      <div>
        <GroupLabel>Patenti</GroupLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
          {DRIVING_LICENSES.map((license) => (
            <ProfileCheckbox
              key={license}
              checked={licenses.includes(license)}
              onCheckedChange={() => toggleLicense(license)}
              label={license}
            />
          ))}
        </div>
      </div>

      <div>
        <GroupLabel>Possiedo un'automobile</GroupLabel>
        <YesNoRadio
          value={hasCar}
          onValueChange={(v) => {
            setHasCar(v);
            save({ has_car: v });
          }}
        />
      </div>

      <div>
        <GroupLabel>Possiedo una moto</GroupLabel>
        <YesNoRadio
          value={hasMotorbike}
          onValueChange={(v) => {
            setHasMotorbike(v);
            save({ has_motorbike: v });
          }}
        />
      </div>
    </SectionCard>
  );
};
