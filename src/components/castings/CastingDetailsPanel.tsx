import { ChevronDown } from "lucide-react";
import {
  DetailsBlock,
  DetailsDeleteLink,
  DetailsEditLink,
  DetailsPanelShell,
  DetailsRows,
  hasRows,
  type DetailsRow,
} from "@/components/castings/DetailsPanelParts";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CastingWithRelations } from "@/hooks/useCastings";
import { cn } from "@/lib/utils";

export const castingStatusLabels: Record<string, string> = {
  draft: "Bozza",
  active: "Attivo",
  closed: "Archiviato",
};

interface Props {
  casting: CastingWithRelations;
  onStatusChange: (status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const formatPeriod = (start?: string | null, end?: string | null) => {
  if (!start && !end) return null;
  const s = start ? format(new Date(start), "d MMM", { locale: itLocale }) : "";
  const e = end ? format(new Date(end), "d MMM yyyy", { locale: itLocale }) : "";
  return s && e ? `${s} - ${e}` : s || e;
};

export const CastingDetailsPanel = ({ casting, onStatusChange, onEdit, onDelete, className }: Props) => {
  const status = casting.status || "draft";
  const isActive = status === "active";

  const compensation = casting.compensation_amount
    ? `${casting.compensation_amount} ${casting.currency || "EUR"}`
    : null;
  const call = casting.call_datetime
    ? format(new Date(casting.call_datetime), "d MMM yyyy, HH:mm", { locale: itLocale })
    : null;

  const project: DetailsRow[] = [
    { label: "Cliente", value: casting.company?.name },
    { label: "Luogo", value: casting.locations?.length ? casting.locations.join(", ") : null },
    { label: "Periodo", value: formatPeriod(casting.start_date, casting.end_date) },
    { label: "Compenso", value: compensation },
    { label: "Categoria", value: casting.category },
  ];
  const convocation: DetailsRow[] = [
    { label: "Data e ora", value: call },
    { label: "Luogo", value: casting.venue_name },
    { label: "Indirizzo", value: casting.venue_address },
  ];

  return (
    <DetailsPanelShell title="Dettaglio casting" className={className}>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Stato del casting"
            className={cn(
              "inline-flex w-fit items-center gap-2 rounded-full bg-white py-2 pl-4 pr-3 text-sm font-bold",
              isActive ? "text-[hsl(var(--success))]" : "text-muted-foreground",
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            {castingStatusLabels[status]}
            <ChevronDown className="h-5 w-5 text-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(castingStatusLabels).map(([value, label]) => (
            <DropdownMenuItem key={value} onSelect={() => value !== status && onStatusChange(value)}>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {casting.description && (
        <DetailsBlock label="Descrizione">
          <p className="whitespace-pre-wrap">{casting.description}</p>
        </DetailsBlock>
      )}
      {hasRows(project) && (
        <DetailsBlock label="Progetto">
          <DetailsRows rows={project} />
        </DetailsBlock>
      )}
      {hasRows(convocation) && (
        <DetailsBlock label="Convocazione">
          <DetailsRows rows={convocation} />
        </DetailsBlock>
      )}
      {casting.talent_instructions && (
        <DetailsBlock label="Istruzioni per il talent">
          <p className="whitespace-pre-wrap">{casting.talent_instructions}</p>
        </DetailsBlock>
      )}
      <DetailsEditLink label="Modifica" onClick={onEdit} />
      <DetailsDeleteLink label="Elimina casting" onClick={onDelete} />
    </DetailsPanelShell>
  );
};
