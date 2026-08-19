import { useState, useRef, useCallback, useMemo } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RATIO_LABEL,
  RATIO_VALUE,
  type CropRatio,
  type CropRect,
} from "@/lib/media/crops";

export interface CropResult {
  ratio: CropRatio;
  blob: Blob;
  rect: CropRect;
}

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  /** Proporzioni disponibili. Le tab compaiono solo con più di una. */
  ratios?: CropRatio[];
  /** Ritagli già salvati, per riaprire nella stessa posizione (percentuali). */
  initialRects?: Partial<Record<CropRatio, CropRect>>;
  /** Callback legacy per l'uso a singola proporzione. */
  onCropComplete?: (croppedBlob: Blob) => void;
  /** Callback multi-proporzione: riceve solo i ritagli confermati. */
  onSave?: (results: CropResult[]) => void;
  isSaving?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.max(1, Math.round(crop.width * scaleX));
  canvas.height = Math.max(1, Math.round(crop.height * scaleY));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      },
      "image/jpeg",
      0.92
    );
  });
}

const toRect = (crop: PixelCrop, image: HTMLImageElement): CropRect => ({
  x: (crop.x / image.width) * 100,
  y: (crop.y / image.height) * 100,
  w: (crop.width / image.width) * 100,
  h: (crop.height / image.height) * 100,
});

const fromRect = (rect: CropRect): Crop => ({
  unit: "%",
  x: rect.x,
  y: rect.y,
  width: rect.w,
  height: rect.h,
});

export const ImageCropModal = ({
  open,
  onClose,
  imageSrc,
  ratios,
  initialRects,
  onCropComplete,
  onSave,
  isSaving = false,
}: ImageCropModalProps) => {
  const ratioList = useMemo<CropRatio[]>(
    () => (ratios && ratios.length ? ratios : ["2:3"]),
    [ratios]
  );
  const [active, setActive] = useState<CropRatio>(ratioList[0]);
  const [crops, setCrops] = useState<Partial<Record<CropRatio, Crop>>>({});
  const [completed, setCompleted] = useState<Partial<Record<CropRatio, PixelCrop>>>({});
  const [touched, setTouched] = useState<Partial<Record<CropRatio, boolean>>>({});
  const imgRef = useRef<HTMLImageElement>(null);

  const initFor = useCallback(
    (ratio: CropRatio, width: number, height: number): Crop => {
      const saved = initialRects?.[ratio];
      if (saved) return fromRect(saved);
      return centerAspectCrop(width, height, RATIO_VALUE[ratio]);
    },
    [initialRects]
  );

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrops((prev) => {
        const next = { ...prev };
        ratioList.forEach((r) => {
          if (!next[r]) next[r] = initFor(r, width, height);
        });
        return next;
      });
    },
    [ratioList, initFor]
  );

  const handleSave = async () => {
    const image = imgRef.current;
    if (!image) return;

    const results: CropResult[] = [];
    for (const ratio of ratioList) {
      const pixel = completed[ratio];
      if (!pixel || !pixel.width || !pixel.height) continue;
      // In modalità multi, salviamo solo le proporzioni effettivamente toccate
      // oppure quelle senza un ritaglio precedente.
      if (ratioList.length > 1 && !touched[ratio] && initialRects?.[ratio]) continue;
      const blob = await getCroppedImg(image, pixel);
      results.push({ ratio, blob, rect: toRect(pixel, image) });
    }

    if (onSave) {
      onSave(results);
      return;
    }
    const first = results[0];
    if (first && onCropComplete) onCropComplete(first.blob);
  };

  const canSave = ratioList.some((r) => {
    const pixel = completed[r];
    return !!pixel?.width && !!pixel?.height;
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {ratioList.length > 1 ? "Ritaglia immagine" : `Ritaglia immagine (${ratioList[0]})`}
          </DialogTitle>
        </DialogHeader>

        {ratioList.length > 1 && (
          <div className="flex gap-2">
            {ratioList.map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setActive(ratio)}
                aria-pressed={ratio === active}
                className={cn(
                  "rounded-full px-4 py-2 text-[14px] transition-colors",
                  ratio === active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/30 text-foreground ring-1 ring-inset ring-border hover:bg-[#f4f0ec]"
                )}
              >
                {RATIO_LABEL[ratio]}
              </button>
            ))}
          </div>
        )}

        <div className="flex max-h-[60vh] items-center justify-center overflow-auto">
          <ReactCrop
            key={active}
            crop={crops[active]}
            onChange={(c) => {
              setCrops((prev) => ({ ...prev, [active]: c }));
              setTouched((prev) => ({ ...prev, [active]: true }));
            }}
            onComplete={(c) => setCompleted((prev) => ({ ...prev, [active]: c }))}
            aspect={RATIO_VALUE[active]}
            minWidth={50}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              crossOrigin="anonymous"
              alt="Crop"
              onLoad={onImageLoad}
              className="max-h-[55vh] w-auto"
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              "Conferma ritaglio"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
