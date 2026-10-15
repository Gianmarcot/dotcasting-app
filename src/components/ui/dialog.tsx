import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("dc-dialog-overlay", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export type DialogSize = "sm" | "md" | "lg" | "fullscreen";

// Nomi letterali: Tailwind elimina le classi costruite dinamicamente.
const SIZE_CLASS = { sm: "dc-dialog-sm", md: "dc-dialog-md", lg: "dc-dialog-lg" } as const;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    overlayClassName?: string;
    /** sm = avvisi/conferme, md = form brevi, lg = form lunghi/liste, fullscreen = come gestione media. */
    size?: DialogSize;
    bodyClassName?: string;
    hideClose?: boolean;
  }
>(({ className, overlayClassName, bodyClassName, size = "md", hideClose, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className={overlayClassName} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(size === "fullscreen" ? "dc-dialog-fullscreen" : ["dc-dialog", SIZE_CLASS[size]], className)}
      {...props}
    >
      <div className={cn("dc-dialog-body", bodyClassName)}>{children}</div>
      {!hideClose && (
        <DialogPrimitive.Close
          aria-label="Chiudi"
          className={cn(
            "dc-dialog-close flex items-center gap-2 rounded-[100px] bg-ink text-white transition-opacity duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
            size === "fullscreen" ? "py-2 pl-6 pr-2" : "p-2"
          )}
        >
          {size === "fullscreen" && <span aria-hidden className="text-sm">Chiudi</span>}
          <span aria-hidden className="flex h-10 w-10 items-center justify-center">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("dc-dialog-header", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("dc-dialog-footer", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("dc-dialog-title", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("dc-dialog-description", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
