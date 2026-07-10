import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useToggleCastingFavorite } from "@/hooks/useCastings";

interface FavoriteCastingStarProps {
  castingId: string;
  isFavorite: boolean;
  size?: number;
  className?: string;
  variant?: "primary" | "amber";
}

export const FavoriteCastingStar = ({
  castingId,
  isFavorite,
  size = 18,
  className,
  variant = "amber",
}: FavoriteCastingStarProps) => {
  const toggle = useToggleCastingFavorite();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await toggle.mutateAsync({ id: castingId, is_favorite: !isFavorite });
      toast({
        title: !isFavorite ? "Aggiunto ai preferiti" : "Rimosso dai preferiti",
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i preferiti",
        variant: "destructive",
      });
    }
  };

  const activeColor = variant === "amber" ? "text-amber-400" : "text-primary";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      aria-pressed={isFavorite}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted/60 disabled:opacity-50",
        isFavorite ? activeColor : "text-muted-foreground/60 hover:text-foreground",
        className,
      )}
    >
      <Star
        size={size}
        fill={isFavorite ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
};
