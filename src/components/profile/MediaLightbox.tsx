import { useEffect, useCallback, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, PanelRightOpen, PanelRightClose } from "lucide-react";
import { ModalNavBar, ModalNavButton } from "@/components/ui/modal-nav-bar";
import { MediaRatingPanel } from "@/components/media/MediaRatingPanel";
import { cn } from "@/lib/utils";
import { type MediaRating } from "@/hooks/useMediaRatings";

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
  ratingsMap?: Map<string, MediaRating>;
}

export const MediaLightbox = ({
  media,
  currentIndex,
  onClose,
  onNavigate,
  isOwnerView = false,
  ratingsMap,
}: MediaLightboxProps) => {
  const currentMedia = media[currentIndex];
  const [showRatingPanel, setShowRatingPanel] = useState(isOwnerView);

  // Calculate rated media count
  const ratedCount = ratingsMap ? Array.from(ratingsMap.values()).filter(r => r.rating !== null).length : 0;

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
      if (!["Escape", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onClose, handlePrevious, handleNext]);

  if (!currentMedia) return null;

  // Guard for SSR environments
  if (typeof document === "undefined") return null;

  // Rendered as its own Radix dialog layer so that, when opened above another
  // modal (gallery, profile preview), it becomes the topmost layer: pointer
  // events and focus (stars, tags, notes textarea) are not blocked or stolen
  // by the underlying dialog's focus trap.
  return (
    <DialogPrimitive.Root open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogPrimitive.Portal>
    <DialogPrimitive.Content
      aria-describedby={undefined}
      onEscapeKeyDown={(e) => e.preventDefault()}
      onPointerDownOutside={(e) => e.preventDefault()}
      onInteractOutside={(e) => e.preventDefault()}
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="pointer-events-auto fixed inset-0 z-[9999] bg-black flex outline-none"
      onClick={onClose}
    >
      <DialogPrimitive.Title className="sr-only">{currentMedia.title || "Media"}</DialogPrimitive.Title>
      {/* Main content area */}
      <div className={cn(
        "flex-1 relative flex items-center justify-center",
        showRatingPanel && isOwnerView ? "mr-80" : ""
      )}>
        {media.length > 1 && (
          <>
            <div
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/[0.08] p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalNavButton onClick={handlePrevious} label="Media precedente">
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </ModalNavButton>
            </div>
            <div
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/[0.08] p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalNavButton onClick={handleNext} label="Media successivo">
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
              </ModalNavButton>
            </div>
          </>
        )}
        <div className="absolute right-8 top-8 z-10" onClick={(e) => e.stopPropagation()}>
          <ModalNavBar
            tone="light"
            onClose={onClose}
            labels={{ prev: "Media precedente", next: "Media successivo", close: "Chiudi" }}
            leadingActions={
              isOwnerView ? (
                <ModalNavButton
                  onClick={() => setShowRatingPanel(!showRatingPanel)}
                  label={showRatingPanel ? "Chiudi valutazione" : "Apri valutazione"}
                >
                  {showRatingPanel ? (
                    <PanelRightClose className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <PanelRightOpen className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </ModalNavButton>
              ) : undefined
            }
          />
        </div>

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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white bg-white/[0.08] px-3 py-1 rounded-full">
          {currentIndex + 1} / {media.length}
        </div>

        {/* Title */}
        {currentMedia.title && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-white font-medium bg-white/[0.08] px-4 py-1 rounded-full">
            {currentMedia.title}
          </div>
        )}
      </div>

      {/* Rating Panel (Owner only) - Fixed on right side */}
      {isOwnerView && showRatingPanel && (
        <div
          className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border p-4 overflow-y-auto z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          <MediaRatingPanel
            key={currentMedia.id}
            mediaId={currentMedia.id}
            currentIndex={currentIndex}
            totalCount={media.length}
            ratedCount={ratedCount}
            isCurrentRated={ratingsMap?.has(currentMedia.id) && ratingsMap.get(currentMedia.id)?.rating !== null}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      )}
    </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
