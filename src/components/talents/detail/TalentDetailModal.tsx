// =============================================================
// TalentDetailModal.tsx — Modale di dettaglio talent a tutta pagina.
// Metà sinistra: carosello foto (fissa). Metà destra: dati in sola
// lettura (scrollabile). Riusabile sia dalla preview del proprio
// profilo (un solo talent) sia da liste di talent (con frecce).
// =============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { MinorBadge } from "@/components/talents/MinorBadge";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalNavBar } from "@/components/ui/modal-nav-bar";
import { useProfileById } from "@/hooks/useProfileById";
import { useTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { useTalentMediaByProfileId } from "@/hooks/useTalentMediaByProfileId";
import { buildTalentDetail, type DetailField } from "./talentDetailData";
import { TalentPdfWizard } from "./TalentPdfWizard";

interface TalentDetailModalProps {
  /** elenco dei talent navigabili: un solo id = variante senza frecce */
  profileIds: string[];
  /** indice del talent mostrato */
  index?: number;
  onIndexChange?: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** etichette brevi per la striscia video */
const VIDEO_LABELS: Record<string, string> = {
  intro_video: "Presentazione",
  showreel: "Showreel",
  other_videos: "Altri video",
};

const getVideoLabel = (category: string) => VIDEO_LABELS[category] ?? "Video";

const LABEL = "text-[13px] leading-tight text-[#686868]";
const VALUE = "mt-[2px] text-[15px] leading-snug text-[#1a1a1a]";

const FieldItem = ({ field }: { field: DetailField }) => (
  <div className={cn("min-w-0", field.wide ? "col-span-full" : "")}>
    <p className={LABEL}>{field.label}</p>
    <p className={cn(VALUE, "whitespace-pre-wrap break-words")}>{field.value}</p>
  </div>
);

export const TalentDetailModal = ({
  profileIds,
  index = 0,
  onIndexChange,
  open,
  onOpenChange,
}: TalentDetailModalProps) => {
  const [localIndex, setLocalIndex] = useState(index);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentIndex = onIndexChange ? index : localIndex;
  const profileId = profileIds[currentIndex] ?? null;

  const { data: profile } = useProfileById(profileId);
  const { data: attrs } = useTalentAttributesByProfileId(profileId);
  const { data: media } = useTalentMediaByProfileId(profileId);

  const photos = useMemo(
    () => (media ?? []).filter((m) => m.media_type === "photo").map((m) => m.url),
    [media]
  );

  const videos = useMemo(
    () => (media ?? []).filter((m) => m.media_type === "video"),
    [media]
  );

  const activeVideo = useMemo(
    () => videos.find((v) => v.id === activeVideoId) ?? null,
    [videos, activeVideoId]
  );

  const { fullName, location, sections } = useMemo(
    () => buildTalentDetail(profile as Record<string, unknown> | null, attrs as Record<string, unknown> | null),
    [profile, attrs]
  );

  const setIndex = (next: number) => {
    if (onIndexChange) onIndexChange(next);
    else setLocalIndex(next);
    setPhotoIndex(0);
    setActiveVideoId(null);
    scrollRef.current?.scrollTo({ top: 0 });
    containerRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    setPhotoIndex(0);
    setActiveVideoId(null);
  }, [profileId]);
  useEffect(() => {
    if (open) setLocalIndex(index);
    else setActiveVideoId(null);
  }, [open, index]);

  const prevPhoto = () => setPhotoIndex((i) => (photos.length ? (i - 1 + photos.length) % photos.length : 0));
  const nextPhoto = () => setPhotoIndex((i) => (photos.length ? (i + 1) % photos.length : 0));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      // con un video aperto le frecce controllano la riproduzione
      if (activeVideo) {
        const el = videoRef.current;
        if (!el) return;
        el.currentTime = Math.max(0, Math.min(el.duration || Infinity, el.currentTime + (e.key === "ArrowRight" ? 5 : -5)));
        return;
      }
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length, activeVideoId]);

  const hasNavigation = profileIds.length > 1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/40 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-300" />
        <DialogPrimitive.Content
          ref={containerRef}
          className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-white outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=open]:ease-out lg:flex-row lg:overflow-hidden motion-reduce:data-[state=closed]:slide-out-to-bottom-0 motion-reduce:data-[state=open]:slide-in-from-bottom-0"
          aria-label={`Dettaglio di ${fullName}`}
        >
          <DialogPrimitive.Title className="sr-only">{fullName}</DialogPrimitive.Title>

          {/* barra di navigazione fissa in alto a destra */}
          <ModalNavBar
            className="fixed right-8 top-8 z-[90] animate-fade-in motion-reduce:animate-none"
            showNavigation={hasNavigation}
            prevDisabled={currentIndex <= 0}
            nextDisabled={currentIndex >= profileIds.length - 1}
            onPrev={() => setIndex(Math.max(0, currentIndex - 1))}
            onNext={() => setIndex(Math.min(profileIds.length - 1, currentIndex + 1))}
            onClose={() => onOpenChange(false)}
            labels={{ prev: "Talent precedente", next: "Talent successivo", close: "Chiudi dettaglio" }}
          />

          {/* METÀ SINISTRA — carosello foto + striscia video, non scorre */}
          <div className="relative flex shrink-0 flex-col items-center justify-center bg-[#f4f0ec] py-10 lg:h-full lg:w-1/2 lg:py-0">
            <div
              className="relative flex flex-col items-center"
              role="group"
              aria-roledescription="carosello"
              aria-label={
                photos.length ? `Foto ${photoIndex + 1} di ${photos.length}` : "Nessuna foto disponibile"
              }
            >
              {activeVideo && (
                <button
                  type="button"
                  onClick={() => setActiveVideoId(null)}
                  className="mb-4 flex items-center gap-2 self-start text-[14px] text-[#1a1a1a] opacity-70 transition-opacity hover:opacity-100 motion-reduce:transition-none"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  Torna alle foto
                </button>
              )}

              <div
                className={cn(
                  "overflow-hidden rounded-lg w-[min(90vw,calc(75vh*2/3))] max-w-[60%] lg:w-[min(40vw,calc(100vh*2/3))]",
                  activeVideo ? "bg-black" : "bg-black/5"
                )}
                style={{ aspectRatio: "2 / 3" }}
              >
                {activeVideo ? (
                  <video
                    ref={videoRef}
                    key={activeVideo.id}
                    src={activeVideo.url}
                    poster={activeVideo.thumbnail_url ?? undefined}
                    controls
                    preload="none"
                    playsInline
                    className="h-full w-full object-contain"
                    aria-label={`${fullName} — ${getVideoLabel(activeVideo.category)}`}
                  />
                ) : photos.length > 0 ? (
                  <div
                    key={profileId ?? "empty"}
                    className="flex h-full w-full motion-reduce:!transition-none"
                    style={{
                      transform: `translateX(-${photoIndex * 100}%)`,
                      transitionProperty: "transform",
                      transitionDuration: "800ms",
                      transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    {photos.map((url, i) => (
                      <img
                        key={url + i}
                        src={url}
                        alt={`${fullName} — foto ${i + 1} di ${photos.length}`}
                        className="h-full w-full shrink-0 object-cover"
                        aria-hidden={i !== photoIndex}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    Nessuna foto disponibile
                  </div>
                )}
              </div>

              {/* indicatori */}
              {!activeVideo && photos.length > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {photos.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setPhotoIndex(i)}
                      aria-label={`Vai alla foto ${i + 1}`}
                      aria-current={i === photoIndex}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-all duration-300 ease-out motion-reduce:transition-none",
                        i === photoIndex ? "scale-125 bg-[#1a1a1a]" : "bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/40"
                      )}
                    />
                  ))}
                </div>
              )}
              <p className="sr-only" aria-live="polite">
                {photos.length ? `Foto ${photoIndex + 1} di ${photos.length}` : ""}
              </p>

              {/* striscia video */}
              {videos.length > 0 && (
                <div className="mt-6 flex items-start justify-center gap-3">
                  {videos.map((v) => {
                    const isActive = v.id === activeVideoId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveVideoId(isActive ? null : v.id)}
                        aria-pressed={isActive}
                        className="group w-[84px] shrink-0 text-left"
                      >
                        <div
                          className={cn(
                            "relative overflow-hidden rounded-lg bg-black/10 ring-offset-2 ring-offset-[#f4f0ec] transition-all duration-200 motion-reduce:transition-none",
                            isActive ? "ring-2 ring-[#1a1a1a]" : "ring-0 group-hover:ring-1 group-hover:ring-[#1a1a1a]/30"
                          )}
                          style={{ aspectRatio: "16 / 10" }}
                        >
                          {v.thumbnail_url && (
                            <img
                              src={v.thumbnail_url}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          )}
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#1a1a1a]">
                              <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </span>
                          </span>
                        </div>
                        <p className="mt-1.5 text-[12px] leading-tight text-[#686868]">
                          {getVideoLabel(v.category)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* frecce foto ai bordi della metà sinistra */}
            {!activeVideo && photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label="Foto precedente"
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[#1a1a1a] opacity-70 transition-opacity duration-200 hover:opacity-100 active:opacity-60 motion-reduce:transition-none lg:left-[54px]"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label="Foto successiva"
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[#1a1a1a] opacity-70 transition-opacity duration-200 hover:opacity-100 active:opacity-60 motion-reduce:transition-none lg:right-[54px]"
                >
                  <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          {/* METÀ DESTRA — dettagli, scorre */}
          <div ref={scrollRef} className="min-w-0 w-full flex-1 bg-white lg:h-full lg:w-1/2 lg:shrink-0 lg:overflow-y-auto">
            <div className="min-w-0 w-full px-6 pb-24 pt-24 lg:pl-[100px] lg:pr-[96px] lg:pt-[147px]">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                iconPosition="left"
                onClick={() => setWizardOpen(true)}
                className="gap-[10px] text-[15px]"
              >
                <Download className="h-5 w-5" strokeWidth={1.5} />
                Scarica PDF
              </Button>

              <h2 className="mt-8 font-display text-4xl uppercase leading-tight text-[#1a1a1a]">
                {fullName}
              </h2>
              <MinorBadge
                birthDate={(profile as { birth_date?: string | null } | null)?.birth_date}
                className="mt-3"
              />
              {location && <p className="mt-2 text-[15px] text-[#686868]">{location}</p>}

              {sections.map((section) => (
                <section key={section.key}>
                  {section.title && (
                    <>
                      <div className="my-12 h-px w-full bg-divider" />
                      <div className="flex items-center gap-4">
                        {section.icon && (
                          <section.icon className="h-8 w-8 text-[#1a1a1a]" strokeWidth={1} />
                        )}
                        <h3 className="font-display text-base uppercase text-[#1a1a1a]">
                          {section.title}
                        </h3>
                      </div>
                    </>
                  )}

                  {section.pills && section.pills.length > 0 && (
                    <div className={cn("flex flex-wrap gap-2", section.title ? "mt-12" : "mt-8")}>
                      {section.pills.map((pill) => (
                        <span
                          key={pill}
                          className="rounded-full border border-border bg-background px-4 py-2 text-[14px] text-[#1a1a1a]"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}

                  {section.fields.length > 0 && (
                    <div
                      className={cn(
                        "min-w-0 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2",
                        section.title ? "mt-12" : "mt-8"
                      )}
                    >
                      {section.fields.map((field) => (
                        <FieldItem key={section.key + field.label} field={field} />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      <TalentPdfWizard
        profileId={profileId}
        talentName={fullName}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
      />
    </DialogPrimitive.Root>
  );
};

export default TalentDetailModal;
