import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TalentMedia } from "@/hooks/useTalentMedia";

interface MediaLightboxProps {
  media: TalentMedia[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const MediaLightbox = ({
  media,
  currentIndex,
  onClose,
  onNavigate,
}: MediaLightboxProps) => {
  const currentMedia = media[currentIndex];

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : media.length - 1;
    onNavigate(newIndex);
  }, [currentIndex, media.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < media.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  }, [currentIndex, media.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, handlePrevious, handleNext]);

  if (!currentMedia) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 h-10 w-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Media Content */}
      <div
        className="absolute inset-0 flex items-center justify-center p-16"
        onClick={(e) => e.stopPropagation()}
      >
        {currentMedia.media_type === "photo" ? (
          <img
            src={currentMedia.url}
            alt={currentMedia.title || "Media"}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
        {currentIndex + 1} / {media.length}
      </div>

      {/* Title */}
      {currentMedia.title && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-foreground font-medium">
          {currentMedia.title}
        </div>
      )}
    </div>
  );
};
