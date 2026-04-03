import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MapPin, Ruler, User } from "lucide-react";
import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";

interface TalentCardProps {
  talent: TalentWithAttributes;
  onClick?: () => void;
}

export const TalentCard = ({ talent, onClick }: TalentCardProps) => {
  const fullName = [talent.first_name, talent.last_name].filter(Boolean).join(" ") || "Senza nome";
  const initials = [talent.first_name?.[0], talent.last_name?.[0]].filter(Boolean).join("") || "?";
  const age = calculateAge(talent.birth_date);
  const location = [talent.city, talent.country].filter(Boolean).join(", ");

  return (
    <Card
      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={talent.profile_photo_url || undefined} alt={fullName} />
            <AvatarFallback className="bg-muted text-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-foreground truncate font-medium">{fullName}</h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-2">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              {age && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {age} anni
                </span>
              )}
              {talent.attributes?.height && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {talent.attributes.height} cm
                </span>
              )}
            </div>

            {/* Categories */}
            {talent.talent_categories && talent.talent_categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {talent.talent_categories.slice(0, 3).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {talent.talent_categories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{talent.talent_categories.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Skills */}
            {talent.attributes?.skills && talent.attributes.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {talent.attributes.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-muted px-2.5 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {talent.attributes.skills.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{talent.attributes.skills.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
