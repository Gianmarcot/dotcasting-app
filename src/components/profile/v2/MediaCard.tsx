import { useEffect, useRef, useState } from "react";
import { Camera, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTalentMedia } from "@/hooks/useTalentMedia";
import { PHOTO_CATEGORIES, VIDEO_CATEGORIES, getCategoryLabel } from "@/lib/mediaCategories";
import type { MediaCategory } from "@/lib/mediaCategories";
import { SectionCard } from "@/components/profile/fields/FormFields";
import { MediaGalleryModal } from "@/components/profile/v2/photos/MediaGalleryModal";
import type { TalentMedia } from "@/hooks/useTalentMedia";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const TILE_WIDTH = 140;
const TILE_GAP = 16;
const MOBILE_COLS = 3;

const tileClass = "w-[min(140px,calc((100%_-_32px)/3))] flex-shrink-0";
// Quando previewCount è fisso, il tile occupa 1/previewCount del contenitore (senza cap di 140px).
const previewTileClass = (count: number) =>
  `w-[calc((100%_-_${(count - 1) * TILE_GAP}px)/${count})] flex-shrink-0`;

/** Striscia di anteprime con contatore "+ N" e pulsante di apertura della modale. */
const MediaStrip = ({
  items,
  kind,
  emptyLabel,
  buttonLabel,
  onOpen,
  previewCount,
}: {
  items: TalentMedia[];
  kind: "photo" | "video";
  emptyLabel: string;
  buttonLabel: string;
  onOpen: () => void;
  /** Numero fisso di anteprime da mostrare (ignora il calcolo dinamico di capacity). */
  previewCount?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(3);
  const ratio = kind === "photo" ? "aspect-[2/3]" : "aspect-square";
  const activeTileClass = previewCount != null ? previewTileClass(previewCount) : tileClass;

  useEffect(() => {
    if (previewCount != null) return;
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      const tileWidth = Math.min(
        TILE_WIDTH,
        (width - (MOBILE_COLS - 1) * TILE_GAP) / MOBILE_COLS
      );
      const cap = Math.max(1, Math.floor((width + TILE_GAP) / (tileWidth + TILE_GAP)));
      setCapacity(cap);
    };

    const initialTimer = setTimeout(update, 50);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    else window.addEventListener("resize", update);

    return () => {
      clearTimeout(initialTimer);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, [items.length, previewCount]);

  const shownCount =
    previewCount != null
      ? Math.min(previewCount, items.length)
      : items.length <= capacity
        ? items.length
        : Math.max(1, capacity - 1);
  const shown = items.slice(0, shownCount);
  const remaining = items.length - shownCount;

  return (
    <div className="rounded-2xl border border-dashed border-border p-6">
      {items.length > 0 ? (
        <div ref={containerRef} className="flex flex-nowrap gap-4 overflow-hidden">
          {shown.map((item) => (
            <div key={item.id} className={cn("relative", activeTileClass)}>
              {kind === "photo" ? (
                <img
                  src={item.url}
                  alt={getCategoryLabel(item.category)}
                  className={cn("w-full rounded-xl object-cover", ratio)}
                />
              ) : (
                <video
                  src={item.url}
                  poster={item.thumbnail_url ?? undefined}
                  preload="metadata"
                  muted
                  playsInline
                  className={cn("w-full rounded-xl bg-black object-cover", ratio)}
                />
              )}
              <span className="absolute left-1/2 top-2 max-w-[calc(100%-16px)] -translate-x-1/2 truncate rounded-full bg-background px-3 py-1 text-xs text-foreground">
                {getCategoryLabel(item.category)}
              </span>
            </div>
          ))}
          {remaining > 0 && (
            <button
              type="button"
              onClick={onOpen}
              className={cn(
                "flex items-center justify-center rounded-xl bg-muted text-[15px] text-field-label hover:bg-muted/80",
                ratio,
                tileClass
              )}
            >
              + {remaining} {kind === "photo" ? "foto" : "video"}
            </button>
          )}
        </div>
      ) : (
        <p className="py-8 text-center text-[15px] text-field-label">{emptyLabel}</p>
      )}
      <div className="mt-6 flex justify-center">
        <Button type="button" size="lg" iconPosition="left" onClick={onOpen}>
          {kind === "photo" ? <Camera /> : <Clapperboard />}
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export const MediaCard = () => {
  const { data: media } = useTalentMedia();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPhotoCategory = searchParams.get("photos");
  const requestedVideoCategory = searchParams.get("videos");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [videosOpen, setVideosOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState<MediaCategory>("main_photos");
  const [initialVideoCategory, setInitialVideoCategory] = useState<MediaCategory>("intro_video");

  // Deep link da una comunicazione: apre la gestione media sulla categoria indicata
  useEffect(() => {
    if (!requestedPhotoCategory) return;
    if (PHOTO_CATEGORIES.some((c) => c.key === requestedPhotoCategory)) {
      setInitialCategory(requestedPhotoCategory as MediaCategory);
      setGalleryOpen(true);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("photos");
    setSearchParams(next, { replace: true });
  }, [requestedPhotoCategory]);

  useEffect(() => {
    if (!requestedVideoCategory) return;
    if (VIDEO_CATEGORIES.some((c) => c.key === requestedVideoCategory)) {
      setInitialVideoCategory(requestedVideoCategory as MediaCategory);
      setVideosOpen(true);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("videos");
    setSearchParams(next, { replace: true });
  }, [requestedVideoCategory]);

  const photos = (media ?? [])
    .filter((m) => m.media_type === "photo")
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const videos = (media ?? [])
    .filter((m) => m.media_type === "video")
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <SectionCard icon={<Camera strokeWidth={1} />} title="Galleria e media">
      <MediaStrip
        items={photos}
        kind="photo"
        emptyLabel="Non hai ancora caricato nessuna foto."
        buttonLabel="Tutte le foto"
        onOpen={() => setGalleryOpen(true)}
      />

      <MediaStrip
        items={videos}
        kind="video"
        emptyLabel="Non hai ancora caricato nessun video."
        buttonLabel="Tutti i video"
        onOpen={() => setVideosOpen(true)}
        previewCount={3}
      />

      <MediaGalleryModal
        kind="photo"
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        initialCategory={initialCategory}
      />
      <MediaGalleryModal
        kind="video"
        open={videosOpen}
        onOpenChange={setVideosOpen}
        initialCategory={initialVideoCategory}
      />
    </SectionCard>
  );
};
