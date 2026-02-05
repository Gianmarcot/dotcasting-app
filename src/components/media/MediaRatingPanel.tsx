import { useState, useEffect } from "react";
import { Star, Save, Loader2 } from "lucide-react";
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

interface MediaRatingPanelProps {
  mediaId: string;
  compact?: boolean;
  onSaved?: () => void;
}

export const MediaRatingPanel = ({
  mediaId,
  compact = false,
  onSaved,
}: MediaRatingPanelProps) => {
  const { data: existingRating, isLoading } = useMediaRating(mediaId);
  const { mutate: saveRating, isPending: isSaving } = useSaveMediaRating();

  const [rating, setRating] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state with existing rating
  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setTags(existingRating.tags || []);
      setNotes(existingRating.notes || "");
    } else {
      setRating(null);
      setTags([]);
      setNotes("");
    }
    setHasChanges(false);
  }, [existingRating, mediaId]);

  const handleRatingChange = (newRating: number | null) => {
    setRating(newRating);
    setHasChanges(true);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setHasChanges(true);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveRating(
      {
        mediaId,
        rating,
        tags,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Valutazione salvata");
          setHasChanges(false);
          onSaved?.();
        },
        onError: () => {
          toast.error("Errore nel salvataggio");
        },
      }
    );
  };

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
          {hasChanges && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isSaving}
              className="h-7 px-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <MediaTagEditor
          tags={tags}
          onChange={handleTagsChange}
          showSuggestions={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Star className="h-4 w-4" />
        Valutazione Owner
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
          className="text-sm resize-none"
        />
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className="w-full"
        size="sm"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvataggio...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salva valutazione
          </>
        )}
      </Button>
    </div>
  );
};
