import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { it } from "@/lib/i18n";
import type { CastingWithRelations } from "@/hooks/useCastings";
import { FavoriteCastingStar } from "@/components/castings/FavoriteCastingStar";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { dot: string; text: string }> = {
  active: { dot: "bg-[#729128]", text: "text-[#729128]" },
  draft: { dot: "bg-amber-500", text: "text-amber-600" },
  closed: { dot: "bg-muted-foreground/60", text: "text-muted-foreground" },
};

interface CastingRowProps {
  casting: CastingWithRelations;
  onEdit: (casting: CastingWithRelations) => void;
  onDelete: (casting: CastingWithRelations) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const getInitials = (first?: string | null, last?: string | null) => {
  const a = first?.charAt(0) ?? "";
  const b = last?.charAt(0) ?? "";
  return (a + b).toUpperCase() || "?";
};

export const CastingRow = ({ casting, onEdit, onDelete }: CastingRowProps) => {
  const navigate = useNavigate();

  const statusLabel = it.casting[casting.status as keyof typeof it.casting] || casting.status || "—";
  const status = statusStyles[casting.status || "draft"] ?? statusStyles.draft;

  const confirmed = casting.confirmed_talents ?? [];
  const shown = confirmed.slice(0, 3);
  const extra = Math.max(0, confirmed.length - shown.length);

  const open = () => navigate(`/owner/castings/${casting.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      className="group grid grid-cols-[32px_1fr_180px_140px_120px] items-center gap-4 px-4 h-20 border-b border-border/40 last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
    >
      {/* Star */}
      <FavoriteCastingStar
        castingId={casting.id}
        isFavorite={Boolean((casting as any).is_favorite)}
        size={16}
        variant="amber"
      />

      {/* Title */}
      <div className="min-w-0">
        <span className="text-foreground font-medium truncate block">
          {casting.title}
        </span>
      </div>

      {/* Selezione (avatar stack) */}
      <div className="flex items-center">
        {shown.length === 0 ? (
          <span className="text-sm text-muted-foreground/70">—</span>
        ) : (
          <div className="flex items-center">
            {shown.map((t, i) => (
              <Avatar
                key={t.profile?.id ?? i}
                size="md"
                className={cn("ring-2 ring-background", i > 0 && "-ml-3")}
              >
                {t.profile?.profile_photo_url ? (
                  <AvatarImage src={t.profile.profile_photo_url} alt="" />
                ) : null}
                <AvatarFallback className="text-xs bg-muted">
                  {getInitials(t.profile?.first_name, t.profile?.last_name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {extra > 0 && (
              <div className="-ml-3 h-12 w-12 rounded-full ring-2 ring-background bg-muted text-xs font-medium text-muted-foreground flex items-center justify-center">
                +{extra}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />
        <span className={cn("text-sm font-semibold", status.text)}>{statusLabel}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(casting);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Modifica rapida</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(casting);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{it.common.delete}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
};
