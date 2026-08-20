import { useRef } from "react";
import { Camera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Stack fotografico: nel codice esisteva solo come markup inline dentro
 * HeadCard (nessun componente condiviso stile Finder riutilizzabile), quindi
 * qui viene ricostruito lo stesso pattern a due card sfalsate.
 */
export const PhotoStep = ({
  previewUrl,
  onSelectFile,
  error,
}: {
  previewUrl: string | null;
  onSelectFile: (file: File) => void;
  error?: string | null;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[300px] w-[228px]">
        <div className="absolute inset-0 -rotate-6 rounded-2xl bg-field" />
        <div className="absolute inset-0 rotate-3 overflow-hidden rounded-2xl bg-field">
          {previewUrl ? (
            <img src={previewUrl} alt="Foto profilo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-field-label">
              <ImageIcon strokeWidth={1} className="h-12 w-12" />
            </div>
          )}
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <Camera />
          Foto profilo
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelectFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-10 text-xs text-destructive">{error}</p>}
    </div>
  );
};
