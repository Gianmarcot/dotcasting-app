import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTalentMedia, useDeleteMedia, type TalentMedia } from "@/hooks/useTalentMedia";
import { MediaGridItem } from "./MediaGridItem";
import { MediaLightbox } from "./MediaLightbox";
import { MediaUploadButton } from "./MediaUploadButton";

export const MediaGallerySection = () => {
  const { data: media, isLoading } = useTalentMedia();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleDelete = (mediaItem: TalentMedia) => {
    deleteMedia(mediaItem);
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
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            Galleria Media
          </CardTitle>
          <MediaUploadButton disabled={isLoading} />
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
                  onDelete={handleDelete}
                  onClick={() => openLightbox(index)}
                  isDeleting={isDeleting}
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
        />
      )}
    </>
  );
};
