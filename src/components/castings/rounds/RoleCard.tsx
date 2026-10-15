import { useNavigate } from "react-router-dom";
import { CheckCheck, ChevronRight, MoreHorizontal, Pencil, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/integrations/supabase/types";
import type { RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { TalentAvatarStack } from "@/components/talents/TalentAvatarStack";
import { cn } from "@/lib/utils";

export interface RoleCounts {
  total: number;
  published: number;
}

interface Props {
  role: Tables<"casting_roles">;
  castingId: string;
  counts: RoleCounts;
  /** Talent in shortlist al ruolo, nell'ordine in cui vanno mostrati. */
  talents: RoleTalentWithProfile[];
  roundsCount?: number;
  onEditRole: (role: Tables<"casting_roles">) => void;
}

/**
 * Riga ruolo nella scheda "Ruoli" del dettaglio casting.
 * La larghezza disponibile cambia con il drawer dei dettagli: sotto i 640px
 * effettivi le informazioni si impilano su tre righe e gli avatar passano
 * alla misura piccola.
 */
export const RoleCard = ({ role, castingId, counts, talents, onEditRole }: Props) => {
  const navigate = useNavigate();
  const openRole = () => navigate(`/owner/castings/${castingId}/${role.id}`);
  const hasEngaged = counts.published > 0;
  const profiles = talents.map((t) => t.profile);

  return (
    <div className="@container">
      <div
        role="link"
        tabIndex={0}
        aria-label={`Apri ruolo ${role.name}`}
        onClick={openRole}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openRole();
          }
        }}
        className="group -mx-4 grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 rounded-lg px-4 py-3 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring @[640px]:grid-cols-[minmax(0,1fr)_auto_auto_auto] @[640px]:gap-x-8"
      >
        {/* Nome ruolo */}
        <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-4">
          <User className="h-5 w-5 shrink-0" />
          <span className="truncate text-base font-medium text-foreground">{role.name}</span>
        </div>

        {/* Shortlist: avatar dei talent + conteggio */}
        <div className="col-start-1 row-start-2 flex items-center gap-1.5 pl-9 @[640px]:col-start-2 @[640px]:row-start-1 @[640px]:pl-0">
          <TalentAvatarStack
            profiles={profiles}
            size="md"
            className="hidden @[640px]:flex"
          />
          <TalentAvatarStack
            profiles={profiles}
            size="sm"
            className="flex @[640px]:hidden"
          />
          <span
            className={cn(
              "whitespace-nowrap text-sm font-medium leading-5",
              counts.total === 0 ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {counts.total} in shortlist
          </span>
        </div>

        {/* Avanzamento selezioni */}
        <div className="col-start-1 row-start-3 flex items-center gap-1.5 pl-9 @[640px]:col-start-3 @[640px]:row-start-1 @[640px]:pl-0">
          <CheckCheck
            className={cn(
              "h-5 w-5 shrink-0",
              hasEngaged ? "text-[hsl(var(--success))]" : "text-border",
            )}
          />
          <span className="whitespace-nowrap text-sm font-medium leading-5 text-foreground">
            {counts.published} su {counts.total} ingaggiati
          </span>
        </div>

        {/* Azioni */}
        <div className="col-start-2 row-span-3 row-start-1 flex items-center justify-end gap-6 @[640px]:col-start-4 @[640px]:row-span-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Azioni ruolo"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => onEditRole(role)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifica ruolo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </div>
      </div>
    </div>
  );
};
