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

const base =
  "inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-[12px] font-medium leading-[1.2] whitespace-nowrap";

export const MinorPill = ({ birthDate, className }: { birthDate: string | null | undefined; className?: string }) => {
  if (!isMinorBirthDate(birthDate)) return null;
  return (
    <span className={cn(base, "bg-white text-[#1a1a1a]", className)}>
      <GraduationCap className="h-5 w-5" strokeWidth={1.5} />
      {MINOR_LABEL}
    </span>
  );
};

export const FiscalPill = ({ profile, className }: { profile: FiscalStatusSource | null | undefined; className?: string }) => {
  const status = fiscalStatusOf(profile);
  if (status === "ok") return null;
  return (
    <span className={cn(base, "bg-[#C88500] text-white", className)}>
      <AlertCircle className="h-5 w-5" strokeWidth={1.5} />
      {CF_LABELS[status]}
    </span>
  );
};
