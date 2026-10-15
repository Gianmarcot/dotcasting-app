/** Etichetta di stato di un talent nella shortlist di un ruolo, derivata e non modificabile. */
export interface RoleTalentStatusBadge {
  label: string;
  /** Classi Tailwind basate sui colori di stato del design system. */
  tone: string;
}

export const BADGE_SUCCESS = "bg-[#729128]/15 text-[#729128]";
export const BADGE_NEUTRAL = "bg-muted text-muted-foreground";

export const roleTalentStatusBadge = (r: {
  engaged: boolean;
  excluded: boolean;
  roundsCount?: number;
}): RoleTalentStatusBadge | null => {
  if (r.engaged) return { label: "Ingaggiato", tone: BADGE_SUCCESS };
  if (r.excluded) return { label: "Escluso", tone: BADGE_NEUTRAL };
  if (r.roundsCount && r.roundsCount > 0)
    return { label: r.roundsCount === 1 ? "In 1 selezione" : `In ${r.roundsCount} selezioni`, tone: BADGE_NEUTRAL };
  return null;
};
