import { TriageTalent } from "@/hooks/useOwnerDashboard";
import { calculateAge } from "@/hooks/useTalents";

interface Props {
  talent: TriageTalent;
  onOpen: () => void;
}

const buildName = (t: TriageTalent) => {
  if (t.stage_name) return t.stage_name;
  return [t.first_name, t.last_name].filter(Boolean).join(" ") || "Senza nome";
};

const buildInitials = (t: TriageTalent) => {
  const s = buildName(t);
  const parts = s.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
};

const buildLocation = (t: TriageTalent) => {
  const isIt = !t.country || /^ita/i.test(t.country) || t.country === "IT";
  return isIt ? (t.city || "") : [t.city, t.country].filter(Boolean).join(", ");
};

export const TriageTalentCard = ({ talent, onOpen }: Props) => {
  const photo = talent.main_photo_url || talent.profile_photo_url;
  const age = calculateAge(talent.birth_date);
  const loc = buildLocation(talent);
  const meta = [loc, age ? `${age} anni` : null].filter(Boolean).join(" · ");

  return (
    <div
      onClick={onOpen}
      className="snap-start shrink-0 w-40 md:w-44 cursor-pointer group relative rounded-2xl overflow-hidden bg-charcoal text-charcoal-foreground shadow-sm"
      style={{ aspectRatio: "5 / 7" }}
    >
      {photo ? (
        <img
          src={photo}
          alt={buildName(talent)}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-2xl tracking-wider">
          {buildInitials(talent)}
        </div>
      )}

      {/* Bottom fade overlay */}
      <div className="absolute inset-x-0 bottom-0 pt-12 pb-2 px-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white">
        <p className="text-[14px] font-medium leading-tight">{buildName(talent)}</p>
        {meta && <p className="text-[11px] text-white/80 mt-0.5">{meta}</p>}
      </div>
    </div>
  );
};

