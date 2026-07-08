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
  draft: "bg-muted-foreground/50",
  closed: "bg-[#A30A2B]",
};

interface CastingRowProps {
  casting: CastingWithRelations;
  onEdit: (casting: CastingWithRelations) => void;
  onDelete: (casting: CastingWithRelations) => void;
  onStatusChange: (id: string, status: string) => void;
}

const Empty = () => <span className="text-muted-foreground/70">–</span>;

export const CastingRow = ({
  casting,
  onEdit,
  onDelete,
  onStatusChange,
}: CastingRowProps) => {
  const navigate = useNavigate();

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

  const statusKey = casting.status || "draft";
  const statusLabel =
    it.casting[statusKey as keyof typeof it.casting] || statusKey;

  const company = casting.company?.name;
  const location = casting.locations?.[0];
  const dates = formatDates();

  const open = () => navigate(`/owner/castings/${casting.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      className="group grid grid-cols-[32px_minmax(0,1fr)_140px_200px_180px_180px_40px] items-center gap-4 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors text-sm"
    >
      <FavoriteCastingStar
        castingId={casting.id}
        isFavorite={Boolean((casting as any).is_favorite)}
        size={16}
      />

      <span className="font-semibold text-foreground truncate">
        {casting.title}
      </span>

      <span className="flex items-center gap-2 min-w-0">
        <span
          className={cn("h-2 w-2 rounded-full shrink-0", statusDot[statusKey])}
          aria-hidden
        />
        <span className="text-foreground truncate">{statusLabel}</span>
      </span>

      <span className="truncate text-foreground">
        {company || <Empty />}
      </span>

      <span className="truncate text-foreground">
        {location || <Empty />}
      </span>

      <span className="truncate text-foreground">
        {dates || <Empty />}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
