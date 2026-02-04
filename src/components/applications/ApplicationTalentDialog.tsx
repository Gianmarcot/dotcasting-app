import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTalentMediaByProfileId } from "@/hooks/useTalentMediaByProfileId";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
  Play,
  Image as ImageIcon,
} from "lucide-react";

interface ApplicationTalentProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
  city: string | null;
}

interface ApplicationTalentDialogProps {
  profile: ApplicationTalentProfile | null;
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

const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const ApplicationTalentDialog = ({
  profile,
  open,
  onOpenChange,
}: ApplicationTalentDialogProps) => {
  // Fetch full profile data
  const { data: fullProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["full-profile", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          talent_attributes(*)
        `)
        .eq("id", profile.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && open,
  });

  const { data: media, isLoading: mediaLoading } = useTalentMediaByProfileId(
    profile?.id || null
  );

  if (!profile) return null;

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Senza nome";
  const initials =
    [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join("") || "?";

  const attributes = fullProfile?.talent_attributes;
  const age = calculateAge(fullProfile?.birth_date || null);
  const location = [fullProfile?.city || profile.city, fullProfile?.country].filter(Boolean).join(", ");

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Dettaglio profilo</DialogTitle>
        </DialogHeader>

        {/* Header with photo and name */}
        <div className="flex items-start gap-4 pb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.profile_photo_url || undefined} alt={fullName} />
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
            {fullProfile?.talent_categories && fullProfile.talent_categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {fullProfile.talent_categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {profileLoading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!profileLoading && fullProfile && (
          <>
            {/* Bio */}
            {fullProfile.bio && (
              <>
                <Separator />
                <div className="py-3">
                  <h3 className="text-sm font-medium text-foreground mb-2">Chi sono</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {fullProfile.bio}
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
                  value={fullProfile.gender ? genderLabels[fullProfile.gender] || fullProfile.gender : null}
                />
              </div>
            </div>

            {/* Physical attributes */}
            {attributes && (
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
                      value={attributes.height ? `${attributes.height} cm` : null}
                    />
                    <InfoItem
                      icon={Scale}
                      label="Peso"
                      value={attributes.weight ? `${attributes.weight} kg` : null}
                    />
                    <InfoItem
                      icon={Palette}
                      label="Colore capelli"
                      value={
                        attributes.hair_color
                          ? hairColorLabels[attributes.hair_color] || attributes.hair_color
                          : null
                      }
                    />
                    <InfoItem
                      icon={Eye}
                      label="Colore occhi"
                      value={
                        attributes.eye_color
                          ? eyeColorLabels[attributes.eye_color] || attributes.eye_color
                          : null
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* Skills */}
            {attributes?.skills && attributes.skills.length > 0 && (
              <>
                <Separator />
                <div className="py-3">
                  <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Competenze
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {attributes.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Languages */}
            {attributes?.languages && attributes.languages.length > 0 && (
              <>
                <Separator />
                <div className="py-3">
                  <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Lingue
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {attributes.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Media Gallery */}
        <Separator />
        <div className="py-3">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Galleria media
          </h3>

          {mediaLoading && (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          )}

          {!mediaLoading && media && media.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {media.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                >
                  {item.media_type === "video" ? (
                    <>
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title || "Video"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || "Foto"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </a>
              ))}
            </div>
          )}

          {!mediaLoading && (!media || media.length === 0) && (
            <p className="text-sm text-muted-foreground">
              Nessun media nel portfolio
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
