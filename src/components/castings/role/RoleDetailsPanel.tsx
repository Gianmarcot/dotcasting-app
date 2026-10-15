import type { Tables } from "@/integrations/supabase/types";
import {
  DetailsBlock,
  DetailsDeleteLink,
  DetailsEditLink,
  DetailsPanelShell,
  DetailsRows,
  hasRows,
  type DetailsRow,
} from "@/components/castings/DetailsPanelParts";

interface Props {
  role: Tables<"casting_roles">;
  onEdit: () => void;
  onDelete: () => void;
}

const genderLabel = (g: string | null) => (g === "M" ? "Maschile" : g === "F" ? "Femminile" : g);

/** Valore età formattato con l'operatore necessario a capirlo. */
const ageValue = (min: number | null, max: number | null) => {
  if (min && max) return `tra ${min} e ${max} anni`;
  if (min) return `almeno ${min} anni`;
  if (max) return `al massimo ${max} anni`;
  return null;
};

/** Contenuto del pannello dettagli ruolo. */
export const RoleDetailsPanel = ({ role, onEdit, onDelete }: Props) => {
  const required: DetailsRow[] = [
    { label: "Sesso", value: role.gender && role.gender !== "any" ? genderLabel(role.gender) : null },
    { label: "Età", value: ageValue(role.age_min, role.age_max) },
    { label: "Luogo", value: role.location },
    { label: "Competenze", value: role.required_skills?.length ? role.required_skills.join(", ") : null },
  ];
  // I requisiti preferenziali non hanno ancora campi: il gruppo resta nascosto finché è vuoto.
  const preferred: DetailsRow[] = [];

  return (
    <DetailsPanelShell title="Dettagli ruolo">
      {role.description && (
        <DetailsBlock label="Descrizione">
          <p className="whitespace-pre-wrap">{role.description}</p>
        </DetailsBlock>
      )}
      {hasRows(required) && (
        <DetailsBlock label="Requisiti obbligatori">
          <DetailsRows rows={required} />
        </DetailsBlock>
      )}
      {hasRows(preferred) && (
        <DetailsBlock label="Requisiti preferenziali">
          <DetailsRows rows={preferred} />
        </DetailsBlock>
      )}
      <DetailsEditLink label="Modifica ruolo" onClick={onEdit} />
      <DetailsDeleteLink label="Elimina ruolo" onClick={onDelete} />
    </DetailsPanelShell>
  );
};
