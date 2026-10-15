import { MoreHorizontal } from "lucide-react";
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
import { ROW_CHECKBOX, ROW_CHIP, TalentRow, talentRowName } from "@/components/talents/TalentRow";
import type { RequirementResult } from "@/lib/roleMatch";
import { roleTalentStatusBadge } from "@/lib/casting/roleTalentStatus";
import { isEngaged, type RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { cn } from "@/lib/utils";

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

export const talentName = (p: RoleTalentWithProfile["profile"]) => talentRowName(p);

/** Riga della shortlist: TalentRow con casella, stato e menu azioni; il clic apre l'anteprima. */
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
  const p = rt.profile;
  const badge = roleTalentStatusBadge({ engaged: isEngaged(rt), excluded: rt.excluded, roundsCount });
  return (
    <TalentRow
      profile={p}
      requirements={requirements}
      dimmed={rt.excluded}
      onClick={onOpen}
      leading={
        <Checkbox
          className={ROW_CHECKBOX}
          checked={selected}
          onCheckedChange={(v) => onSelectedChange(v === true)}
          aria-label={`Seleziona ${talentName(p)}`}
        />
      }
      meta={badge && <span className={cn(ROW_CHIP, badge.tone, "shrink-0")}>{badge.label}</span>}
      trailing={
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
      }
    />
  );
};
