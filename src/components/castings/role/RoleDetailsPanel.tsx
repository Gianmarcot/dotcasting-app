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
import { formatRequiredValue, listRequirements, readRoleRequirements } from "@/lib/roleRequirements";

interface Props {
  role: Tables<"casting_roles">;
  onEdit: () => void;
  onDelete: () => void;
}

/** Contenuto del pannello dettagli ruolo: requisiti letti dal registro. */
export const RoleDetailsPanel = ({ role, onEdit, onDelete }: Props) => {
  const reqs = listRequirements(readRoleRequirements(role));
  const rows = (mandatory: boolean): DetailsRow[] =>
    reqs
      .filter((r) => r.mandatory === mandatory)
      .map((r) => ({ label: r.field.label, value: formatRequiredValue(r.field, r.required) }));
  const required = rows(true);
  const preferred = rows(false);

  return (
    <DetailsPanelShell title="Dettagli ruolo">
      {role.description && (
        <DetailsBlock label="Descrizione">
          <p className="whitespace-pre-wrap">{role.description}</p>
        </DetailsBlock>
      )}
      {role.location && (
        <DetailsBlock label="Luogo">
          <p>{role.location}</p>
        </DetailsBlock>
      )}
      {hasRows(required) && (
        <DetailsBlock label="Obbligatori">
          <DetailsRows rows={required} />
        </DetailsBlock>
      )}
      {hasRows(preferred) && (
        <DetailsBlock label="Preferenziali">
          <DetailsRows rows={preferred} />
        </DetailsBlock>
      )}
      <DetailsEditLink label="Modifica ruolo" onClick={onEdit} />
      <DetailsDeleteLink label="Elimina ruolo" onClick={onDelete} />
    </DetailsPanelShell>
  );
};
