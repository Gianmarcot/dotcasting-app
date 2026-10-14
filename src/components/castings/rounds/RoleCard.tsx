import { useNavigate } from "react-router-dom";
import { CheckCheck, ChevronRight, MoreHorizontal, Pencil, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

export interface RoleCounts {
  total: number;
  confirmed: number;
  published: number;
}

interface Props {
  role: Tables<"casting_roles">;
  castingId: string;
  counts: RoleCounts;
  roundsCount?: number;
  onEditRole: (role: Tables<"casting_roles">) => void;
}

/** Riga ruolo nella scheda "Ruoli" del dettaglio casting. */
export const RoleCard = ({ role, castingId, counts, onEditRole }: Props) => {
  const navigate = useNavigate();
  const openRole = () => navigate(`/owner/castings/${castingId}/${role.id}`);
  const hasConfirmed = counts.confirmed > 0;

  return (
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
      className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-lg py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
    >
      <div className="flex min-w-0 items-center gap-4">
        <User className="h-5 w-5 shrink-0" />
        <span className="truncate text-sm font-bold leading-5 text-foreground">{role.name}</span>
      </div>

      <div className="col-start-1 row-start-2 flex items-center gap-1.5 pl-9 md:col-start-2 md:row-start-1 md:pl-0">
        <CheckCheck
          className={cn(
            "h-5 w-5 shrink-0",
            hasConfirmed ? "text-[hsl(var(--success))]" : "text-border",
          )}
        />
        <span className="whitespace-nowrap text-sm font-medium leading-5 text-foreground">
          {counts.confirmed} su {counts.total} selezionati
        </span>
      </div>

      <div className="col-start-2 row-span-2 row-start-1 flex items-center justify-end gap-6 md:col-start-3 md:row-span-1">
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
  );
};
