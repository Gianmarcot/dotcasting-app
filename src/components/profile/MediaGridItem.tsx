import { useState } from "react";
import { Play, Trash2, GripVertical } from "lucide-react";
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
import type { TalentMedia } from "@/hooks/useTalentMedia";

interface MediaGridItemProps {
  media: TalentMedia;
  onDelete: (media: TalentMedia) => void;
  onClick: () => void;
  isDeleting?: boolean;
}

export const MediaGridItem = ({
  media,
  onDelete,
  onClick,
  isDeleting,
}: MediaGridItemProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative rounded-lg overflow-hidden bg-muted border border-border">
      <AspectRatio ratio={1}>
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
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1.5 bg-background/80 rounded-md cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Delete Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>

      {/* Title Overlay */}
      {media.title && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent">
          <p className="text-sm text-foreground truncate">{media.title}</p>
        </div>
      )}
    </div>
  );
};
