import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ModalNavBar } from "@/components/ui/modal-nav-bar";

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
}

/** Foglio a tutto schermo con velo, entrata dal basso e ModalNavBar in alto a destra. */
export const FullscreenSheet = ({ open, onRequestClose, title, closeLabel, headerExtra, children }: Props) => (
  <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onRequestClose()}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dc-dialog-overlay z-[70]" />
      <DialogPrimitive.Content
        className="dc-dialog-fullscreen z-[80]"
        aria-describedby={undefined}
      >
        <ModalNavBar
          className="absolute right-3 top-8 z-[90] sm:right-8"
          onClose={onRequestClose}
          showCloseLabel
          labels={closeLabel ? { close: closeLabel } : undefined}
        />
        <div className="px-5 pt-10 pb-6 pr-40 sm:px-10">
          <DialogPrimitive.Title className="font-display text-2xl uppercase tracking-wide text-foreground">{title}</DialogPrimitive.Title>
          {headerExtra}
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);
