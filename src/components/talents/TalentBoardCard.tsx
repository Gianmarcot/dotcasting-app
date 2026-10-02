import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import { TalentMainPhoto } from "@/hooks/useTalentsMainPhotos";
import { MinorPill, FiscalPill } from "@/components/talents/TalentStatusPill";

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

export const buildDisplayName = (t: TalentWithAttributes) => {
  if (t.stage_name) return t.stage_name;
  const f = t.first_name?.trim() || "";
  const l = t.last_name?.trim() || "";
  if (f && l) return `${f} ${l}`;
  return f || l || "Senza nome";
};

export const buildInitials = (t: TalentWithAttributes) => {
  if (t.stage_name) {
    const parts = t.stage_name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (((t.first_name?.[0] || "") + (t.last_name?.[0] || "")) || "?").toUpperCase();
};

export const buildMeta = (t: TalentWithAttributes) => {
  const isIt = !t.country || /^ita/i.test(t.country) || t.country === "IT";
  const location = isIt ? (t.city || "") : [t.city, t.country].filter(Boolean).join(", ");
  const age = calculateAge(t.birth_date);
  return [location, age ? `${age} anni` : null].filter(Boolean).join(" · ");
};

export const TalentBoardCard = ({ talent, photos, onClick }: Props) => {
  const name = buildDisplayName(talent);
  const meta = buildMeta(talent);
  const profilePhoto = talent.profile_photo_url?.trim() || null;
  const orderedPhotos = [
    ...(profilePhoto
      ? [{
          id: `profile-${talent.id}`,
          profile_id: talent.id,
          url: profilePhoto,
          thumbnail_url: null,
          sort_order: -1,
        } satisfies TalentMainPhoto]
      : []),
    ...photos,
  ].filter((photo, index, all) => {
    const source = photo.thumbnail_url || photo.url;
    return all.findIndex((candidate) => (candidate.thumbnail_url || candidate.url) === source) === index;
  });
  const main = orderedPhotos[0];
  const secondary = orderedPhotos[1];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full flex-col justify-between overflow-hidden rounded-xl bg-[#2C2C2A] p-4 text-left transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ aspectRatio: "2 / 3" }}
    >
      {main ? (
        <>
          <img
            src={main.thumbnail_url || main.url}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {secondary && (
            <img
              src={secondary.thumbnail_url || secondary.url}
              alt={`Seconda foto di ${name}`}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              loading="lazy"
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#F1EFE8] text-5xl font-medium tracking-wide">{buildInitials(talent)}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/80" />

      <div className="relative flex flex-wrap gap-1">
        <MinorPill birthDate={talent.birth_date} />
        <FiscalPill profile={talent} />
      </div>

      <div className="relative text-white">
        <div className="font-display uppercase text-lg leading-tight">{name}</div>
        {meta && <div className="mt-1 truncate text-sm">{meta}</div>}
      </div>
    </button>
  );
};
