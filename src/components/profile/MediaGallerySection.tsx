import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTalentMedia, useDeleteMedia, type TalentMedia } from "@/hooks/useTalentMedia";
import { 
  useTalentMediaByProfileIdEditable, 
  useDeleteMediaByProfileId, 
  type TalentMedia as TalentMediaType 
} from "@/hooks/useTalentMediaByProfileIdEditable";
import { useMediaRatingsForProfile, type MediaRating } from "@/hooks/useMediaRatings";
import { MediaGridItem } from "./MediaGridItem";
import { MediaLightbox } from "./MediaLightbox";
import { MediaUploadButton } from "./MediaUploadButton";

interface MediaGallerySectionProps {
  externalProfileId?: string;
  externalUserId?: string;
  isOwnerView?: boolean;
  showDeleteButton?: boolean;
}

export const MediaGallerySection = ({ 
  externalProfileId, 
  externalUserId,
  isOwnerView = false,
  showDeleteButton = true,
}: MediaGallerySectionProps) => {
  const { data: ownMedia, isLoading: ownLoading } = useTalentMedia();
  const { data: externalMedia, isLoading: externalLoading } = useTalentMediaByProfileIdEditable(externalProfileId);
  const { mutate: deleteOwnMedia, isPending: isOwnDeleting } = useDeleteMedia();
  const { mutate: deleteExternalMedia, isPending: isExternalDeleting } = useDeleteMediaByProfileId();
  const { data: ownerRatings } = useMediaRatingsForProfile(isOwnerView ? externalProfileId : null);
  
  const media = externalProfileId ? externalMedia : ownMedia;
  const isLoading = externalProfileId ? externalLoading : ownLoading;
  const isDeleting = externalProfileId ? isExternalDeleting : isOwnDeleting;
  
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Create a map of media_id -> rating for quick lookup
  const ratingsMap = new Map<string, MediaRating>();
  if (ownerRatings) {
    ownerRatings.forEach((rating) => {
      ratingsMap.set(rating.media_id, rating);
    });
  }

  const handleDelete = (mediaItem: TalentMedia | TalentMediaType) => {
    if (externalProfileId) {
      deleteExternalMedia({ media: mediaItem as TalentMediaType, profileId: externalProfileId });
    } else {
      deleteOwnMedia(mediaItem as TalentMedia);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galleria Media
          </CardTitle>
          {showDeleteButton && (
            <MediaUploadButton 
              disabled={isLoading} 
              externalProfileId={externalProfileId}
              externalUserId={externalUserId}
            />
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : media && media.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item, index) => (
                <MediaGridItem
                  key={item.id}
                  media={item}
                  onDelete={showDeleteButton ? handleDelete : undefined}
                  onClick={() => openLightbox(index)}
                  isDeleting={isDeleting}
                  isOwnerView={isOwnerView}
                  ownerRating={ratingsMap.get(item.id)}
                  showDeleteButton={showDeleteButton}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                Nessun media caricato. Aggiungi foto o video per mostrare il tuo portfolio.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightboxIndex !== null && media && (
        <MediaLightbox
          media={media}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
          isOwnerView={isOwnerView}
        />
      )}
    </>
  );
};
