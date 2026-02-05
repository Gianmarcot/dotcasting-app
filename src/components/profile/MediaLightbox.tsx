import { useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, X, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaRatingPanel } from "@/components/media/MediaRatingPanel";
import { cn } from "@/lib/utils";

// Minimal media type for lightbox
interface LightboxMedia {
  id: string;
  url: string;
  media_type: string;
  title: string | null;
}

interface MediaLightboxProps {
  media: LightboxMedia[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  isOwnerView?: boolean;
}

export const MediaLightbox = ({
  media,
  currentIndex,
  onClose,
  onNavigate,
  isOwnerView = false,
}: MediaLightboxProps) => {
  const currentMedia = media[currentIndex];
  const [showRatingPanel, setShowRatingPanel] = useState(isOwnerView);

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
      className="fixed inset-0 z-[100] bg-black flex"
      onClick={onClose}
    >
      {/* Main content area */}
      <div className={cn(
        "flex-1 relative flex items-center justify-center",
        showRatingPanel && isOwnerView ? "mr-80" : ""
      )}>
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 h-10 w-10 text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Rating panel toggle for owners */}
        {isOwnerView && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 h-10 w-10 text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowRatingPanel(!showRatingPanel);
            }}
          >
            {showRatingPanel ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-14 w-14 text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            >
              <ChevronLeft className="h-10 w-10" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-14 w-14 text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="h-10 w-10" />
            </Button>
          </>
        )}

        {/* Media Content - Full screen */}
        <div
          className="w-full h-full flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {currentMedia.media_type === "photo" ? (
            <img
              src={currentMedia.url}
              alt={currentMedia.title || "Media"}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={currentMedia.url}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          )}
        </div>

        {/* Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/70 bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {media.length}
        </div>

        {/* Title */}
        {currentMedia.title && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-white font-medium bg-black/50 px-4 py-1 rounded-full">
            {currentMedia.title}
          </div>
        )}
      </div>

      {/* Rating Panel (Owner only) - Fixed on right side */}
      {isOwnerView && showRatingPanel && (
        <div
          className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border p-4 overflow-y-auto z-[101]"
          onClick={(e) => e.stopPropagation()}
        >
          <MediaRatingPanel
            key={currentMedia.id}
            mediaId={currentMedia.id}
            currentIndex={currentIndex}
            totalCount={media.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      )}
    </div>
  );
};
