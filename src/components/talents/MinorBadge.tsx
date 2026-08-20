import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { MINOR_LABEL, isMinorBirthDate } from "@/lib/guardianship";

/**
 * Badge "Minore" mostrato dove il talent viene scelto (board, drawer, dettaglio,
 * comp card). Derivato dalla data di nascita: un profilo convertito non lo mostra.
 * Stile non interattivo, come tutti i badge della piattaforma.
 */
export const MinorBadge = ({
  birthDate,
  className,
  withIcon = true,
}: {
  birthDate: string | null | undefined;
  className?: string;
  withIcon?: boolean;
}) => {
  if (!isMinorBirthDate(birthDate)) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[#C88500]/15 px-2 py-0.5 text-[11px] font-medium text-[#C88500]",
        className
      )}
    >
      {withIcon && <ShieldAlert className="h-3 w-3" strokeWidth={1.75} />}
      {MINOR_LABEL}
    </span>
  );
};

export default MinorBadge;
