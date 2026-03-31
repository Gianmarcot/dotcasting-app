import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { TalentFilters } from "@/hooks/useTalents";
import {
  TALENT_ROLES,
  GENDERS,
  NATIONALITIES,
  GENDER_IDENTITIES,
  REPRESENTATION_TYPES,
  ETHNICITIES,
  EYE_COLORS,
  HAIR_COLORS,
  HAIR_LENGTHS,
  SHIRT_SIZES,
  LANGUAGES,
} from "@/lib/profileOptions";

interface TalentFilterPanelProps {
  filters: TalentFilters;
  onFiltersChange: (filters: TalentFilters) => void;
}

const ALL_ROLES = [
  ...TALENT_ROLES.artistic,
  ...TALENT_ROLES.creative,
  ...TALENT_ROLES.production,
];

// Count active filters per group
const countGroup = (filters: TalentFilters, keys: (keyof TalentFilters)[]): number => {
  let count = 0;
  for (const key of keys) {
    const val = filters[key];
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val) && val.length === 0) continue;
    count++;
  }
  return count;
};

const FilterLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-medium text-muted-foreground mb-1 block">{children}</label>
);

const RangeInputs = ({
  label,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
  placeholder,
}: {
  label: string;
  minVal?: number;
  maxVal?: number;
  onMinChange: (v: number | undefined) => void;
  onMaxChange: (v: number | undefined) => void;
  placeholder?: [string, string];
}) => (
  <div>
    <FilterLabel>{label}</FilterLabel>
    <div className="flex gap-1.5">
      <Input
        type="number"
        placeholder={placeholder?.[0] || "Min"}
        className="text-xs h-8"
        value={minVal ?? ""}
        onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
      />
      <Input
        type="number"
        placeholder={placeholder?.[1] || "Max"}
        className="text-xs h-8"
        value={maxVal ?? ""}
        onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
      />
    </div>
  </div>
);

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Tutti",
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[] | string[];
  placeholder?: string;
}) => {
  const opts = typeof options[0] === "string"
    ? (options as string[]).map((o) => ({ value: o, label: o }))
    : (options as { value: string; label: string }[]);

  return (
    <div>
      <FilterLabel>{label}</FilterLabel>
      <Select
        value={value || "_all"}
        onValueChange={(v) => onChange(v === "_all" ? undefined : v)}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{placeholder}</SelectItem>
          {opts.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const TalentFilterPanel = ({ filters, onFiltersChange }: TalentFilterPanelProps) => {
  const update = (partial: Partial<TalentFilters>) =>
    onFiltersChange({ ...filters, ...partial });

  const resetAll = () => onFiltersChange({});

  const hasAnyFilter = Object.entries(filters).some(([, v]) => {
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });

  const groupCounts = {
    role: countGroup(filters, ["roles", "availability"]),
    bio: countGroup(filters, ["gender", "ageMin", "ageMax", "nationality", "city", "genderIdentity", "representationType"]),
    physical: countGroup(filters, ["ethnicity", "eyeColor", "hairColor", "hairLength"]),
    measures: countGroup(filters, ["heightMin", "heightMax", "weightMin", "weightMax", "shoeMin", "shoeMax", "chestMin", "chestMax", "hipsMin", "hipsMax", "clothingSize"]),
    skills: countGroup(filters, ["skill", "language"]),
    work: countGroup(filters, ["hasVat", "travelAvailability"]),
  };

  const GroupBadge = ({ count }: { count: number }) =>
    count > 0 ? (
      <Badge className="ml-auto mr-2 h-5 min-w-[20px] justify-center bg-primary text-primary-foreground text-[10px]">
        {count}
      </Badge>
    ) : null;

  return (
    <div className="w-[220px] shrink-0 bg-muted/30 border-r overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <span className="text-sm font-semibold text-foreground">Filtri</span>
        {hasAnyFilter && (
          <button onClick={resetAll} className="dc-link-action text-xs">
            Reset tutto
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cerca nome, cognome..."
            className="pl-8 h-8 text-xs"
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value || undefined })}
          />
        </div>
      </div>

      {/* Accordion groups */}
      <Accordion type="multiple" className="px-1">
        {/* 1. Ruolo & disponibilità */}
        <AccordionItem value="role" className="border-b-0">
          <AccordionTrigger className="px-2 py-2 text-xs font-medium hover:no-underline">
            <span className="flex items-center gap-1">
              Ruolo & disponibilità
              <GroupBadge count={groupCounts.role} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 space-y-2">
            <FilterLabel>Ruolo talent</FilterLabel>
            <div className="max-h-[200px] overflow-y-auto space-y-1.5">
              {ALL_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    className="h-3.5 w-3.5"
                    checked={filters.roles?.includes(role) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.roles || [];
                      update({
                        roles: checked
                          ? [...current, role]
                          : current.filter((r) => r !== role),
                      });
                    }}
                  />
                  {role}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Anagrafica */}
        <AccordionItem value="bio" className="border-b-0">
          <AccordionTrigger className="px-2 py-2 text-xs font-medium hover:no-underline">
            <span className="flex items-center gap-1">
              Anagrafica
              <GroupBadge count={groupCounts.bio} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 space-y-2.5">
            <FilterSelect
              label="Sesso"
              value={filters.gender}
              onChange={(v) => update({ gender: v })}
              options={GENDERS}
            />
            <RangeInputs
              label="Età"
              minVal={filters.ageMin}
              maxVal={filters.ageMax}
              onMinChange={(v) => update({ ageMin: v })}
              onMaxChange={(v) => update({ ageMax: v })}
            />
            <FilterSelect
              label="Nazionalità"
              value={filters.nationality}
              onChange={(v) => update({ nationality: v })}
              options={NATIONALITIES}
            />
            <div>
              <FilterLabel>Città</FilterLabel>
              <Input
                placeholder="Es. Milano"
                className="h-8 text-xs"
                value={filters.city || ""}
                onChange={(e) => update({ city: e.target.value || undefined })}
              />
            </div>
            <FilterSelect
              label="Identità di genere"
              value={filters.genderIdentity}
              onChange={(v) => update({ genderIdentity: v })}
              options={GENDER_IDENTITIES.map((g) => ({ value: g, label: g }))}
            />
            <FilterSelect
              label="Rappresentanza"
              value={filters.representationType}
              onChange={(v) => update({ representationType: v })}
              options={REPRESENTATION_TYPES}
            />
          </AccordionContent>
        </AccordionItem>

        {/* 3. Aspetto fisico */}
        <AccordionItem value="physical" className="border-b-0">
          <AccordionTrigger className="px-2 py-2 text-xs font-medium hover:no-underline">
            <span className="flex items-center gap-1">
              Aspetto fisico
              <GroupBadge count={groupCounts.physical} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 space-y-2.5">
            <FilterSelect
              label="Carnagione"
              value={filters.ethnicity}
              onChange={(v) => update({ ethnicity: v })}
              options={ETHNICITIES.map((e) => ({ value: e, label: e }))}
            />
            <FilterSelect
              label="Colore occhi"
              value={filters.eyeColor}
              onChange={(v) => update({ eyeColor: v })}
              options={EYE_COLORS.map((c) => ({ value: c, label: c }))}
            />
            <FilterSelect
              label="Colore capelli"
              value={filters.hairColor}
              onChange={(v) => update({ hairColor: v })}
              options={HAIR_COLORS.map((c) => ({ value: c, label: c }))}
            />
            <FilterSelect
              label="Lunghezza capelli"
              value={filters.hairLength}
              onChange={(v) => update({ hairLength: v })}
              options={HAIR_LENGTHS.map((l) => ({ value: l, label: l }))}
            />
          </AccordionContent>
        </AccordionItem>

        {/* 4. Misure */}
        <AccordionItem value="measures" className="border-b-0">
          <AccordionTrigger className="px-2 py-2 text-xs font-medium hover:no-underline">
            <span className="flex items-center gap-1">
              Misure
              <GroupBadge count={groupCounts.measures} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 space-y-2.5">
            <RangeInputs
              label="Altezza (cm)"
              minVal={filters.heightMin}
              maxVal={filters.heightMax}
              onMinChange={(v) => update({ heightMin: v })}
              onMaxChange={(v) => update({ heightMax: v })}
            />
            <RangeInputs
              label="Peso (kg)"
              minVal={filters.weightMin}
              maxVal={filters.weightMax}
              onMinChange={(v) => update({ weightMin: v })}
              onMaxChange={(v) => update({ weightMax: v })}
            />
            <FilterSelect
              label="Taglia abbigliamento"
              value={filters.clothingSize}
              onChange={(v) => update({ clothingSize: v })}
              options={SHIRT_SIZES.map((s) => ({ value: s, label: s }))}
            />
            <RangeInputs
              label="Scarpe"
              minVal={filters.shoeMin}
              maxVal={filters.shoeMax}
              onMinChange={(v) => update({ shoeMin: v })}
              onMaxChange={(v) => update({ shoeMax: v })}
            />
            <RangeInputs
              label="Busto (cm)"
              minVal={filters.chestMin}
              maxVal={filters.chestMax}
              onMinChange={(v) => update({ chestMin: v })}
              onMaxChange={(v) => update({ chestMax: v })}
            />
            <RangeInputs
              label="Fianchi (cm)"
              minVal={filters.hipsMin}
              maxVal={filters.hipsMax}
              onMinChange={(v) => update({ hipsMin: v })}
              onMaxChange={(v) => update({ hipsMax: v })}
            />
          </AccordionContent>
        </AccordionItem>

        {/* 5. Competenze & lingue */}
        <AccordionItem value="skills" className="border-b-0">
          <AccordionTrigger className="px-2 py-2 text-xs font-medium hover:no-underline">
            <span className="flex items-center gap-1">
              Competenze & lingue
              <GroupBadge count={groupCounts.skills} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 space-y-2.5">
            <div>
              <FilterLabel>Competenza</FilterLabel>
              <Input
                placeholder="Es. danza, canto..."
                className="h-8 text-xs"
                value={filters.skill || ""}
                onChange={(e) => update({ skill: e.target.value || undefined })}
              />
            </div>
            <FilterSelect
              label="Lingua"
              value={filters.language}
              onChange={(v) => update({ language: v })}
              options={LANGUAGES.map((l) => ({ value: l, label: l }))}
            />
          </AccordionContent>
        </AccordionItem>

        {/* 6. Info lavoro & viaggi */}
        <AccordionItem value="work" className="border-b-0">
          <AccordionTrigger className="px-2 py-2 text-xs font-medium hover:no-underline">
            <span className="flex items-center gap-1">
              Info lavoro & viaggi
              <GroupBadge count={groupCounts.work} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 space-y-2.5">
            <FilterSelect
              label="P.IVA"
              value={filters.hasVat === undefined ? undefined : filters.hasVat ? "yes" : "no"}
              onChange={(v) => update({ hasVat: v === undefined ? undefined : v === "yes" })}
              options={[
                { value: "yes", label: "Sì" },
                { value: "no", label: "No" },
              ]}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
