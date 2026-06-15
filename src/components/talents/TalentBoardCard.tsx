import { useState } from "react";
import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import { TalentMainPhoto } from "@/hooks/useTalentsMainPhotos";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Video, FileText } from "lucide-react";

export interface MaterialIndicators {
  photos: number;
  videos: number;
  hasPdf: boolean;
}

interface Props {
  talent: TalentWithAttributes;
  photos: TalentMainPhoto[];
  onClick?: () => void;
  materialIndicators?: MaterialIndicators;
}

const buildDisplayName = (t: TalentWithAttributes) => {
  if (t.stage_name) return t.stage_name;
  const f = t.first_name?.trim() || "";
  const l = t.last_name?.trim() || "";
  if (f && l) return `${f} ${l.charAt(0)}.`;
  return f || l || "Senza nome";
};

const buildInitials = (t: TalentWithAttributes) => {
  if (t.stage_name) {
    const parts = t.stage_name.trim().split(/\s+/);
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  }
  return ((t.first_name?.[0] || "") + (t.last_name?.[0] || "")) || "?";
};

const buildLocation = (t: TalentWithAttributes) => {
  const isIt = !t.country || /^ita/i.test(t.country) || t.country === "IT";
  return isIt ? (t.city || "") : [t.city, t.country].filter(Boolean).join(", ");
};

export const TalentBoardCard = ({ talent, photos, onClick }: Props) => {
  const [hover, setHover] = useState(false);
  const name = buildDisplayName(talent);
  const initials = buildInitials(talent).toUpperCase();
  const age = calculateAge(talent.birth_date);
  const location = buildLocation(talent);
  const meta = [location, age ? `${age} anni` : null].filter(Boolean).join(" · ");

  const main = photos[0];
  const second = photos[1];
  const showSecond = hover && !!second;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative block w-full overflow-hidden rounded-xl bg-[#2C2C2A] text-left focus:outline-none focus:ring-2 focus:ring-primary"
      style={{ aspectRatio: "2 / 3" }}
    >
      {main ? (
        <>
          <img
            src={main.thumbnail_url || main.url}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
            style={{ opacity: showSecond ? 0 : 1 }}
            loading="lazy"
          />
          {second && (
            <img
              src={second.thumbnail_url || second.url}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 hidden md:block"
              style={{ opacity: showSecond ? 1 : 0 }}
              loading="lazy"
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#F1EFE8] text-5xl font-medium tracking-wide">
            {initials}
          </span>
        </div>
      )}

      {/* Hover overlay with roles (desktop only) */}
      {talent.talent_categories && talent.talent_categories.length > 0 && (
        <div className="absolute inset-x-0 top-0 hidden md:flex flex-wrap gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/60 to-transparent">
          {talent.talent_categories.slice(0, 4).map((cat) => (
            <Badge key={cat} variant="secondary" className="text-[10px] bg-white/90 text-black">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Bottom info band */}
      <div className="absolute inset-x-0 bottom-0 bg-[#1a1a1a]/90 px-3 py-2 text-white">
        <div className="truncate text-sm font-medium">{name}</div>
        {meta && (
          <div className="truncate text-[11px] text-white/70 mt-0.5">{meta}</div>
        )}
      </div>
    </button>
  );
};
