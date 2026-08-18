import { useRef, useState } from "react";
import { Camera, Clapperboard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTalentMedia, useUploadMedia } from "@/hooks/useTalentMedia";
import { MEDIA_CATEGORIES, getCategoryLabel } from "@/lib/mediaCategories";
import type { MediaCategory } from "@/lib/mediaCategories";
import { SectionCard } from "@/components/profile/fields/FormFields";

const PHOTO_CATEGORIES = MEDIA_CATEGORIES.filter((c) => c.type === "photo");

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
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-5 text-[15px] text-foreground disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {existing ? "Sostituisci il video" : buttonLabel}
      </button>
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

export const MediaCard = () => {
  const { data: media } = useTalentMedia();
  const photos = (media ?? []).filter((m) => m.media_type === "photo");

  const previews = PHOTO_CATEGORIES.map((category) => ({
    category: category.key as string,
    photo: photos.find((p) => p.category === category.key),
  })).filter((p) => p.photo);

  const shown = previews.slice(0, 4);
  const remaining = photos.length - shown.length;

  return (
    <SectionCard icon={<Camera strokeWidth={1} />} title="Galleria e media">
      <div className="rounded-2xl border border-dashed border-border p-6">
        {shown.length > 0 ? (
          <div className="flex flex-wrap items-start justify-center gap-4">
            {shown.map(({ category, photo }) => (
              <div key={category} className="relative w-[140px]">
                <img
                  src={photo!.url}
                  alt={getCategoryLabel(category)}
                  className="aspect-[2/3] w-full rounded-xl object-cover"
                />
                <span className="absolute left-1/2 top-2 max-w-[124px] -translate-x-1/2 truncate rounded-full bg-background px-3 py-1 text-xs text-foreground">
                  {getCategoryLabel(category)}
                </span>
              </div>
            ))}
            {remaining > 0 && (
              <div className="flex aspect-[2/3] w-[140px] items-center justify-center rounded-xl bg-muted text-[15px] text-field-label">
                + {remaining} foto
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-[15px] text-field-label">
            Non hai ancora caricato nessuna foto.
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] text-primary-foreground"
          >
            <Camera className="h-5 w-5" />
            Tutte le foto
          </button>
        </div>
      </div>

      <VideoBlock category="intro_video" title="Video di presentazione" buttonLabel="Carica un video" />
      <VideoBlock category="showreel" title="Showreel Professionale" buttonLabel="Carica un video" />
    </SectionCard>
  );
};
