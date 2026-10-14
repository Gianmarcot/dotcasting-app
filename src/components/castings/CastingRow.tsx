import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { TalentAvatarStack } from "@/components/talents/TalentAvatarStack";
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

export const CastingRow = ({ casting, onEdit, onDelete }: CastingRowProps) => {
  const navigate = useNavigate();

  const statusLabel = it.casting[casting.status as keyof typeof it.casting] || casting.status || "—";
  const status = statusStyles[casting.status || "draft"] ?? statusStyles.draft;

  const confirmed = casting.confirmed_talents ?? [];

  const open = () => navigate(`/owner/castings/${casting.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      className="group grid grid-cols-[32px_minmax(200px,2fr)_minmax(160px,1.5fr)_minmax(120px,1fr)_120px] items-center gap-4 px-4 h-20 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
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
        {confirmed.length === 0 ? (
          <span className="text-sm text-muted-foreground/70">—</span>
        ) : (
          <TalentAvatarStack profiles={confirmed.map((t) => t.profile)} />
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
