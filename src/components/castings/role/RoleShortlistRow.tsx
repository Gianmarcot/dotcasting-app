import { useState } from "react";
import { Check, HelpCircle, MoreHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiscalPill, MinorPill } from "@/components/talents/TalentStatusPill";
import { isMinorBirthDate } from "@/lib/guardianship";
import { fiscalStatusOf } from "@/lib/fiscalStatus";
import { getAge, summarizeRequirements, type RequirementResult } from "@/lib/roleMatch";
import { roleTalentStatusBadge } from "@/lib/casting/roleTalentStatus";
import { isEngaged, type RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { cn } from "@/lib/utils";

const CHIP = "inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap";
const AMBER = "bg-[#C88500]/15 text-[#C88500]";
const GREY = "bg-muted text-muted-foreground";

interface Props {
  rt: RoleTalentWithProfile;
  requirements: RequirementResult[];
  roundsCount: number;
  selected: boolean;
  onSelectedChange: (v: boolean) => void;
  onOpen: () => void;
  onToggleExcluded: () => void;
  onRemove: () => void;
  onNewRound: () => void;
  onEngage: () => void;
  onMessage: () => void;
  rounds: { id: string; label: string; size: number }[];
  onAddToRound: (roundId: string) => void;
}

export const talentName = (p: RoleTalentWithProfile["profile"]) =>
  p?.stage_name?.trim() || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Senza nome";

/** Riga della shortlist: stato derivato, indicatore requisiti, menu. */
export const RoleShortlistRow = ({
  rt,
  requirements,
  roundsCount,
  selected,
  onSelectedChange,
  onOpen,
  onToggleExcluded,
  onRemove,
  onNewRound,
  onEngage,
  onMessage,
  rounds,
  onAddToRound,
}: Props) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const p = rt.profile;
  const age = getAge(p?.birth_date ?? null);
  const badge = roleTalentStatusBadge({ engaged: isEngaged(rt), excluded: rt.excluded, roundsCount });
  const summary = summarizeRequirements(requirements);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const reqChip = (() => {
    switch (summary.kind) {
      case "unmet-one":
        return <span className={cn(CHIP, AMBER)}>{summary.label}</span>;
      case "unmet-many":
        return <span className={cn(CHIP, AMBER)}>{summary.count} requisiti non soddisfatti</span>;
      case "missing":
        return <span className={cn(CHIP, GREY)}>{summary.count} {summary.count === 1 ? "dato mancante" : "dati mancanti"}</span>;
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


  return (
    <div className={cn("@container", rt.excluded && "opacity-50")}>

      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen();
        }}
        className="-mx-4 flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/30"
      >
        <div onClick={stop} onKeyDown={stop} className="flex">
          <Checkbox checked={selected} onCheckedChange={(v) => onSelectedChange(v === true)} aria-label={`Seleziona ${talentName(p)}`} />
        </div>

        <div className="aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {p?.profile_photo_url && (
            <img src={p.profile_photo_url} alt="" className="h-full w-full object-cover object-[50%_25%]" loading="lazy" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-foreground">{talentName(p)}</span>
            {hasPills && <span className="hidden shrink-0 items-center gap-2 @[640px]:flex">{pills}</span>}
          </div>
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {[p?.city, age !== null ? `${age} anni` : null].filter(Boolean).join(" · ")}
          </p>
          {hasPills && <span className="mt-1.5 flex flex-wrap items-center gap-2 @[640px]:hidden">{pills}</span>}
        </div>



        {badge && <span className={cn(CHIP, badge.tone, "shrink-0")}>{badge.label}</span>}

        {reqChip && (
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setDetailOpen((o) => !o);
            }}
            aria-expanded={detailOpen}
            className="shrink-0"
          >
            {reqChip}
          </button>
        )}

        <div onClick={stop} onKeyDown={stop} className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Azioni talent"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onSelect={onNewRound} disabled={rt.excluded}>
                Nuova selezione
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onEngage}>Ingaggia</DropdownMenuItem>
              <DropdownMenuItem onSelect={onMessage}>Messaggio</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={rt.excluded}>Aggiungi a una selezione</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-64">
                  {rounds.length === 0 ? (
                    <DropdownMenuItem disabled>Nessuna selezione</DropdownMenuItem>
                  ) : (
                    rounds.map((r) => (
                      <DropdownMenuItem key={r.id} onSelect={() => onAddToRound(r.id)}>
                        <span className="flex-1 truncate">{r.label}</span>
                        <span className="opacity-50">{r.size}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onToggleExcluded}>
                {rt.excluded ? "Reintegra nel ruolo" : "Escludi dal ruolo"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onRemove} className="text-destructive">
                Rimuovi dalla shortlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      aria-label={r.status === "met" ? "Soddisfatto" : r.status === "unmet" ? "Non soddisfatto" : "Dato mancante"}>
      {r.status === "met" ? (
        <Check className="h-4 w-4" />
      ) : r.status === "unmet" ? (
        <X className="h-4 w-4" />
      ) : (
        <HelpCircle className="h-4 w-4" />
      )}
    </span>
    <span className="truncate">{r.label}</span>
    <span className={cn(r.talentValue ? "text-foreground" : "text-muted-foreground")}>{r.talentValue ?? "—"}</span>
    <span className="text-muted-foreground">{r.requiredValue}</span>
  </>
);
