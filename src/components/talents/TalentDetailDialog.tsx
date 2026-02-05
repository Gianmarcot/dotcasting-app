import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import { useTalentMediaByProfileId } from "@/hooks/useTalentMediaByProfileId";
import { useMediaRatingsForProfile, type MediaRating } from "@/hooks/useMediaRatings";
import { TalentExportDialog } from "./TalentExportDialog";
import { InviteTalentDialog } from "@/components/invitations/InviteTalentDialog";
import { MediaLightbox } from "@/components/profile/MediaLightbox";
import { MediaRatingStars } from "@/components/media/MediaRatingStars";
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
  Download,
  Play,
  Image as ImageIcon,
  Send,
  Pencil,
  Star,
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
  const navigate = useNavigate();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const { data: media, isLoading: mediaLoading } = useTalentMediaByProfileId(
    talent?.id || null
  );
  const { data: ownerRatings } = useMediaRatingsForProfile(talent?.id || null);

  // Create a map of media_id -> rating for quick lookup
  const ratingsMap = new Map<string, MediaRating>();
  if (ownerRatings) {
    ownerRatings.forEach((rating) => {
      ratingsMap.set(rating.media_id, rating);
    });
  }

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
      <div className="flex items-center gap-3 py-2 text-muted-foreground">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <div>
          <p className="text-xs">{label}</p>
          <p className="text-sm text-foreground">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Dettaglio profilo</DialogTitle>
          </DialogHeader>

          {/* Header with photo and name */}
          <div className="flex items-start gap-4 pb-2">
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

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pb-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                navigate(`/owner/talents/${talent.id}/edit`);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Modifica
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteDialog(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Invita
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta PDF
            </Button>
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
                {media.map((item, index) => {
                  const itemRating = ratingsMap.get(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLightboxIndex(index)}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
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
                      
                      {/* Owner Rating Overlay */}
                      {itemRating && (itemRating.rating || (itemRating.tags && itemRating.tags.length > 0)) && (
                        <div className="absolute top-1 left-1 flex flex-col gap-0.5 pointer-events-none">
                          {itemRating.rating && (
                            <div className="flex items-center gap-0.5 bg-background/90 px-1 py-0.5 rounded">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-2.5 w-2.5 ${
                                    star <= itemRating.rating!
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-transparent text-muted-foreground/40"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {itemRating.tags && itemRating.tags.length > 0 && (
                            <div className="flex flex-wrap gap-0.5">
                              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                                {itemRating.tags[0]}
                                {itemRating.tags.length > 1 && ` +${itemRating.tags.length - 1}`}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* Lightbox with rating panel */}
      {lightboxIndex !== null && media && (
        <MediaLightbox
          media={media}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          isOwnerView={true}
        />
      )}

      {/* Export dialog */}
      <TalentExportDialog
        talent={talent}
        media={media || []}
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />

      {/* Invite dialog */}
      <InviteTalentDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        talentUserId={talent.user_id}
        talentName={fullName}
      />
    </>
  );
};
