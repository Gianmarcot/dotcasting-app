import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type SurfaceVariant = "base" | "muted" | "brand" | "inverse";

/**
 * Contesto di superficie: i campi (Input, Select, Textarea) leggono i token
 * `--field-*` che ogni superficie ridefinisce. Nessuna prop di variante sui campi:
 * l'adattamento arriva per cascata dal DOM.
 */
const SurfaceContext = React.createContext<SurfaceVariant>("base");

export const useSurface = () => React.useContext(SurfaceContext);

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  asChild?: boolean;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = "base", asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <SurfaceContext.Provider value={variant}>
        <Comp ref={ref} data-surface={variant} className={cn("dc-surface", className)} {...props} />
      </SurfaceContext.Provider>
    );
  },
);
Surface.displayName = "Surface";
