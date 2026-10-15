import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <h3 className="font-sans text-sm font-normal normal-case leading-5 text-grey-600">{label}</h3>
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

/** Azione "Modifica" del pannello: pulsante secondario del design system, come quello in header. */
export const DetailsEditLink = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button type="button" variant="secondary" size="md" iconPosition="left" onClick={onClick} className="w-fit">
    <Pencil />
    {label}
  </Button>
);

/** Azione distruttiva del pannello: pulsante leggero con solo testo bordeaux, ancorato in fondo. */
export const DetailsDeleteLink = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button
    type="button"
    variant="ghost"
    size="md"
    iconPosition="left"
    onClick={onClick}
    className="mt-auto w-fit text-brand-600 hover:text-brand-600"
  >
    <Trash2 />
    {label}
  </Button>
);
