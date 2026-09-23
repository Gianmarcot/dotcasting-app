import { AlertTriangle, FileWarning, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FISCAL_STATUS_SHORT,
  fiscalStatusOf,
  isFiscalStatusProblematic,
  type FiscalStatus,
  type FiscalStatusSource,
} from "@/lib/fiscalStatus";

/**
 * Etichetta di stato del codice fiscale mostrata lato agenzia.
 * Non compare quando il codice è presente e coerente, così l'attenzione
 * resta sui casi che richiedono un'azione. Stile non interattivo.
 */
const STYLES: Record<Exclude<FiscalStatus, "ok">, string> = {
  missing: "bg-[#C88500]/15 text-[#C88500]",
  none_italian: "bg-[#333333]/10 text-[#333333]",
  mismatch: "bg-[#A30A2B]/15 text-[#A30A2B]",
};

const ICONS: Record<Exclude<FiscalStatus, "ok">, typeof AlertTriangle> = {
  missing: HelpCircle,
  none_italian: FileWarning,
  mismatch: AlertTriangle,
};

export const FiscalStatusBadge = ({
  profile,
  className,
  withIcon = true,
}: {
  profile: FiscalStatusSource | null | undefined;
  className?: string;
  withIcon?: boolean;
}) => {
  const status = fiscalStatusOf(profile);
  if (!isFiscalStatusProblematic(status)) return null;
  const key = status as Exclude<FiscalStatus, "ok">;
  const Icon = ICONS[key];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        STYLES[key],
        className
      )}
    >
      {withIcon && <Icon className="h-3 w-3" strokeWidth={1.75} />}
      {FISCAL_STATUS_SHORT[key]}
    </span>
  );
};

export default FiscalStatusBadge;
