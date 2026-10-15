import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Ricerca talent condivisa (Database talenti, Modifica shortlist).
 * Il fondo segue `--field-bg` della Surface: bianco su `raised`, beige su `base`.
 */
export const TalentSearchField = ({ value, onChange, className }: Props) => (
  <label className={cn("flex h-12 min-w-[240px] items-center gap-4 rounded-full bg-[var(--field-bg)] px-5", className)}>
    <Search className="h-5 w-5 shrink-0" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Cerca per parola chiave"
      aria-label="Cerca per parola chiave"
      className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-field-disabled-foreground"
    />
  </label>
);
