import { Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SaveBarProps {
  dirty: boolean;
  count: number;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
  /** Posizione/z-index aggiuntivi (default: centrata a destra della sidebar). */
  className?: string;
}

/** Barra flottante scura "N modifiche non salvate · Annulla · Salva". */
export const SaveBar = ({ dirty, count, saving = false, onSave, onReset, className }: SaveBarProps) => (
  <div
    aria-hidden={!dirty}
    className={cn(
      "pointer-events-none fixed bottom-2 left-4 right-4 z-40 transition-all duration-300 md:bottom-6 md:left-[calc(50%+8rem)] md:right-auto md:-translate-x-1/2",
      dirty ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 md:translate-y-6",
      className,
    )}
  >
    <div
      className={cn(
        "flex h-auto w-full items-center justify-end gap-2 rounded-full bg-ink p-2 shadow-2xl md:h-[80px] md:w-[min(560px,calc(100vw-2rem))] md:justify-between md:gap-4 md:py-0 md:pl-6 md:pr-4 lg:gap-6 lg:pl-8",
        dirty && "pointer-events-auto",
      )}
    >
      <div className="hidden min-w-0 items-center gap-3 text-cream md:flex">
        <Pencil className="h-5 w-5 shrink-0" strokeWidth={2} />
        <span className="truncate text-base">
          <span className="font-bold">{count}</span>
          <span className="opacity-70">{count === 1 ? " modifica non salvata" : " modifiche non salvate"}</span>
        </span>
      </div>
      <div className="flex w-full shrink-0 items-center gap-2 md:w-auto md:gap-3">
        <Button
          type="button"
          onClick={onReset}
          disabled={saving}
          variant="ghost"
          size="lg"
          className="flex-1 text-cream opacity-70 hover:bg-transparent hover:opacity-100 md:flex-none"
        >
          Annulla
        </Button>
        <Button type="button" onClick={onSave} disabled={saving} size="lg" className="flex-1 md:flex-none">
          {saving && <Loader2 className="animate-spin" />}
          Salva
        </Button>
      </div>
    </div>
  </div>
);
