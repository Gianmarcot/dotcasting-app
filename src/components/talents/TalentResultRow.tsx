import { TalentWithAttributes, calculateAge, calculateProfileCompletion } from "@/hooks/useTalents";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TalentResultRowProps {
  talent: TalentWithAttributes;
  onClick: () => void;
}

const getInitials = (first: string | null, last: string | null) => {
  return [first?.[0], last?.[0]].filter(Boolean).join("").toUpperCase() || "?";
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-rose-100 text-rose-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-cyan-100 text-cyan-700",
    "bg-pink-100 text-pink-700",
    "bg-indigo-100 text-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const genderLabels: Record<string, string> = {
  M: "Uomo",
  F: "Donna",
  NB: "Non-binario",
  other: "Altro",
};

export const TalentResultRow = ({ talent, onClick }: TalentResultRowProps) => {
  const fullName = [talent.first_name, talent.last_name].filter(Boolean).join(" ") || "Senza nome";
  const age = calculateAge(talent.birth_date);
  const completion = calculateProfileCompletion(talent, 0); // media count unknown in list
  const initials = getInitials(talent.first_name, talent.last_name);
  const avatarColor = getAvatarColor(fullName);
  const roles = talent.talent_categories?.slice(0, 3) || [];

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0"
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={talent.profile_photo_url || undefined} alt={fullName} />
        <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
      </Avatar>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{fullName}</span>
          {age && <span className="text-xs text-muted-foreground">{age} anni</span>}
          {talent.city && (
            <span className="text-xs text-muted-foreground">• {talent.city}</span>
          )}
        </div>
        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {roles.map((role) => (
            <Badge key={role} variant="secondary" className="text-[10px] h-5 px-1.5">
              {role}
            </Badge>
          ))}
          {talent.attributes?.height && (
            <span className="text-[10px] text-muted-foreground">{talent.attributes.height}cm</span>
          )}
          {talent.gender && (
            <span className="text-[10px] text-muted-foreground">
              {genderLabels[talent.gender] || talent.gender}
            </span>
          )}
        </div>
      </div>

      {/* Right side: completion */}
      <div className="shrink-0 text-right">
        <div className="text-xs font-medium text-foreground">{completion}%</div>
        <div className="text-[10px] text-muted-foreground">profilo</div>
      </div>
    </div>
  );
};
