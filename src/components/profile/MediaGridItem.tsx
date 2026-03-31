import { useState, useRef } from "react";
import { Play, Trash2, Crop, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import type { TalentMedia } from "@/hooks/useTalentMedia";
import type { MediaRating } from "@/hooks/useMediaRatings";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface MediaGridItemProps {
  media: TalentMedia;
  onDelete?: (media: TalentMedia) => void;
  onCrop?: (media: TalentMedia) => void;
  onClick: () => void;
  isDeleting?: boolean;
  isOwnerView?: boolean;
  ownerRating?: MediaRating | null;
  showDeleteButton?: boolean;
  enableDrag?: boolean;
}

export const MediaGridItem = ({
  media,
  onDelete,
  onCrop,
  onClick,
  isDeleting,
  isOwnerView = false,
  ownerRating,
  showDeleteButton = true,
  enableDrag = false,
}: MediaGridItemProps) => {
  const [imageError, setImageError] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id, disabled: !enableDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-lg overflow-hidden bg-muted border border-border"
    >
      <AspectRatio ratio={2 / 3}>
        {media.media_type === "photo" ? (
          <img
            src={imageError ? "/placeholder.svg" : media.url}
            alt={media.title || "Media"}
            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
            onClick={onClick}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-full h-full bg-muted flex items-center justify-center cursor-pointer relative"
            onClick={onClick}
          >
            <video
              src={media.url}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary-foreground ml-1" />
              </div>
            </div>
          </div>
        )}
      </AspectRatio>

      {/* Drag Handle */}
      {enableDrag && showDeleteButton && (
        <div
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <div className="p-1.5 bg-background/80 rounded-md cursor-grab text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Owner Rating Overlay */}
      {isOwnerView && ownerRating && (ownerRating.rating || (ownerRating.tags && ownerRating.tags.length > 0)) && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {ownerRating.rating && (
            <div className="flex items-center gap-0.5 bg-background/90 px-1.5 py-0.5 rounded">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= ownerRating.rating!
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          )}
          {ownerRating.tags && ownerRating.tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 max-w-full">
              {ownerRating.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                  {tag}
                </Badge>
              ))}
              {ownerRating.tags.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                  +{ownerRating.tags.length - 2}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showDeleteButton && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {/* Crop button (photos only) */}
          {media.media_type === "photo" && onCrop && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onCrop(media);
              }}
            >
              <Crop className="h-4 w-4" />
            </Button>
          )}
          {/* Delete button */}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminare questo media?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non può essere annullata. Il file verrà eliminato
                    definitivamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(media)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {/* Title Overlay */}
      {media.title && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent">
          <p className="text-sm text-foreground truncate">{media.title}</p>
        </div>
      )}
    </div>
  );
};
