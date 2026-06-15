import { useMemo } from "react";
import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import { useTalentsMainPhotos, TalentMainPhoto } from "@/hooks/useTalentsMainPhotos";
import { Badge } from "@/components/ui/badge";

interface Props {
  talents: TalentWithAttributes[];
  onSelectTalent: (t: TalentWithAttributes) => void;
}

const buildName = (t: TalentWithAttributes) => {
  if (t.stage_name) return t.stage_name;
  return [t.first_name, t.last_name].filter(Boolean).join(" ") || "Senza nome";
};

const buildInitials = (t: TalentWithAttributes) => {
  if (t.stage_name) {
    const p = t.stage_name.trim().split(/\s+/);
    return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase();
  }
  return (((t.first_name?.[0] || "") + (t.last_name?.[0] || "")) || "?").toUpperCase();
};

const buildLocation = (t: TalentWithAttributes) => {
  const isIt = !t.country || /^ita/i.test(t.country) || t.country === "IT";
  return isIt ? (t.city || "") : [t.city, t.country].filter(Boolean).join(", ");
};

const PhotoStrip = ({
  photos,
  initials,
  name,
  onPhotoClick,
}: {
  photos: TalentMainPhoto[];
  initials: string;
  name: string;
  onPhotoClick: () => void;
}) => {
  // Responsive slots: 2 mobile, 4 tablet, 6 desktop. Use max (6) for slicing; CSS hides extras.
  const MAX = 6;
  const visible = photos.slice(0, MAX);
  const remaining = photos.length - visible.length;
  const showPlus = remaining > 0;

  if (photos.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 flex-1">
        <div
          onClick={(e) => { e.stopPropagation(); onPhotoClick(); }}
          className="relative bg-[#2C2C2A] rounded-md overflow-hidden flex items-center justify-center cursor-pointer"
          style={{ aspectRatio: "3 / 4" }}
        >
          <span className="text-[#F1EFE8] text-2xl font-medium">{initials}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 flex-1">
      {visible.map((p, idx) => {
        const isLast = idx === visible.length - 1 && showPlus;
        return (
          <div
            key={p.id}
            onClick={(e) => { e.stopPropagation(); onPhotoClick(); }}
            className="relative rounded-md overflow-hidden bg-muted cursor-pointer"
            style={{ aspectRatio: "3 / 4" }}
          >
            <img
              src={p.thumbnail_url || p.url}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            {isLast && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg font-medium">+{remaining}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const TalentPortfolioList = ({ talents, onSelectTalent }: Props) => {
  const ids = useMemo(() => talents.map((t) => t.id), [talents]);
  const { data: photosMap } = useTalentsMainPhotos(ids);

  return (
    <div className="flex flex-col gap-3">
      {talents.map((t) => {
        const photos = photosMap?.get(t.id) || [];
        const name = buildName(t);
        const initials = buildInitials(t);
        const location = buildLocation(t);
        const age = calculateAge(t.birth_date);

        return (
          <div
            key={t.id}
            onClick={() => onSelectTalent(t)}
            className="flex flex-col md:flex-row gap-4 bg-white rounded-2xl border-0 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-full md:w-[180px] md:shrink-0">
              <h3 className="font-medium text-foreground truncate">{name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {[location, age ? `${age} anni` : null].filter(Boolean).join(" · ")}
              </p>
              {t.talent_categories && t.talent_categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.talent_categories.slice(0, 4).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-[10px]">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <PhotoStrip
              photos={photos}
              initials={initials}
              name={name}
              onPhotoClick={() => onSelectTalent(t)}
            />
          </div>
        );
      })}
    </div>
  );
};
