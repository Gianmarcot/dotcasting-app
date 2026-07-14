import { ImageOff } from "lucide-react";
import type { TalentWithAttributes } from "@/hooks/useTalents";
import type { TalentMainPhoto } from "@/hooks/useTalentsMainPhotos";

interface Props {
  talent: TalentWithAttributes;
  photo?: TalentMainPhoto;
  onClick: () => void;
}

const buildName = (t: TalentWithAttributes) =>
  t.stage_name ||
  [t.first_name, t.last_name].filter(Boolean).join(" ") ||
  "Senza nome";

export const RoundTalentTile = ({ talent, photo, onClick }: Props) => {
  const name = buildName(talent);
  const subtitle = talent.city || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {photo?.url ? (
        <img
          src={photo.url}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          <ImageOff className="h-6 w-6" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
        <p className="font-display uppercase text-white text-lg leading-tight tracking-wide truncate">
          {name}
        </p>
        {subtitle && (
          <p className="text-white/80 text-sm truncate">{subtitle}</p>
        )}
      </div>
    </button>
  );
};
