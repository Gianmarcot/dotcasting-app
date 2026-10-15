import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ModalNavBar } from "@/components/ui/modal-nav-bar";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  /** Chiamato quando l'utente chiede di chiudere (velo, Esc, ModalNavBar). */
  onRequestClose: () => void;
  title: ReactNode;
  /** Se presente, ModalNavBar mostra l'etichetta accanto alla X. */
  closeLabel?: string;
  /** Contenuto sotto il titolo (es. indicatore dei passi). */
  headerExtra?: ReactNode;
  children: ReactNode;
  /** Classi aggiuntive per il foglio (es. distanza dal bordo superiore). */
  className?: string;
  titleClassName?: string;
}

/**
 * Foglio a tutto schermo con velo, entrata dal basso e ModalNavBar in alto a destra.
 * Stessa anatomia della gestione media: barra di chiusura nel flusso (spinge il
 * titolo alla stessa distanza dal bordo) e titolo allineato alla colonna interna.
 */
export const FullscreenSheet = ({ open, onRequestClose, title, closeLabel, headerExtra, children, className, titleClassName }: Props) => (
  <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onRequestClose()}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dc-dialog-overlay z-[70]" />
      <DialogPrimitive.Content
        className={cn("dc-dialog-fullscreen z-[80] overflow-y-auto", className)}
        aria-describedby={undefined}
      >
        <div className="sticky top-0 z-10 flex justify-end px-3 pt-6 sm:px-8">
          <ModalNavBar
            onClose={onRequestClose}
            showCloseLabel
            labels={closeLabel ? { close: closeLabel } : undefined}
          />
        </div>
        <div className="mx-auto w-full max-w-[1400px] px-6 pt-2 lg:px-10">
          <DialogPrimitive.Title className={cn("font-display text-xl uppercase sm:text-2xl tracking-wide text-foreground", titleClassName)}>{title}</DialogPrimitive.Title>
          {headerExtra}
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);
