import { useEffect, useState } from "react";
import { Camera, Clapperboard, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTalentMedia } from "@/hooks/useTalentMedia";
import {
  PHOTO_CATEGORIES,
  VIDEO_CATEGORIES,
  getCategoryMin,
} from "@/lib/mediaCategories";
import {
  PROFILE_PHOTO_CATEGORY,
  visiblePhotoCategories,
  visibleVideoCategories,
} from "@/lib/roleVisibility";
import type { MediaCategory } from "@/lib/mediaCategories";
import { SectionCard } from "@/components/profile/fields/FormFields";
import { MediaGalleryModal } from "@/components/profile/v2/photos/MediaGalleryModal";
import type { TalentMedia } from "@/hooks/useTalentMedia";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProfileForm } from "./ProfileFormContext";

/** Somma dei minimi richiesti e di quanti sono effettivamente coperti. */
const requiredProgress = (items: TalentMedia[], keys: string[]) => {
  let required = 0;
  let covered = 0;
  keys.forEach((key) => {
    const min = getCategoryMin(key);
    if (!min) return;
    required += min;
    covered += Math.min(min, items.filter((i) => i.category === key).length);
  });
  return { required, covered };
};

/** Area foto o video: conteggio, preview a pila e pulsante di apertura della modale. */
const MediaArea = ({
  items,
  keys,
  kind,
  emptyTitle,
  emptyText,
  buttonLabel,
  onOpen,
}: {
  items: TalentMedia[];
  keys: string[];
  kind: "photo" | "video";
  emptyTitle: string;
  emptyText: string;
  buttonLabel: string;
  onOpen: () => void;
}) => {
  const Icon = kind === "photo" ? Camera : Clapperboard;
  const noun = kind === "photo" ? "foto" : "video";
  const { required, covered } = requiredProgress(items, keys);
  const missing = required > 0 && covered < required;
  const cover =
    (kind === "photo" ? items.find((i) => i.category === PROFILE_PHOTO_CATEGORY) : undefined) ??
    items[items.length - 1];
  const ratio = kind === "photo" ? "h-[252px] w-[168px]" : "h-[168px] w-[168px]";

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-8 text-center">
        <Icon strokeWidth={1} className="h-8 w-8 text-field-label" />
        <div className="space-y-1">
          <p className="font-display text-base uppercase text-foreground">{emptyTitle}</p>
          <p className="text-[15px] leading-snug text-field-label">{emptyText}</p>
        </div>
        <Button type="button" variant="secondary" size="lg" iconPosition="left" onClick={onOpen}>
          <Upload />
          Carica {noun}
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex flex-1 cursor-pointer flex-col items-center gap-8 rounded-2xl border border-dashed border-border p-8 text-center"
    >
      <p className="text-[15px] text-field-label">
        {missing ? (
          <>
            <span className="text-warning">
              {covered} di {required}
            </span>{" "}
            {noun} richieste
          </>
        ) : (
          <>
            {items.length} {noun}
          </>
        )}
      </p>

      <div className={cn("relative", ratio)}>
        <div className="absolute inset-0 -rotate-6 rounded-2xl bg-field" />
        <div className="absolute inset-0 rotate-3 rounded-2xl bg-field/80" />
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-muted">
          {kind === "photo" ? (
            <img src={latest.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <video
              src={latest.url}
              poster={latest.thumbnail_url ?? undefined}
              preload="metadata"
              muted
              playsInline
              className="h-full w-full bg-black object-cover"
            />
          )}
        </div>
      </div>

      <Button type="button" size="lg" iconPosition="left" onClick={onOpen}>
        <Icon />
        {buttonLabel}
      </Button>
    </div>
  );
};

export const MediaCard = () => {
  const { data: media } = useTalentMedia();
  const { arr, bool } = useProfileForm();
  const roles = arr("p", "talent_categories");
  const hasBand = bool("p", "has_band");
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPhotoCategory = searchParams.get("photos");
  const requestedVideoCategory = searchParams.get("videos");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [videosOpen, setVideosOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState<MediaCategory>(PROFILE_PHOTO_CATEGORY);
  const [initialVideoCategory, setInitialVideoCategory] = useState<MediaCategory>("intro_video");

  const photoKeys = visiblePhotoCategories(roles, { hasBand });
  const videoKeys = visibleVideoCategories(roles, { hasBand });

  // Deep link da una comunicazione: apre la gestione media sulla categoria indicata
  useEffect(() => {
    if (!requestedPhotoCategory) return;
    if (
      PHOTO_CATEGORIES.some((c) => c.key === requestedPhotoCategory) &&
      photoKeys.includes(requestedPhotoCategory)
    ) {
      setInitialCategory(requestedPhotoCategory as MediaCategory);
      setGalleryOpen(true);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("photos");
    setSearchParams(next, { replace: true });
  }, [requestedPhotoCategory]);

  useEffect(() => {
    if (!requestedVideoCategory) return;
    if (
      VIDEO_CATEGORIES.some((c) => c.key === requestedVideoCategory) &&
      videoKeys.includes(requestedVideoCategory)
    ) {
      setInitialVideoCategory(requestedVideoCategory as MediaCategory);
      setVideosOpen(true);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("videos");
    setSearchParams(next, { replace: true });
  }, [requestedVideoCategory]);

  const sorted = (list: TalentMedia[]) =>
    [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const all = media ?? [];
  const photos = sorted(
    all.filter((m) => m.media_type === "photo" && photoKeys.includes(m.category))
  );
  const videos = sorted(
    all.filter((m) => m.media_type === "video" && videoKeys.includes(m.category))
  );

  const openPhotos = () => {
    setInitialCategory(
      (photoKeys.includes(PROFILE_PHOTO_CATEGORY)
        ? PROFILE_PHOTO_CATEGORY
        : photoKeys[0]) as MediaCategory
    );
    setGalleryOpen(true);
  };

  return (
    <SectionCard icon={<Camera strokeWidth={1} />} title="Galleria e media">
      <div className="flex flex-col gap-6 md:flex-row">
        {photoKeys.length > 0 && (
          <MediaArea
            items={photos}
            keys={photoKeys}
            kind="photo"
            emptyTitle="Nessuna foto"
            emptyText="Carica le tue foto per far conoscere il tuo aspetto attuale."
            buttonLabel="Tutte le foto"
            onOpen={openPhotos}
          />
        )}

        {videoKeys.length > 0 && (
          <MediaArea
            items={videos}
            keys={videoKeys}
            kind="video"
            emptyTitle="Nessun video"
            emptyText="Carica un video di presentazione o il tuo showreel."
            buttonLabel="Tutti i video"
            onOpen={() => setVideosOpen(true)}
          />
        )}
      </div>

      <MediaGalleryModal
        kind="photo"
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        initialCategory={initialCategory}
      />
      {videoKeys.length > 0 && (
        <MediaGalleryModal
          kind="video"
          open={videosOpen}
          onOpenChange={setVideosOpen}
          initialCategory={initialVideoCategory}
        />
      )}
    </SectionCard>
  );
};
