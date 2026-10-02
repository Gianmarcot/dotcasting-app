import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaRatingStars } from "./MediaRatingStars";
import { MediaTagEditor } from "./MediaTagEditor";
import {
  useMediaRating,
  useSaveMediaRating,
  type MediaRating,
} from "@/hooks/useMediaRatings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaRatingPanelProps {
  mediaId: string;
  compact?: boolean;
  onSaved?: () => void;
  // Navigation props
  currentIndex?: number;
  totalCount?: number;
  ratedCount?: number;
  isCurrentRated?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const MediaRatingPanel = ({
  mediaId,
  compact = false,
  onSaved,
  currentIndex,
  totalCount,
  ratedCount = 0,
  isCurrentRated = false,
  onPrevious,
  onNext,
}: MediaRatingPanelProps) => {
  const { data: existingRating, isLoading } = useMediaRating(mediaId);
  const { mutate: saveRating, isPending: isSaving } = useSaveMediaRating();

  const [rating, setRating] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [savedOnce, setSavedOnce] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  type Pending = { mediaId: string; rating: number | null; tags: string[]; notes: string };
  const pendingRef = useRef<Pending | null>(null);

  const persist = useCallback(
    (data: Pending) => {
      saveRating(
        { mediaId: data.mediaId, rating: data.rating, tags: data.tags, notes: data.notes || null },
        {
          onSuccess: () => {
            setSavedOnce(true);
            onSaved?.();
          },
          onError: () => toast.error("Errore nel salvataggio della valutazione"),
        }
      );
    },
    [saveRating, onSaved]
  );

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) persist(pending);
  }, [persist]);

  // Sync state with existing rating (skip while a note edit is pending)
  useEffect(() => {
    if (pendingRef.current?.mediaId === mediaId) return;
    if (existingRating) {
      setRating(existingRating.rating);
      setTags(existingRating.tags || []);
      setNotes(existingRating.notes || "");
    } else {
      setRating(null);
      setTags([]);
      setNotes("");
    }
  }, [existingRating, mediaId]);

  // Flush pending note when switching media or unmounting
  useEffect(() => {
    setSavedOnce(false);
    return () => flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId]);

  const handleRatingChange = (newRating: number | null) => {
    setRating(newRating);
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = null;
    persist({ mediaId, rating: newRating, tags, notes });
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = null;
    persist({ mediaId, rating, tags: newTags, notes });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    pendingRef.current = { mediaId, rating, tags, notes: newNotes };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 800);
  };

  const status = isSaving ? "Salvataggio…" : savedOnce ? "Salvato" : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <MediaRatingStars
            value={rating}
            onChange={handleRatingChange}
            size="md"
          />
          {status && <span className="text-xs text-muted-foreground">{status}</span>}
        </div>
        <MediaTagEditor
          tags={tags}
          onChange={handleTagsChange}
          showSuggestions={false}
        />
      </div>
    );
  }

  const showNavigation = currentIndex !== undefined && totalCount !== undefined && totalCount > 1;

  return (
    <div className="space-y-4">
      {/* Navigation header */}
      {showNavigation && (
        <div className="space-y-2 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {isCurrentRated && (
                <Check className="h-4 w-4 text-primary" />
              )}
              <span className={cn(
                "text-sm",
                isCurrentRated ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {currentIndex + 1} / {totalCount}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          {/* Rating progress indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Star className="h-3 w-3" />
            <span>{ratedCount} di {totalCount} valutate</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Star className="h-4 w-4" />
        Valutazione agenzia
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Rating</Label>
        <MediaRatingStars
          value={rating}
          onChange={handleRatingChange}
          size="lg"
          showLabel
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Tags</Label>
        <MediaTagEditor tags={tags} onChange={handleTagsChange} />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Note private</Label>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Aggiungi note personali su questa immagine..."
          rows={3}
          onBlur={flush}
          className="text-sm resize-none"
        />
      </div>

      <p className="h-4 text-xs text-muted-foreground" aria-live="polite">{status}</p>
    </div>
  );
};
