import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { it } from "@/lib/i18n";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import type { CastingWithRelations } from "@/hooks/useCastings";
import { FavoriteCastingStar } from "@/components/castings/FavoriteCastingStar";
import { cn } from "@/lib/utils";

const statusDot: Record<string, string> = {
  active: "bg-[#729128]",
  draft: "bg-muted-foreground/40",
  closed: "bg-muted-foreground/70",
};

interface CastingRowProps {
  casting: CastingWithRelations;
  onEdit: (casting: CastingWithRelations) => void;
  onDelete: (casting: CastingWithRelations) => void;
  onStatusChange: (id: string, status: string) => void;
}

export const CastingRow = ({
  casting,
  onEdit,
  onDelete,
  onStatusChange,
}: CastingRowProps) => {
  const navigate = useNavigate();
  const applicationsCount = casting.applications?.[0]?.count ?? 0;

  const formatDates = () => {
    if (!casting.start_date && !casting.end_date) return null;
    const start = casting.start_date
      ? format(new Date(casting.start_date), "d MMM", { locale: itLocale })
      : "";
    const end = casting.end_date
      ? format(new Date(casting.end_date), "d MMM yyyy", { locale: itLocale })
      : "";
    if (start && end) return `${start} - ${end}`;
    return start || end;
  };

  const getStatusActions = () => {
    const actions: { label: string; status: string; icon: any }[] = [];
    if (casting.status === "draft") actions.push({ label: "Pubblica", status: "active", icon: Play });
    if (casting.status === "active") actions.push({ label: "Chiudi", status: "closed", icon: Pause });
    if (casting.status === "closed") actions.push({ label: "Riapri", status: "active", icon: RotateCcw });
    if (casting.status === "active" || casting.status === "closed")
      actions.push({ label: "Torna a bozza", status: "draft", icon: Edit });
    return actions;
  };

  const statusLabel =
    it.casting[casting.status as keyof typeof it.casting] || casting.status || "—";

  const company = casting.company?.name || "—";
  const dates = formatDates();
  const location = casting.locations?.[0];
  const secondary = dates || location || "—";

  const open = () => navigate(`/owner/castings/${casting.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
    >
      <FavoriteCastingStar
        castingId={casting.id}
        isFavorite={Boolean((casting as any).is_favorite)}
        size={16}
      />

      {/* Status dot */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                statusDot[casting.status || "draft"]
              )}
              aria-label={statusLabel as string}
            />
          </TooltipTrigger>
          <TooltipContent side="right">{statusLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Title + meta */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
        <span className="text-foreground font-medium truncate">
          {casting.title}
        </span>
        <span className="text-sm text-muted-foreground truncate">
          {company} · {secondary}
        </span>
      </div>

      {/* Count */}
      <div className="text-sm text-muted-foreground shrink-0 whitespace-nowrap">
        {applicationsCount} candidature
      </div>

      {/* Kebab */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem disabled className="opacity-100 text-xs uppercase tracking-wide">
            Stato: {statusLabel}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={open}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Apri
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(casting)}>
            <Edit className="h-4 w-4 mr-2" />
            {it.common.edit}
          </DropdownMenuItem>
          {getStatusActions().map((action) => (
            <DropdownMenuItem
              key={action.status}
              onClick={() => onStatusChange(casting.id, action.status)}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(casting)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {it.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
