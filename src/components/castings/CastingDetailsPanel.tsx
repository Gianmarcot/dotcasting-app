import { ChevronDown, Pencil, Trash2 } from "lucide-react";
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
  const venue = [casting.venue_name, casting.venue_address].filter(Boolean).join(", ") || null;

  const rows: [string, string | null | undefined][] = [
    ["Cliente", casting.company?.name],
    ["Luogo", casting.locations?.length ? casting.locations.join(", ") : null],
    ["Periodo", formatPeriod(casting.start_date, casting.end_date)],
    ["Compenso", compensation],
    ["Categoria", casting.category],
    ["Convocazione", call],
    ["Luogo della convocazione", venue],
  ];
  const filled = rows.filter(([, v]) => !!v) as [string, string][];

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <h2 className="font-display text-base uppercase text-foreground">Dettagli</h2>

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
        <p className="whitespace-pre-wrap text-sm leading-5 text-grey-700">{casting.description}</p>
      )}

      {(filled.length > 0 || casting.talent_instructions) && (
        <div className="flex flex-col gap-4">
          {filled.length > 0 && (
            <dl>
              {filled.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-border py-2 text-sm leading-5 text-foreground"
                >
                  <dt className="shrink-0">{label}</dt>
                  <dd className="min-w-0 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {casting.talent_instructions && (
            <div className="space-y-1 text-sm leading-5 text-foreground">
              <p>Istruzioni per il talent</p>
              <p className="whitespace-pre-wrap text-grey-700">{casting.talent_instructions}</p>
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={onEdit} className="dc-link-action w-fit">
        <Pencil className="h-5 w-5" />
        Modifica
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="dc-link-action dc-link-action-danger mt-auto w-fit"
      >
        <Trash2 className="h-5 w-5" />
        Elimina casting
      </button>
    </div>
  );
};
