import { useState, type ReactNode } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { FiscalPill, MinorPill } from "@/components/talents/TalentStatusPill";
import { isMinorBirthDate } from "@/lib/guardianship";
import { fiscalStatusOf, type FiscalStatusSource } from "@/lib/fiscalStatus";
import { getAge, summarizeRequirements, type RequirementResult } from "@/lib/roleMatch";
import { cn } from "@/lib/utils";

export const ROW_CHIP = "inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap";
const AMBER = "bg-[#C88500]/15 text-[#C88500]";
const GREY = "bg-muted text-muted-foreground";

export type TalentRowProfile = FiscalStatusSource & {
  stage_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  city?: string | null;
  birth_date?: string | null;
  profile_photo_url?: string | null;
};

export const talentRowInitials = (p: TalentRowProfile | null | undefined) => {
  const words = (p?.stage_name?.trim() || [p?.first_name, p?.last_name].filter(Boolean).join(" ")).split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
};

/** Miniatura 54×80 delle liste: foto, oppure fondo scuro con le iniziali. */
export const TalentThumb = ({ profile: p, className }: { profile: TalentRowProfile | null | undefined; className?: string }) => (
  <div className={cn("flex h-20 w-[54px] shrink-0 items-center justify-center overflow-hidden rounded bg-ink", className)}>
    {p?.profile_photo_url ? (
      <img src={p.profile_photo_url} alt="" className="h-full w-full object-cover object-[50%_25%]" loading="lazy" />
    ) : (
      <span className="text-sm font-medium text-white">{talentRowInitials(p)}</span>
    )}
  </div>
);

export const talentRowName = (p: TalentRowProfile | null | undefined) =>
  p?.stage_name?.trim() || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Senza nome";

interface Props {
  profile: TalentRowProfile | null | undefined;
  requirements: RequirementResult[];
  /** Elemento iniziale (es. casella di selezione). */
  leading?: ReactNode;
  /** Elementi dopo il nome, prima dell'indicatore requisiti (es. stato). */
  meta?: ReactNode;
  /** Elementi finali, dopo l'indicatore requisiti (menu, occhio, X). */
  trailing?: ReactNode;
  /** Clic sulla riga: anteprima nella pagina shortlist, selezione nel foglio. */
  onClick?: () => void;
  ariaPressed?: boolean;
  /** Nasconde l'indicatore dei requisiti (es. colonna Shortlist del foglio). */
  hideRequirements?: boolean;
  dimmed?: boolean;
  className?: string;
}

/** Riga talent condivisa: pagina shortlist e foglio di gestione della shortlist. */
export const TalentRow = ({ profile: p, requirements, leading, meta, trailing, onClick, ariaPressed, hideRequirements, dimmed, className }: Props) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const age = getAge(p?.birth_date ?? null);
  const summary = summarizeRequirements(hideRequirements ? [] : requirements);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const reqChip = (() => {
    switch (summary.kind) {
      case "unmet-one":
        return <span className={cn(ROW_CHIP, AMBER)}>{summary.label}</span>;
      case "unmet-many":
        return <span className={cn(ROW_CHIP, AMBER)}>{summary.count} requisiti non soddisfatti</span>;
      case "missing":
        return <span className={cn(ROW_CHIP, GREY)}>{summary.count} {summary.count === 1 ? "dato mancante" : "dati mancanti"}</span>;
      case "ok":
        return <span className="text-[12px] text-muted-foreground opacity-70">in target</span>;
      default:
        return null;
    }
  })();

  const pills = (
    <>
      <MinorPill birthDate={p?.birth_date} className="shrink-0" withIcon={false} />
      <FiscalPill profile={p} className="shrink-0" withIcon={false} />
    </>
  );
  const hasPills = isMinorBirthDate(p?.birth_date) || fiscalStatusOf(p) !== "ok";
  const reqButton = (className: string) =>
    reqChip && (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setDetailOpen((o) => !o);
        }}
        onKeyDown={stop}
        aria-expanded={detailOpen}
        className={cn("shrink-0", className)}
      >
        {reqChip}
      </button>
    );

  return (
    <div className={cn("@container", dimmed && "opacity-50", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={ariaPressed}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className="-mx-4 flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/30"
      >
        {leading && (
          <div onClick={stop} onKeyDown={stop} className="flex shrink-0">
            {leading}
          </div>
        )}

        <TalentThumb profile={p} />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">{talentRowName(p)}</span>
            {hasPills && <span className="hidden shrink-0 items-center gap-2 @[640px]:flex">{pills}</span>}
          </div>
          <p className="min-w-0 truncate text-sm text-field-label">
            {[p?.city, age !== null ? `${age} anni` : null].filter(Boolean).join(" · ")}
          </p>
          {hasPills && <span className="mt-1.5 flex flex-wrap items-center gap-2 @[640px]:hidden">{pills}</span>}
          {reqChip && <span className="mt-1.5 flex @[440px]:hidden">{reqButton("")}</span>}
        </div>

        {meta}

        {reqButton("hidden @[440px]:inline-flex")}

        {trailing && (
          <div onClick={stop} onKeyDown={stop} className="flex shrink-0 items-center gap-1">
            {trailing}
          </div>
        )}
      </div>

      {detailOpen && (
        <div className="mb-3 ml-10 rounded-2xl bg-cream-dark p-4 text-sm">
          <div className="grid grid-cols-[20px_minmax(0,1fr)_auto_auto] gap-x-4 gap-y-2">
            <span />
            <span className="text-xs text-muted-foreground">Requisito</span>
            <span className="text-xs text-muted-foreground">Talent</span>
            <span className="text-xs text-muted-foreground">Richiesto</span>
            {requirements.map((r) => (
              <RequirementLine key={r.key} r={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RequirementLine = ({ r }: { r: RequirementResult }) => (
  <>
    <span
      className={cn(
        "flex items-center",
        r.status === "met" ? "text-[#729128]" : r.status === "unmet" ? "text-[#C88500]" : "text-muted-foreground",
      )}
      aria-label={r.status === "met" ? "Soddisfatto" : r.status === "unmet" ? "Non soddisfatto" : "Dato mancante"}
    >
      {r.status === "met" ? <Check className="h-4 w-4" /> : r.status === "unmet" ? <X className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
    </span>
    <span className="truncate">{r.label}</span>
    <span className={cn(r.talentValue ? "text-foreground" : "text-muted-foreground")}>{r.talentValue ?? "—"}</span>
    <span className="text-muted-foreground">{r.requiredValue}</span>
  </>
);

/** Casella 18px con raggio 5: bianca con bordo scuro, piena nel rosso del marchio se selezionata. */
export const ROW_CHECKBOX = "h-[18px] w-[18px] rounded-[5px] border-ink bg-white data-[state=checked]:border-primary [&_svg]:h-3 [&_svg]:w-3";
