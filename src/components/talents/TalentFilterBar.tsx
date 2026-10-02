import { Badge } from "@/components/ui/badge";
import { FieldCluster, FloatingInput, FloatingSelect } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Switch } from "@/components/ui/switch";

import { TalentFilters } from "@/hooks/useTalents";
import { FISCAL_STATUS_FILTER_OPTIONS, type FiscalStatus } from "@/lib/fiscalStatus";
import {
  GENDERS,
  GENDER_IDENTITIES,
  REPRESENTATION_TYPES,
  NATIONALITIES,
  ETHNICITIES,
  EYE_COLORS,
  HAIR_COLORS,
  HAIR_LENGTHS,
  SHIRT_SIZES,
  LANGUAGES,
  TALENT_ROLES,
} from "@/lib/profileOptions";

interface TalentFilterBarProps {
  filters: TalentFilters;
  onFiltersChange: (filters: TalentFilters) => void;
}

const ALL_ROLES = [
  ...TALENT_ROLES.artistic,
  ...TALENT_ROLES.creative,
  ...TALENT_ROLES.production,
];

const countGroup = (filters: TalentFilters, keys: (keyof TalentFilters)[]) =>
  keys.reduce((n, k) => {
    const v = filters[k];
    if (v === undefined || v === "" || v === null) return n;
    return n + 1;
  }, 0);

interface FilterGroupProps {
  label: string;
  count: number;
  children: React.ReactNode;
  wide?: boolean;
}

const FilterGroup = ({ label, count, children, wide }: FilterGroupProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button type="button" className="dc-select-trigger w-auto gap-3 rounded-full">
        <span className="flex items-center gap-2">
          {label}
          {count > 0 && (
            <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
              {count}
            </Badge>
          )}
        </span>
        <ChevronDown className="h-5 w-5" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      data-surface="raised"
      className={cn(
        "rounded-2xl border-0 shadow-md p-4 max-w-[calc(100vw-32px)]",
        wide ? "w-[460px]" : "w-[280px]"
      )}
    >
      <div className="space-y-3">
        {children}
      </div>
    </PopoverContent>
  </Popover>
);


export const TalentFilterBar = ({ filters, onFiltersChange }: TalentFilterBarProps) => {
  const set = (partial: Partial<TalentFilters>) =>
    onFiltersChange({ ...filters, ...partial });

  const clearAll = () => onFiltersChange({ search: filters.search });

  const hasAny =
    Object.entries(filters).filter(
      ([k, v]) => k !== "search" && v !== undefined && v !== "" && v !== null
    ).length > 0;

  const selectClear = (val: string) => (val === "__all" ? undefined : val);

  const groupCounts = {
    role: countGroup(filters, ["talentRole", "availability"]),
    anagrafica: countGroup(filters, ["gender", "ageMin", "ageMax", "city", "region", "genderIdentity", "representationType", "nationality"]),
    aspetto: countGroup(filters, ["ethnicity", "eyeColor", "hairColor", "hairLength"]),
    misure: countGroup(filters, ["heightMin", "heightMax", "weightMin", "weightMax", "shirtSize", "shoeMin", "shoeMax", "chestMin", "chestMax", "hipsMin", "hipsMax"]),
    competenze: countGroup(filters, ["skillSearch", "language"]),
    lavoro: countGroup(filters, ["hasVat", "travelAvailability", "fiscalStatus"]),
  };

  return (
    <Surface variant="raised" className="flex flex-wrap items-center gap-x-2 gap-y-2">


      {/* Ruolo */}
      <FilterGroup label="Ruolo" count={groupCounts.role}>
        <FloatingSelect
          label="Ruolo talent"
          value={filters.talentRole || "__all"}
          onValueChange={(v) => set({ talentRole: selectClear(v) })}
          options={[{ value: "__all", label: "Tutti" }, ...ALL_ROLES.map((r) => ({ value: r, label: r }))]}
        />
        <FloatingSelect
          label="Disponibilità"
          value={filters.availability || "__all"}
          onValueChange={(v) => set({ availability: selectClear(v) })}
          options={[
            { value: "__all", label: "Tutte" },
            { value: "immediate", label: "Immediata" },
            { value: "flexible", label: "Flessibile" },
          ]}
        />
      </FilterGroup>

      {/* Anagrafica */}
      <FilterGroup label="Anagrafica" count={groupCounts.anagrafica} wide>
        <FloatingSelect
          label="Sesso"
          value={filters.gender || "__all"}
          onValueChange={(v) => set({ gender: selectClear(v) })}
          options={[{ value: "__all", label: "Tutti" }, ...GENDERS]}
        />
        <FieldCluster>
          <FloatingInput label="Età minima" type="number" inputMode="numeric" value={filters.ageMin?.toString() || ""} onChange={(v) => set({ ageMin: v ? Number(v) : undefined })} />
          <FloatingInput label="Età massima" type="number" inputMode="numeric" value={filters.ageMax?.toString() || ""} onChange={(v) => set({ ageMax: v ? Number(v) : undefined })} />
        </FieldCluster>
        <FloatingInput label="Città" value={filters.city || ""} onChange={(v) => set({ city: v || undefined })} />
        <FloatingSelect
          label="Identità di genere"
          value={filters.genderIdentity || "__all"}
          onValueChange={(v) => set({ genderIdentity: selectClear(v) })}
          options={[{ value: "__all", label: "Tutti" }, ...GENDER_IDENTITIES.map((g) => ({ value: g, label: g }))]}
        />
        <FloatingSelect
          label="Rappresentanza"
          value={filters.representationType || "__all"}
          onValueChange={(v) => set({ representationType: selectClear(v) })}
          options={[{ value: "__all", label: "Tutti" }, ...REPRESENTATION_TYPES]}
        />
        <FloatingSelect
          label="Nazionalità"
          value={filters.nationality || "__all"}
          onValueChange={(v) => set({ nationality: selectClear(v) })}
          options={[{ value: "__all", label: "Tutte" }, ...NATIONALITIES.map((n) => ({ value: n, label: n }))]}
        />
      </FilterGroup>

      {/* Aspetto */}
      <FilterGroup label="Aspetto" count={groupCounts.aspetto}>
        <FloatingSelect label="Carnagione" value={filters.ethnicity || "__all"} onValueChange={(v) => set({ ethnicity: selectClear(v) })} options={[{ value: "__all", label: "Tutte" }, ...ETHNICITIES.map((v) => ({ value: v, label: v }))]} />
        <FloatingSelect label="Colore occhi" value={filters.eyeColor || "__all"} onValueChange={(v) => set({ eyeColor: selectClear(v) })} options={[{ value: "__all", label: "Tutti" }, ...EYE_COLORS.map((v) => ({ value: v, label: v }))]} />
        <FloatingSelect label="Colore capelli" value={filters.hairColor || "__all"} onValueChange={(v) => set({ hairColor: selectClear(v) })} options={[{ value: "__all", label: "Tutti" }, ...HAIR_COLORS.map((v) => ({ value: v, label: v }))]} />
        <FloatingSelect label="Lunghezza capelli" value={filters.hairLength || "__all"} onValueChange={(v) => set({ hairLength: selectClear(v) })} options={[{ value: "__all", label: "Tutte" }, ...HAIR_LENGTHS.map((v) => ({ value: v, label: v }))]} />
      </FilterGroup>

      {/* Misure */}
      <FilterGroup label="Misure" count={groupCounts.misure} wide>
        <FieldCluster>
          <FloatingInput label="Altezza min (cm)" type="number" inputMode="numeric" value={filters.heightMin?.toString() || ""} onChange={(v) => set({ heightMin: v ? Number(v) : undefined })} />
          <FloatingInput label="Altezza max (cm)" type="number" inputMode="numeric" value={filters.heightMax?.toString() || ""} onChange={(v) => set({ heightMax: v ? Number(v) : undefined })} />
        </FieldCluster>
        <FieldCluster>
          <FloatingInput label="Peso min (kg)" type="number" inputMode="numeric" value={filters.weightMin?.toString() || ""} onChange={(v) => set({ weightMin: v ? Number(v) : undefined })} />
          <FloatingInput label="Peso max (kg)" type="number" inputMode="numeric" value={filters.weightMax?.toString() || ""} onChange={(v) => set({ weightMax: v ? Number(v) : undefined })} />
        </FieldCluster>
        <FloatingSelect label="Taglia" value={filters.shirtSize || "__all"} onValueChange={(v) => set({ shirtSize: selectClear(v) })} options={[{ value: "__all", label: "Tutte" }, ...SHIRT_SIZES.map((v) => ({ value: v, label: v }))]} />
        <FieldCluster>
          <FloatingInput label="Scarpe min" type="number" inputMode="numeric" value={filters.shoeMin?.toString() || ""} onChange={(v) => set({ shoeMin: v ? Number(v) : undefined })} />
          <FloatingInput label="Scarpe max" type="number" inputMode="numeric" value={filters.shoeMax?.toString() || ""} onChange={(v) => set({ shoeMax: v ? Number(v) : undefined })} />
        </FieldCluster>
        <FieldCluster>
          <FloatingInput label="Busto min (cm)" type="number" inputMode="numeric" value={filters.chestMin?.toString() || ""} onChange={(v) => set({ chestMin: v ? Number(v) : undefined })} />
          <FloatingInput label="Busto max (cm)" type="number" inputMode="numeric" value={filters.chestMax?.toString() || ""} onChange={(v) => set({ chestMax: v ? Number(v) : undefined })} />
        </FieldCluster>
        <FieldCluster>
          <FloatingInput label="Fianchi min (cm)" type="number" inputMode="numeric" value={filters.hipsMin?.toString() || ""} onChange={(v) => set({ hipsMin: v ? Number(v) : undefined })} />
          <FloatingInput label="Fianchi max (cm)" type="number" inputMode="numeric" value={filters.hipsMax?.toString() || ""} onChange={(v) => set({ hipsMax: v ? Number(v) : undefined })} />
        </FieldCluster>
      </FilterGroup>

      {/* Competenze */}
      <FilterGroup label="Competenze" count={groupCounts.competenze}>
        <FloatingInput label="Competenza" value={filters.skillSearch || ""} onChange={(v) => set({ skillSearch: v || undefined })} />
        <FloatingSelect label="Lingua" value={filters.language || "__all"} onValueChange={(v) => set({ language: selectClear(v) })} options={[{ value: "__all", label: "Tutte" }, ...LANGUAGES.map((v) => ({ value: v, label: v }))]} />
      </FilterGroup>

      {/* Lavoro */}
      <FilterGroup label="Lavoro" count={groupCounts.lavoro}>
        <FloatingSelect
          label="P.IVA"
          value={filters.hasVat === true ? "yes" : filters.hasVat === false ? "no" : "__all"}
          onValueChange={(v) => set({ hasVat: v === "yes" ? true : v === "no" ? false : undefined })}
          options={[{ value: "__all", label: "Tutti" }, { value: "yes", label: "Sì" }, { value: "no", label: "No" }]}
        />
        <FloatingSelect
          label="Codice fiscale"
          value={filters.fiscalStatus || "__all"}
          onValueChange={(v) => set({ fiscalStatus: v === "__all" ? undefined : (v as FiscalStatus) })}
          options={[{ value: "__all", label: "Tutti" }, ...FISCAL_STATUS_FILTER_OPTIONS]}
        />
        <FloatingSelect
          label="Disponibilità viaggi"
          value={filters.travelAvailability || "__all"}
          onValueChange={(v) => set({ travelAvailability: selectClear(v) })}
          options={[
            { value: "__all", label: "Tutte" },
            { value: "local", label: "Locale" },
            { value: "national", label: "Nazionale" },
            { value: "international", label: "Internazionale" },
          ]}
        />
      </FilterGroup>

      {/* Reset */}
      {hasAny && (
        <button onClick={clearAll} className="text-sm text-primary hover:underline ml-1">
          Reset
        </button>
      )}

      {/* Solo CF validi */}
      <label className="ml-auto flex items-center gap-3 cursor-pointer text-sm font-medium text-foreground">
        <Switch
          checked={!!filters.onlyValidCf}
          onCheckedChange={(v) => set({ onlyValidCf: v || undefined })}
        />
        Solo CF validi
      </label>
    </Surface>
  );
};

