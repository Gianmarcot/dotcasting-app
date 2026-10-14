import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface StackProfile {
  id?: string | null;
  profile_photo_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

const SIZES = {
  sm: { avatar: "sm" as const, overlap: "-ml-2", chip: "h-8 w-8 text-[11px]" },
  md: { avatar: "md" as const, overlap: "-ml-3", chip: "h-12 w-12 text-xs" },
};

interface Props {
  /** Profili dei talent, nell'ordine in cui vanno mostrati. */
  profiles: Array<StackProfile | null | undefined>;
  /** Avatar visibili prima del pallino "+N". */
  max?: number;
  size?: keyof typeof SIZES;
  /** Classe dell'anello attorno agli avatar (deve staccare dallo sfondo). */
  ringClassName?: string;
  className?: string;
}

const getInitials = (first?: string | null, last?: string | null) => {
  const a = first?.charAt(0) ?? "";
  const b = last?.charAt(0) ?? "";
  return (a + b).toUpperCase() || "?";
};

/**
 * Stack di avatar sovrapposti usato nelle liste (casting, ruoli):
 * i primi `max` talent con foto/iniziali più un pallino "+N" per i rimanenti.
 */
export const TalentAvatarStack = ({
  profiles,
  max = 3,
  size = "md",
  ringClassName = "ring-white",
  className,
}: Props) => {
  const items = profiles.filter((p): p is StackProfile => Boolean(p));
  const shown = items.slice(0, max);
  const extra = Math.max(0, items.length - shown.length);
  const s = SIZES[size];

  if (shown.length === 0) return null;

  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <Avatar
          key={p.id ?? i}
          size={s.avatar}
          style={{ zIndex: shown.length - i }}
          className={cn("ring-2", ringClassName, i > 0 && s.overlap)}
        >
          {p.profile_photo_url ? <AvatarImage src={p.profile_photo_url} alt="" /> : null}
          <AvatarFallback className="bg-muted text-xs">
            {getInitials(p.first_name, p.last_name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <div
          className={cn(
            "z-[0] flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2",
            s.chip,
            s.overlap,
            ringClassName,
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};
