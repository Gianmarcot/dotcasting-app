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
        "pointer-events-none fixed left-4 right-4 top-20 z-40 transition-all duration-300 md:bottom-6 md:left-[calc(50%+8rem)] md:right-auto md:top-auto md:-translate-x-1/2",
        isDirty ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 md:translate-y-6"
      )}
    >
      <div
        className={cn(
          "flex h-auto w-full items-center justify-end gap-2 rounded-full bg-ink p-2 shadow-2xl md:h-[80px] md:w-[min(560px,calc(100vw-2rem))] md:justify-between md:gap-4 md:py-0 md:pl-6 md:pr-4 lg:gap-6 lg:pl-8",
          isDirty && "pointer-events-auto"
        )}
      >
        <div className="hidden min-w-0 items-center gap-3 text-cream md:flex">
          <Pencil className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="truncate text-base">
            <span className="font-bold">{dirtyCount}</span>
            <span className="opacity-70">
              {dirtyCount === 1 ? " modifica non salvata" : " modifiche non salvate"}
            </span>
          </span>
        </div>

        <div className="flex w-full shrink-0 items-center gap-2 md:w-auto md:gap-3">
          <Button
            type="button"
            onClick={reset}
            disabled={isSaving}
            variant="ghost"
            size="lg"
            className="flex-1 text-cream/70 hover:bg-transparent hover:text-cream md:flex-none"
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            size="lg"
            className="flex-1 md:flex-none"
          >
            {isSaving && <Loader2 className="animate-spin" />}
            Salva
          </Button>
        </div>
      </div>
    </div>
  );
};
