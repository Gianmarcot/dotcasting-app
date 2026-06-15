import { TalentMainPhoto } from "@/hooks/useTalentsMainPhotos";
import { cn } from "@/lib/utils";

interface Props {
  photos: TalentMainPhoto[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  initials?: string;
  name?: string;
  /** Grid column classes. Default fits drawer. */
  columnsClassName?: string;
  /** Tailwind aspect ratio. Default 3/4 */
  aspectRatio?: string;
  className?: string;
}

/**
 * Reusable thumbnail strip for talent main_photos.
 * Used by the preview drawer (and conceptually shared with portfolio/comp card strips).
 */
export const TalentPhotoStrip = ({
  photos,
  activeIndex,
  onSelect,
  initials,
  name,
  columnsClassName = "grid-cols-5",
  aspectRatio = "3 / 4",
  className,
}: Props) => {
  if (photos.length === 0) {
    return (
      <div className={cn("grid gap-2", columnsClassName, className)}>
        <div
          className="relative bg-[#2C2C2A] rounded-md overflow-hidden flex items-center justify-center"
          style={{ aspectRatio }}
        >
          <span className="text-[#F1EFE8] text-lg font-medium">
            {(initials || "?").toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", columnsClassName, className)}>
      {photos.map((p, idx) => {
        const active = idx === activeIndex;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect?.(idx)}
            className={cn(
              "relative rounded-md overflow-hidden bg-muted focus:outline-none transition",
              active ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"
            )}
            style={{ aspectRatio }}
            aria-label={`Foto ${idx + 1}${name ? ` di ${name}` : ""}`}
          >
            <img
              src={p.thumbnail_url || p.url}
              alt={name || `Foto ${idx + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        );
      })}
    </div>
  );
};
