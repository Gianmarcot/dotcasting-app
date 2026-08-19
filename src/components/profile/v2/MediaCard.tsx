import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Camera, Clapperboard, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTalentMedia, useUploadMedia } from "@/hooks/useTalentMedia";
import { MEDIA_CATEGORIES, getCategoryLabel } from "@/lib/mediaCategories";
import type { MediaCategory } from "@/lib/mediaCategories";
import { SectionCard } from "@/components/profile/fields/FormFields";
import { PhotoGalleryModal } from "@/components/profile/v2/photos/PhotoGalleryModal";

const VIDEO_HELP =
  "Formati accettati MP4, MOV o WEBM, massimo 100MB. Il video resta visibile solo a te e allo staff dell'agenzia fino a quando non viene condiviso in una selezione.";

const VideoBlock = ({
  category,
  title,
  buttonLabel,
}: {
  category: MediaCategory;
  title: string;
  buttonLabel: string;
}) => {
  const { data: media } = useTalentMedia();
  const upload = useUploadMedia();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const existing = (media ?? []).find((m) => m.category === category);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      await upload.mutateAsync({ file, mediaType: "video", category });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore durante il caricamento");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <Clapperboard className="mx-auto h-10 w-10 text-field-label" strokeWidth={1} />
      <p className="mt-4 text-[15px] font-medium text-group-label">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-5 text-field-label">{VIDEO_HELP}</p>
      {existing && (
        <video
          src={existing.url}
          controls
          className="mx-auto mt-6 max-h-64 w-full max-w-md rounded-2xl bg-black"
        />
      )}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-6"
      >
        {busy ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Upload />
        )}
        {existing ? "Sostituisci il video" : buttonLabel}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
};

const TILE_WIDTH = 140;
const TILE_GAP = 16;

export const MediaCard = () => {
  const { data: media } = useTalentMedia();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(3);

  const photos = (media ?? [])
    .filter((m) => m.media_type === "photo")
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      // Use a responsive tile width: 3 tiles per row on narrow containers,
      // fixed 140px tiles on wider containers (matching the CSS class below).
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
  }, [photos.length]);

  const shownCount = photos.length <= capacity ? photos.length : Math.max(1, capacity - 1);
  const shownPhotos = photos.slice(0, shownCount);
  const remaining = photos.length - shownCount;

  const tileClass = "w-[min(140px,calc((100%_-_32px)/3))] flex-shrink-0";

  return (
    <SectionCard icon={<Camera strokeWidth={1} />} title="Galleria e media">
      <div className="rounded-2xl border border-dashed border-border p-6">
        {photos.length > 0 ? (
          <div ref={containerRef} className="flex flex-nowrap gap-4 overflow-hidden">
            {shownPhotos.map((photo) => (
              <div key={photo.id} className={cn("relative", tileClass)}>
                <img
                  src={photo.url}
                  alt={getCategoryLabel(photo.category)}
                  className="aspect-[2/3] w-full rounded-xl object-cover"
                />
                <span className="absolute left-1/2 top-2 max-w-[calc(100%-16px)] -translate-x-1/2 truncate rounded-full bg-background px-3 py-1 text-xs text-foreground">
                  {getCategoryLabel(photo.category)}
                </span>
              </div>
            ))}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className={cn(
                  "flex aspect-[2/3] items-center justify-center rounded-xl bg-muted text-[15px] text-field-label hover:bg-muted/80",
                  tileClass
                )}
              >
                + {remaining} foto
              </button>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-[15px] text-field-label">
            Non hai ancora caricato nessuna foto.
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <Button type="button" size="lg" iconPosition="left" onClick={() => setGalleryOpen(true)}>
            <Camera />
            Tutte le foto
          </Button>
        </div>
      </div>

      <VideoBlock category="intro_video" title="Video di presentazione" buttonLabel="Carica un video" />
      <VideoBlock category="showreel" title="Showreel Professionale" buttonLabel="Carica un video" />

      <PhotoGalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} initialCategory="main_photos" />
    </SectionCard>
  );
};
