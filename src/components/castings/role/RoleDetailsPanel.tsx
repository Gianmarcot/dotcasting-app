import type { Tables } from "@/integrations/supabase/types";

interface Props {
  role: Tables<"casting_roles">;
  onEdit: () => void;
  onDelete: () => void;
}

const genderLabel = (g: string | null) => (g === "M" ? "Maschile" : g === "F" ? "Femminile" : g);

/** Contenuto del pannello dettagli ruolo (descrizione, requisiti, modifica/elimina). */
export const RoleDetailsPanel = ({ role, onEdit, onDelete }: Props) => {
  // Gruppi già separati: i requisiti preferenziali si aggiungeranno come nuovo gruppo.
  const required: { label: string; value: string }[] = [];
  if (role.gender && role.gender !== "any") required.push({ label: "Sesso", value: genderLabel(role.gender) ?? role.gender });
  if (role.age_min || role.age_max) required.push({ label: "Età", value: `${role.age_min ?? "?"}–${role.age_max ?? "?"} anni` });
  if (role.required_skills?.length) required.push({ label: "Competenze", value: role.required_skills.join(", ") });

  const info: { label: string; value: string }[] = [];
  if (role.location) info.push({ label: "Luogo", value: role.location });
  if (role.budget) info.push({ label: "Compenso", value: `€${role.budget}` });
  if (role.notes) info.push({ label: "Note", value: role.notes });

  const groups = [
    { title: "Requisiti obbligatori", rows: required },
    { title: "Informazioni", rows: info },
  ].filter((g) => g.rows.length > 0);

  return (
    <div className="flex min-h-full flex-col gap-6">
      <h2 className="font-display text-base uppercase leading-10 tracking-wide text-foreground">Dettagli ruolo</h2>

      {role.description && <p className="whitespace-pre-wrap text-sm text-foreground">{role.description}</p>}

      {groups.map((g) => (
        <div key={g.title}>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{g.title}</h3>
          {g.rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 border-b border-border py-3 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="text-right text-foreground">{r.value}</span>
            </div>
          ))}
        </div>
      ))}

      <button type="button" onClick={onEdit} className="dc-link-action self-start">
        Modifica ruolo
      </button>

      <button type="button" onClick={onDelete} className="dc-link-action dc-link-action-danger mt-auto self-start">
        Elimina ruolo
      </button>
    </div>
  );
};
