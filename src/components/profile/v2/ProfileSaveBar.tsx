import { Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useProfileForm } from "./ProfileFormContext";

export const ProfileSaveBar = () => {
  const { isDirty, dirtyCount, isSaving, save, reset } = useProfileForm();

  return (
    <div
      aria-hidden={!isDirty}
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300 md:left-[calc(50%+8rem)]",
        isDirty ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
    >
      <div
        className={cn(
          "flex h-[80px] w-[min(560px,calc(100vw-2rem))] items-center justify-between gap-4 rounded-full bg-[#1A1A1A] pl-6 pr-4 shadow-2xl sm:gap-6 sm:pl-8",
          isDirty && "pointer-events-auto"
        )}
      >
        <div className="flex min-w-0 items-center gap-3 text-white">
          <Pencil className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="truncate text-base">
            <span className="font-bold">{dirtyCount}</span>
            <span className="hidden opacity-70 sm:inline">
              {dirtyCount === 1 ? " modifica non salvata" : " modifiche non salvate"}
            </span>
            <span className="opacity-70 sm:hidden">
              {dirtyCount === 1 ? " modifica" : " modifiche"}
            </span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={isSaving}
            className="h-12 rounded-full px-3 text-[15px] text-white/70 transition-colors hover:text-white disabled:opacity-50 sm:px-4"
          >
            Annulla
          </button>
          <Button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            size="lg"
          >
            {isSaving && <Loader2 className="animate-spin" />}
            Salva
          </Button>
        </div>
      </div>
    </div>
  );
};
