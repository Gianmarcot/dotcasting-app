import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Anatomia condivisa dei pannelli dettagli (casting e ruolo): cambia solo il contenuto. */
export const DetailsPanelShell = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex min-h-full flex-col gap-8", className)}>
    <h2 className="font-display text-base font-normal uppercase text-ink">{title}</h2>
    {children}
  </div>
);

/** Blocco con sopra-etichetta (14/20 grigio) e contenuto (14/20 ink), distanziati 4px. */
export const DetailsBlock = ({ label, children }: { label: string; children: ReactNode }) => (
  <section className="flex flex-col gap-1">
    <h3 className="font-sans text-sm font-normal leading-5 text-grey-600">{label}</h3>
    <div className="font-sans text-sm font-normal leading-5 text-ink">{children}</div>
  </section>
);

export type DetailsRow = { label: string; value: string | null | undefined };

/** Righe etichetta/valore separate dal bordo inferiore; mostra solo quelle con un valore. */
export const DetailsRows = ({ rows }: { rows: DetailsRow[] }) => (
  <dl>
    {rows
      .filter((r) => !!r.value)
      .map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-border py-2">
          <dt className="shrink-0 text-sm leading-5 text-grey-600">{r.label}</dt>
          <dd className="min-w-0 max-w-[360px] text-right text-sm leading-5 text-ink">{r.value}</dd>
        </div>
      ))}
  </dl>
);

export const hasRows = (rows: DetailsRow[]) => rows.some((r) => !!r.value);

export const DetailsEditLink = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="dc-link-action w-fit gap-3">
    <Pencil className="h-5 w-5" />
    {label}
  </button>
);

export const DetailsDeleteLink = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="dc-link-action dc-link-action-danger mt-auto w-fit gap-3">
    <Trash2 className="h-5 w-5" />
    {label}
  </button>
);
