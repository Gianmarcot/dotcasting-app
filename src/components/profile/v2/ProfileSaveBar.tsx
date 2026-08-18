import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileForm } from "./ProfileFormContext";

export const ProfileSaveBar = () => {
  const { isDirty, dirtyCount, isSaving, save, reset } = useProfileForm();

  return (
    <div
      aria-hidden={!isDirty}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition-all duration-300 sm:px-6 sm:pb-6",
        isDirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-[1040px] flex-col gap-3 rounded-3xl bg-profile-card px-5 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-6",
          isDirty && "pointer-events-auto"
        )}
      >
        <p className="text-[15px] text-foreground">
          {dirtyCount === 1
            ? "Hai 1 modifica non salvata"
            : `Hai ${dirtyCount} modifiche non salvate`}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={isSaving}
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-border bg-background/30 px-5 text-[15px] text-foreground disabled:opacity-60 sm:flex-none"
          >
            Annulla modifiche
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 text-[15px] text-primary-foreground disabled:opacity-60 sm:flex-none"
          >
            {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};
