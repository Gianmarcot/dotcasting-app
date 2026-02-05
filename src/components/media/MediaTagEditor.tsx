import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALL_SUGGESTED_TAGS } from "@/hooks/useMediaRatings";
import { cn } from "@/lib/utils";

interface MediaTagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  readonly?: boolean;
  showSuggestions?: boolean;
  maxTags?: number;
}

export const MediaTagEditor = ({
  tags,
  onChange,
  readonly = false,
  showSuggestions = true,
  maxTags = 10,
}: MediaTagEditorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInputValue("");
    setShowInput(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Escape") {
      setShowInput(false);
      setInputValue("");
    }
  };

  // Filter suggestions to exclude already selected tags
  const availableSuggestions = ALL_SUGGESTED_TAGS.filter(
    (tag) => !tags.includes(tag)
  ).slice(0, 6);

  return (
    <div className="space-y-2">
      {/* Current tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs pr-1 flex items-center gap-1"
          >
            {tag}
            {!readonly && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Add tag button */}
        {!readonly && tags.length < maxTags && !showInput && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setShowInput(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Aggiungi
          </Button>
        )}
      </div>

      {/* Input for new tag */}
      {showInput && !readonly && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digita tag e premi Invio..."
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowInput(false);
              setInputValue("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && !readonly && showInput && availableSuggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Suggeriti:</p>
          <div className="flex flex-wrap gap-1">
            {availableSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full border border-dashed",
                  "text-muted-foreground hover:text-foreground",
                  "hover:border-primary hover:bg-primary/5 transition-colors"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
