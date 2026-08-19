import { useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Crop as CropIcon,
  Loader2,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { ModalNavBar } from "@/components/ui/modal-nav-bar";
import { ImageCropModal } from "@/components/profile/ImageCropModal";
import { cn } from "@/lib/utils";
import { PHOTO_CATEGORIES, getCategoryMin } from "@/lib/mediaCategories";
import type { MediaCategory } from "@/lib/mediaCategories";
import {
  useDeleteMedia,
  useSaveMediaCrops,
  useTalentMedia,
  useUpdateMediaOrder,
  useUploadMedia,
  type TalentMedia,
} from "@/hooks/useTalentMedia";
import { useProfileForm } from "../ProfileFormContext";
import {
  getCropRect,
  getCropUrl,
  getOriginalUrl,
  hasCrop,
  type CropRatio,
} from "@/lib/media/crops";
import type { CropResult } from "@/components/profile/ImageCropModal";

const UNDO_MS = 6000;

interface PhotoGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: MediaCategory;
}

/* --------------------------------- Tile ---------------------------------- */

const PhotoTile = ({
  media,
  index,
  total,
  showBadges,
  isProfilePhoto,
  busy,
  onCrop,
  onDelete,
  onMove,
}: {
  media: TalentMedia;
  index: number;
  total: number;
  showBadges: boolean;
  isProfilePhoto: boolean;
  busy: boolean;
  onCrop: () => void;
  onDelete: () => void;
  onMove: (delta: -1 | 1) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: media.id,
  });

  const badge = showBadges && index === 0 ? "Foto profilo" : showBadges && index === 1 ? "Copertina" : null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted",
        isDragging && "z-10 opacity-70 ring-2 ring-primary"
      )}
      {...attributes}
      {...listeners}
    >
      <img src={media.url} alt="" className="h-full w-full select-none object-cover" draggable={false} />

      {(badge || isProfilePhoto) && (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-wrap items-center gap-1">
          {badge && (
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs text-foreground">
              {badge}
            </span>
          )}
          {isProfilePhoto &&
            (["2:3", "1:1"] as CropRatio[]).map((ratio) => (
              <span
                key={ratio}
                className={cn(
                  "rounded-full px-2 py-1 text-[11px]",
                  hasCrop(media, ratio)
                    ? "bg-foreground/85 text-background"
                    : "bg-background/70 text-field-label"
                )}
              >
                {ratio}
              </span>
            ))}
        </div>
      )}

      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </div>
      )}

      {/* Controlli: sempre visibili su touch, in hover su desktop */}
      <div className="absolute inset-x-2 top-2 flex justify-between opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Sposta indietro"
            disabled={index === 0}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onMove(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Sposta avanti"
            disabled={index === total - 1}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onMove(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground disabled:opacity-40"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Modifica ritaglio"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onCrop}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground"
          >
            <CropIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Elimina foto"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-[#a30a2b]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- Modal --------------------------------- */

export const PhotoGalleryModal = ({ open, onOpenChange, initialCategory }: PhotoGalleryModalProps) => {
  const { data: media } = useTalentMedia();
  const { profileRow, saveNow } = useProfileForm();
  const upload = useUploadMedia();
  const remove = useDeleteMedia();
  const saveCrops = useSaveMediaCrops();
  const reorder = useUpdateMediaOrder();

  const [category, setCategory] = useState<MediaCategory>(initialCategory ?? "main_photos");
  const [order, setOrder] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const [cropTarget, setCropTarget] = useState<TalentMedia | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (open && initialCategory) setCategory(initialCategory);
  }, [open, initialCategory]);

  const photos = useMemo(() => {
    const list = (media ?? []).filter(
      (m) => m.media_type === "photo" && m.category === category && !pendingDelete.includes(m.id)
    );
    const sorted = [...list].sort((a, b) => a.sort_order - b.sort_order);
    if (order.length === 0) return sorted;
    const byId = new Map(sorted.map((m) => [m.id, m]));
    const ordered = order.map((id) => byId.get(id)).filter(Boolean) as TalentMedia[];
    const extra = sorted.filter((m) => !order.includes(m.id));
    return [...ordered, ...extra];
  }, [media, category, order, pendingDelete]);

  const countFor = (key: string) =>
    (media ?? []).filter(
      (m) => m.media_type === "photo" && m.category === key && !pendingDelete.includes(m.id)
    ).length;

  const firstOf = (key: string) =>
    (media ?? [])
      .filter((m) => m.media_type === "photo" && m.category === key && !pendingDelete.includes(m.id))
      .sort((a, b) => a.sort_order - b.sort_order)[0];

  const min = getCategoryMin(category);
  const belowMin = min !== undefined && photos.length < min;

  // La prima foto principale è anche la foto profilo del talent.
  const mainFirst = useMemo(() => {
    if (category === "main_photos") return photos[0];
    return firstOf("main_photos");
  }, [photos, category, media, pendingDelete]);

  // L'avatar usa il ritaglio 1:1 quando presente, altrimenti la foto principale.
  const mainFirstUrl = mainFirst ? getCropUrl(mainFirst, "1:1") : undefined;

  // Ogni URL viene sincronizzato una sola volta: senza questa guardia
  // l'invalidazione della query profilo rilancerebbe l'effetto all'infinito.
  const syncedPhotoUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !mainFirstUrl || !profileRow) return;
    if (profileRow.profile_photo_url === mainFirstUrl) {
      syncedPhotoUrl.current = mainFirstUrl;
      return;
    }
    if (syncedPhotoUrl.current === mainFirstUrl) return;
    syncedPhotoUrl.current = mainFirstUrl;
    saveNow("p", { profile_photo_url: mainFirstUrl });
  }, [open, mainFirstUrl, profileRow?.profile_photo_url, saveNow]);


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const persistOrder = (ids: string[]) => {
    setOrder(ids);
    reorder.mutate(ids.map((id, i) => ({ id, sort_order: i })), {
      onError: () => {
        setOrder([]);
        toast.error("Non è stato possibile salvare il nuovo ordine");
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = photos.map((p) => p.id);
    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    persistOrder(next);
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const ids = photos.map((p) => p.id);
    persistOrder(arrayMove(ids, index, target));
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    const list = files;
    setUploading(list.length);
    for (const file of list) {
      try {
        await upload.mutateAsync({ file, mediaType: "photo", category });
      } catch {
        /* toast gestito dal hook */
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
    setOrder([]);
  };

  const handleDelete = (item: TalentMedia) => {
    setPendingDelete((prev) => [...prev, item.id]);
    timers.current[item.id] = setTimeout(() => {
      remove.mutate(item, {
        onError: () => setPendingDelete((prev) => prev.filter((id) => id !== item.id)),
      });
      delete timers.current[item.id];
    }, UNDO_MS);

    toast("Foto eliminata", {
      description: "Puoi annullare per qualche secondo.",
      duration: UNDO_MS,
      action: {
        label: "Annulla",
        onClick: () => {
          clearTimeout(timers.current[item.id]);
          delete timers.current[item.id];
          setPendingDelete((prev) => prev.filter((id) => id !== item.id));
        },
      },
    });
  };

  const handleCropSave = async (results: CropResult[]) => {
    if (!cropTarget || !profileRow?.user_id) return;
    if (!results.length) {
      setCropTarget(null);
      return;
    }
    setSavingId(cropTarget.id);
    try {
      await saveCrops.mutateAsync({
        media: cropTarget,
        userId: profileRow.user_id,
        crops: results,
      });
      setCropTarget(null);
    } finally {
      setSavingId(null);
    }
  };

  /** Solo la prima foto principale (che fa da foto profilo) ha anche il ritaglio 1:1. */
  const isProfilePhoto = (item: TalentMedia) =>
    category === "main_photos" && photos[0]?.id === item.id;

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 overflow-y-auto bg-card px-5 py-8 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-4 sm:px-10"
          aria-describedby={undefined}
        >
          <ModalNavBar
            onClose={() => onOpenChange(false)}
            className="fixed right-8 top-8 z-10"
          />

          <div className="mx-auto mt-16 w-full max-w-[1400px] pr-20">
            <DialogPrimitive.Title className="font-display text-2xl uppercase tracking-wide text-foreground">
              Fotografie
            </DialogPrimitive.Title>
          </div>

          <div className="mx-auto mt-10 w-full max-w-[1400px]">
            {/* Selettore categorie */}
            <div className="-mx-2 overflow-x-auto px-2 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]">
              <div className="flex min-w-max items-start gap-2 pb-2">
                {PHOTO_CATEGORIES.map((cat) => {
                  const active = cat.key === category;
                  const first = firstOf(cat.key);
                  const count = countFor(cat.key);
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setCategory(cat.key as MediaCategory);
                        setOrder([]);
                      }}
                      aria-pressed={active}
                      className={cn(
                        "flex w-[180px] shrink-0 flex-col items-center justify-start rounded-2xl p-4 text-center transition-colors",
                        active ? "bg-[#f4f0ec]" : "hover:bg-[#f4f0ec]/60"
                      )}
                    >
                      {first ? (
                        <img
                          src={first.url}
                          alt=""
                          className="mx-auto block aspect-[2/3] w-[86px] rounded-xl object-cover"
                        />
                      ) : (
                        <span className="mx-auto flex aspect-[2/3] w-[86px] items-center justify-center rounded-xl border border-dashed border-border">
                          <Camera className="h-5 w-5 text-field-label" strokeWidth={1.5} />
                        </span>
                      )}
                      <span
                        className={cn(
                          "mt-3 block text-[15px] leading-5",
                          active ? "font-medium text-foreground underline" : "text-group-label"
                        )}
                      >
                        {cat.label}
                      </span>
                      <span className="mt-1 block text-sm text-field-label">
                        {count} {count === 1 ? "foto" : "foto"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Requisito minimo + aggiungi */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-6">
                {belowMin && (
                  <p className="flex items-center gap-2 text-[15px] text-[#a30a2b]">
                    <TriangleAlert className="h-5 w-5" strokeWidth={1.5} />
                    Inserisci minimo {min} foto ({photos.length}/{min}).
                  </p>
                )}
              </div>
              <Button
                type="button"
                size="lg"
                onClick={() => fileRef.current?.click()}
                disabled={uploading > 0}
                className="w-full sm:w-auto"
              >
                {uploading > 0 ? <Loader2 className="animate-spin" /> : <Plus />}
                Aggiungi foto
              </Button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                handleFiles(files);
              }}
            />

            {/* Griglia */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className="mt-8 grid grid-cols-2 gap-4 pb-16 md:grid-cols-3 xl:grid-cols-4">
                  {photos.map((item, index) => (
                    <PhotoTile
                      key={item.id}
                      media={item}
                      index={index}
                      total={photos.length}
                      showBadges={category === "main_photos"}
                      isProfilePhoto={isProfilePhoto(item)}
                      busy={savingId === item.id}
                      onCrop={() => setCropTarget(item)}
                      onDelete={() => handleDelete(item)}
                      onMove={(delta) => move(index, delta)}
                    />
                  ))}

                  {Array.from({ length: uploading }).map((_, i) => (
                    <div
                      key={`up-${i}`}
                      className="flex aspect-[2/3] items-center justify-center rounded-2xl bg-muted"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-field-label" />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex aspect-[2/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-foreground transition-colors hover:bg-[#f4f0ec]"
                  >
                    <Plus className="h-6 w-6" strokeWidth={1.5} />
                    <span className="text-[15px]">
                      {photos.length === 0 ? "Carica le tue prime foto" : "Aggiungi foto"}
                    </span>
                  </button>
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {cropTarget && (
            <ImageCropModal
              open
              imageSrc={getOriginalUrl(cropTarget)}
              ratios={isProfilePhoto(cropTarget) ? ["2:3", "1:1"] : ["2:3"]}
              initialRects={{
                "2:3": getCropRect(cropTarget, "2:3"),
                "1:1": getCropRect(cropTarget, "1:1"),
              }}
              isSaving={savingId === cropTarget.id}
              onClose={() => setCropTarget(null)}
              onSave={handleCropSave}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default PhotoGalleryModal;
