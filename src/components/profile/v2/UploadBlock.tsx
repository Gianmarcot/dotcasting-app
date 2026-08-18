import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const TALENT_DOCS_BUCKET = "talent-documents";

/** Private file upload row: label + description on the left, action button on the right. */
export const UploadBlock = ({
  label,
  description,
  buttonLabel,
  accept,
  fileNamePrefix,
  currentPath,
  onUploaded,
}: {
  label: string;
  description: string;
  buttonLabel: string;
  accept: string;
  fileNamePrefix: string;
  currentPath: string | null;
  onUploaded: (path: string | null) => void;
}) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Il file non può superare i 10MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${user.id}/${fileNamePrefix}.${ext}`;
      const { error } = await supabase.storage
        .from(TALENT_DOCS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      onUploaded(path);
      toast.success("File caricato!");
    } catch {
      toast.error("Errore durante il caricamento");
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = async () => {
    if (!currentPath) return;
    const { data, error } = await supabase.storage
      .from(TALENT_DOCS_BUCKET)
      .createSignedUrl(currentPath, 60);
    if (error || !data) {
      toast.error("Impossibile aprire il file");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleRemove = async () => {
    if (!currentPath) return;
    setBusy(true);
    try {
      await supabase.storage.from(TALENT_DOCS_BUCKET).remove([currentPath]);
      onUploaded(null);
      toast.success("File rimosso");
    } catch {
      toast.error("Errore durante la rimozione");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="sm:max-w-[560px]">
        <p className="text-[15px] font-medium leading-5 text-group-label">{label}</p>
        <p className="mt-2 text-sm leading-5 text-field-label">{description}</p>
        {currentPath && (
          <button
            type="button"
            onClick={handleOpen}
            className="mt-2 text-sm underline underline-offset-4 text-foreground"
          >
            Visualizza il file caricato
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {currentPath ? "Sostituisci" : buttonLabel}
        </Button>
        {currentPath && (
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            disabled={busy}
            onClick={handleRemove}
            aria-label="Rimuovi file"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={handleSelect} className="hidden" />
      </div>
    </div>
  );
};
