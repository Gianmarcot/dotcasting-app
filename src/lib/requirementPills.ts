import type { TalentFilters } from "@/hooks/useTalents";

export type PillKind = "mandatory" | "optional";
export type PillSets = Record<PillKind, TalentFilters>;
export type PillState = Record<PillKind, boolean>;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const keysOf = (f: TalentFilters) => Object.keys(f) as (keyof TalentFilters)[];

/** Accende una pillola: i suoi filtri si sommano a quelli correnti. */
export function pillOn(filters: TalentFilters, set: TalentFilters): TalentFilters {
  return { ...filters, ...set };
}

/** Spegne una pillola: toglie solo i filtri che valgono ancora quanto aveva impostato. */
export function pillOff(filters: TalentFilters, set: TalentFilters): TalentFilters {
  const next: TalentFilters = { ...filters };
  for (const k of keysOf(set)) if (same(next[k], set[k])) delete next[k];
  return next;
}

/** Dopo una modifica manuale, si spengono le pillole i cui filtri non corrispondono più. */
export function pillsAfterManualChange(next: TalentFilters, sets: PillSets, state: PillState): PillState {
  const out = { ...state };
  for (const kind of ["mandatory", "optional"] as PillKind[]) {
    if (!out[kind]) continue;
    if (keysOf(sets[kind]).some((k) => !same(next[k], sets[kind][k]))) out[kind] = false;
  }
  return out;
}
