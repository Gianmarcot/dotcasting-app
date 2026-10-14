/** Etichetta di stato di un talent nella shortlist di un ruolo (colori DS). */
export interface RoleTalentStatusBadge {
  label: string;
  /** Classi Tailwind basate sui token di stato del design system. */
  tone: string;
}

const SUCCESS = "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]";
const WARNING = "bg-[hsl(var(--warning))] text-[hsl(var(--success-foreground))]";
const DANGER = "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]";

export const roleTalentStatusBadge = (r: {
  talentStatus: string | null | undefined;
  companyStatus: string | null | undefined;
}): RoleTalentStatusBadge | null => {
  if (r.companyStatus === "confirmed" && r.talentStatus === "confirmed")
    return { label: "Conf. entrambi", tone: SUCCESS };
  if (r.companyStatus === "confirmed") return { label: "Conf. azienda", tone: SUCCESS };
  if (r.talentStatus === "confirmed") return { label: "Conf. talent", tone: SUCCESS };
  if (r.companyStatus === "pending") return { label: "In attesa azienda", tone: WARNING };
  if (r.talentStatus === "invited") return { label: "Invitato", tone: WARNING };
  if (r.talentStatus === "rejected") return { label: "Rifiutato", tone: DANGER };
  return null;
};
