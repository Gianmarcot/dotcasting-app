import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface TalentFilterSidebarProps {
  filters: TalentFilters;
  onFiltersChange: (filters: TalentFilters) => void;
}

const ALL_ROLES = [
  ...TALENT_ROLES.artistic,
  ...TALENT_ROLES.creative,
  ...TALENT_ROLES.production,
];

// Count active filters per group
const countGroup = (filters: TalentFilters, keys: (keyof TalentFilters)[]) =>
  keys.reduce((n, k) => {
    const v = filters[k];
    if (v === undefined || v === "" || v === null) return n;
    if (typeof v === "boolean") return n + 1;
    return n + 1;
  }, 0);

export const TalentFilterSidebar = ({
  filters,
  onFiltersChange,
}: TalentFilterSidebarProps) => {
  const set = (partial: Partial<TalentFilters>) =>
    onFiltersChange({ ...filters, ...partial });

  const clearAll = () => onFiltersChange({ search: filters.search });

  const hasAny =
    Object.entries(filters).filter(
      ([k, v]) => k !== "search" && v !== undefined && v !== "" && v !== null
    ).length > 0;

  const groupCounts = {
    role: countGroup(filters, ["talentRole", "availability"]),
    anagrafica: countGroup(filters, [
      "gender",
      "ageMin",
      "ageMax",
      "city",
      "region",
      "genderIdentity",
      "representationType",
      "nationality",
    ]),
    aspetto: countGroup(filters, [
      "ethnicity",
      "eyeColor",
      "hairColor",
      "hairLength",
    ]),
    misure: countGroup(filters, [
      "heightMin",
      "heightMax",
      "weightMin",
      "weightMax",
      "shirtSize",
      "shoeMin",
      "shoeMax",
      "chestMin",
      "chestMax",
      "hipsMin",
      "hipsMax",
    ]),
    competenze: countGroup(filters, ["skillSearch", "language"]),
    lavoro: countGroup(filters, ["hasVat", "travelAvailability"]),
  };

  const selectClear = (val: string) => (val === "__all" ? undefined : val);

  return (
    <div className="w-[300px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Filtri
        </span>
        {hasAny && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome..."
          className="pl-10 text-sm"
          value={filters.search || ""}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      {/* Accordion groups */}
      <Accordion type="multiple" className="space-y-1">
        {/* Ruolo & Disponibilità */}
        <AccordionItem value="role" className="border-0">
          <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
            <span className="flex items-center gap-2">
              Ruolo & disponibilità
              {groupCounts.role > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                  {groupCounts.role}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Ruolo talent
              </label>
              <Select
                value={filters.talentRole || "__all"}
                onValueChange={(v) => set({ talentRole: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Disponibilità
              </label>
              <Select
                value={filters.availability || "__all"}
                onValueChange={(v) => set({ availability: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutte</SelectItem>
                  <SelectItem value="immediate">Immediata</SelectItem>
                  <SelectItem value="flexible">Flessibile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Anagrafica */}
        <AccordionItem value="anagrafica" className="border-0">
          <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
            <span className="flex items-center gap-2">
              Anagrafica
              {groupCounts.anagrafica > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                  {groupCounts.anagrafica}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sesso</label>
              <Select
                value={filters.gender || "__all"}
                onValueChange={(v) => set({ gender: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  {GENDERS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Età (da – a)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-9 text-sm"
                  value={filters.ageMin ?? ""}
                  onChange={(e) =>
                    set({
                      ageMin: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-9 text-sm"
                  value={filters.ageMax ?? ""}
                  onChange={(e) =>
                    set({
                      ageMax: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Città
              </label>
              <Input
                placeholder="Es. Milano"
                className="h-9 text-sm"
                value={filters.city || ""}
                onChange={(e) =>
                  set({ city: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Identità di genere
              </label>
              <Select
                value={filters.genderIdentity || "__all"}
                onValueChange={(v) => set({ genderIdentity: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  {GENDER_IDENTITIES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Rappresentanza
              </label>
              <Select
                value={filters.representationType || "__all"}
                onValueChange={(v) => set({ representationType: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  {REPRESENTATION_TYPES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Nazionalità
              </label>
              <Select
                value={filters.nationality || "__all"}
                onValueChange={(v) => set({ nationality: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutte</SelectItem>
                  {NATIONALITIES.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Aspetto fisico */}
        <AccordionItem value="aspetto" className="border-0">
          <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
            <span className="flex items-center gap-2">
              Aspetto fisico
              {groupCounts.aspetto > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                  {groupCounts.aspetto}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Carnagione
              </label>
              <Select
                value={filters.ethnicity || "__all"}
                onValueChange={(v) => set({ ethnicity: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutte</SelectItem>
                  {ETHNICITIES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Colore occhi
              </label>
              <Select
                value={filters.eyeColor || "__all"}
                onValueChange={(v) => set({ eyeColor: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  {EYE_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Colore capelli
              </label>
              <Select
                value={filters.hairColor || "__all"}
                onValueChange={(v) => set({ hairColor: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  {HAIR_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Lunghezza capelli
              </label>
              <Select
                value={filters.hairLength || "__all"}
                onValueChange={(v) => set({ hairLength: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  {HAIR_LENGTHS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Misure */}
        <AccordionItem value="misure" className="border-0">
          <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
            <span className="flex items-center gap-2">
              Misure
              {groupCounts.misure > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                  {groupCounts.misure}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Altezza (cm)
              </label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Min" className="h-9 text-sm" value={filters.heightMin ?? ""} onChange={(e) => set({ heightMin: e.target.value ? Number(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-9 text-sm" value={filters.heightMax ?? ""} onChange={(e) => set({ heightMax: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Peso (kg)
              </label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Min" className="h-9 text-sm" value={filters.weightMin ?? ""} onChange={(e) => set({ weightMin: e.target.value ? Number(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-9 text-sm" value={filters.weightMax ?? ""} onChange={(e) => set({ weightMax: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Taglia</label>
              <Select value={filters.shirtSize || "__all"} onValueChange={(v) => set({ shirtSize: selectClear(v) })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Tutte" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutte</SelectItem>
                  {SHIRT_SIZES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Scarpe</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Min" className="h-9 text-sm" value={filters.shoeMin ?? ""} onChange={(e) => set({ shoeMin: e.target.value ? Number(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-9 text-sm" value={filters.shoeMax ?? ""} onChange={(e) => set({ shoeMax: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Busto (cm)</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Min" className="h-9 text-sm" value={filters.chestMin ?? ""} onChange={(e) => set({ chestMin: e.target.value ? Number(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-9 text-sm" value={filters.chestMax ?? ""} onChange={(e) => set({ chestMax: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fianchi (cm)</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Min" className="h-9 text-sm" value={filters.hipsMin ?? ""} onChange={(e) => set({ hipsMin: e.target.value ? Number(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-9 text-sm" value={filters.hipsMax ?? ""} onChange={(e) => set({ hipsMax: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Competenze & Lingue */}
        <AccordionItem value="competenze" className="border-0">
          <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
            <span className="flex items-center gap-2">
              Competenze & lingue
              {groupCounts.competenze > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                  {groupCounts.competenze}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Competenza (testo libero)
              </label>
              <Input
                placeholder="Es. recitazione"
                className="h-9 text-sm"
                value={filters.skillSearch || ""}
                onChange={(e) => set({ skillSearch: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Lingua</label>
              <Select value={filters.language || "__all"} onValueChange={(v) => set({ language: selectClear(v) })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Tutte" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutte</SelectItem>
                  {LANGUAGES.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Info lavoro & viaggi */}
        <AccordionItem value="lavoro" className="border-0">
          <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
            <span className="flex items-center gap-2">
              Info lavoro & viaggi
              {groupCounts.lavoro > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
                  {groupCounts.lavoro}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">P.IVA</label>
              <Select
                value={filters.hasVat === true ? "yes" : filters.hasVat === false ? "no" : "__all"}
                onValueChange={(v) =>
                  set({ hasVat: v === "yes" ? true : v === "no" ? false : undefined })
                }
              >
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Tutti" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutti</SelectItem>
                  <SelectItem value="yes">Sì</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Disponibilità viaggi
              </label>
              <Select
                value={filters.travelAvailability || "__all"}
                onValueChange={(v) => set({ travelAvailability: selectClear(v) })}
              >
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Tutte" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tutte</SelectItem>
                  <SelectItem value="local">Locale</SelectItem>
                  <SelectItem value="national">Nazionale</SelectItem>
                  <SelectItem value="international">Internazionale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2">
              <Button size="sm" className="w-full" onClick={() => onFiltersChange({ ...filters })}>
                Applica filtri
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
