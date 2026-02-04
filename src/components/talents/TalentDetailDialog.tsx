import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import {
  MapPin,
  User,
  Ruler,
  Scale,
  Eye,
  Palette,
  Languages,
  Sparkles,
  Calendar,
} from "lucide-react";

interface TalentDetailDialogProps {
  talent: TalentWithAttributes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const genderLabels: Record<string, string> = {
  male: "Uomo",
  female: "Donna",
  other: "Altro",
};

const hairColorLabels: Record<string, string> = {
  black: "Neri",
  brown: "Castani",
  blonde: "Biondi",
  red: "Rossi",
  gray: "Grigi",
  white: "Bianchi",
  other: "Altro",
};

const eyeColorLabels: Record<string, string> = {
  brown: "Marroni",
  blue: "Azzurri",
  green: "Verdi",
  hazel: "Nocciola",
  gray: "Grigi",
  other: "Altro",
};

export const TalentDetailDialog = ({
  talent,
  open,
  onOpenChange,
}: TalentDetailDialogProps) => {
  if (!talent) return null;

  const fullName =
    [talent.first_name, talent.last_name].filter(Boolean).join(" ") || "Senza nome";
  const initials =
    [talent.first_name?.[0], talent.last_name?.[0]].filter(Boolean).join("") || "?";
  const age = calculateAge(talent.birth_date);
  const location = [talent.city, talent.country].filter(Boolean).join(", ");

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number | null | undefined;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm text-foreground">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Dettaglio profilo</DialogTitle>
        </DialogHeader>

        {/* Header with photo and name */}
        <div className="flex items-start gap-4 pb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={talent.profile_photo_url || undefined} alt={fullName} />
            <AvatarFallback className="bg-muted text-foreground text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-medium text-foreground">{fullName}</h2>
            {location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
            {/* Categories */}
            {talent.talent_categories && talent.talent_categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {talent.talent_categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {talent.bio && (
          <>
            <Separator />
            <div className="py-3">
              <h3 className="text-sm font-medium text-foreground mb-2">Chi sono</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {talent.bio}
              </p>
            </div>
          </>
        )}

        {/* Personal info */}
        <Separator />
        <div className="py-3">
          <h3 className="text-sm font-medium text-foreground mb-2">Informazioni personali</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoItem icon={Calendar} label="Età" value={age ? `${age} anni` : null} />
            <InfoItem
              icon={User}
              label="Genere"
              value={talent.gender ? genderLabels[talent.gender] || talent.gender : null}
            />
          </div>
        </div>

        {/* Physical attributes */}
        {talent.attributes && (
          <>
            <Separator />
            <div className="py-3">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Caratteristiche fisiche
              </h3>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoItem
                  icon={Ruler}
                  label="Altezza"
                  value={talent.attributes.height ? `${talent.attributes.height} cm` : null}
                />
                <InfoItem
                  icon={Scale}
                  label="Peso"
                  value={talent.attributes.weight ? `${talent.attributes.weight} kg` : null}
                />
                <InfoItem
                  icon={Palette}
                  label="Colore capelli"
                  value={
                    talent.attributes.hair_color
                      ? hairColorLabels[talent.attributes.hair_color] ||
                        talent.attributes.hair_color
                      : null
                  }
                />
                <InfoItem
                  icon={Eye}
                  label="Colore occhi"
                  value={
                    talent.attributes.eye_color
                      ? eyeColorLabels[talent.attributes.eye_color] ||
                        talent.attributes.eye_color
                      : null
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* Skills */}
        {talent.attributes?.skills && talent.attributes.skills.length > 0 && (
          <>
            <Separator />
            <div className="py-3">
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Competenze
              </h3>
              <div className="flex flex-wrap gap-2">
                {talent.attributes.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Languages */}
        {talent.attributes?.languages && talent.attributes.languages.length > 0 && (
          <>
            <Separator />
            <div className="py-3">
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Lingue
              </h3>
              <div className="flex flex-wrap gap-2">
                {talent.attributes.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
