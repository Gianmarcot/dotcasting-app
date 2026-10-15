import { AlertCircle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { isMinorBirthDate, MINOR_LABEL } from "@/lib/guardianship";
import { fiscalStatusOf, type FiscalStatusSource } from "@/lib/fiscalStatus";

/** Etichette brevi degli stati CF nel Database talenti. */
const CF_LABELS = {
  missing: "CF non inserito",
  mismatch: "CF non valido",
  none_italian: "Senza CF italiano",
} as const;

/**
 * Con icona: l'icona occupa il lato sinistro, quindi il padding è asimmetrico
 * (più stretto da quella parte).
 */
const WITH_ICON =
  "inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-[12px] font-medium leading-[1.2] whitespace-nowrap";

/** Senza icona: padding sinistro e destro uniforme. */
const NO_ICON =
  "inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium leading-[1.2] whitespace-nowrap";

const base = (withIcon: boolean) => (withIcon ? WITH_ICON : NO_ICON);

export const MinorPill = ({
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
    <span className={cn(base(withIcon), "bg-white text-[#1a1a1a]", className)}>
      {withIcon && <GraduationCap className="h-5 w-5" strokeWidth={1.5} />}
      {MINOR_LABEL}
    </span>
  );
};

export const FiscalPill = ({
  profile,
  className,
  withIcon = true,
}: {
  profile: FiscalStatusSource | null | undefined;
  className?: string;
  withIcon?: boolean;
}) => {
  const status = fiscalStatusOf(profile);
  if (status === "ok") return null;
  return (
    <span className={cn(base(withIcon), "bg-[#C88500] text-white", className)}>
      {withIcon && <AlertCircle className="h-5 w-5" strokeWidth={1.5} />}
      {CF_LABELS[status]}
    </span>
  );
};
