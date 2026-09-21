import * as React from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalNavBarProps {
  /** Mostra i pulsanti precedente/successivo. Se false → variante corta 72x72 */
  showNavigation?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  labels?: { prev?: string; next?: string; close?: string };
  /** Mostra il testo "Chiudi" accanto alla X (padding 32px lato testo, 16px lato icona) */
  showCloseLabel?: boolean;
  /** Il posizionamento è deciso da chi usa il componente */
  className?: string;
}

const CircleButton = ({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={cn(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity duration-200 ease-out motion-reduce:transition-none",
      disabled ? "opacity-30" : "opacity-100 hover:opacity-70 active:opacity-50"
    )}
  >
    {children}
  </button>
);

export const ModalNavBar = ({
  showNavigation = false,
  onPrev,
  onNext,
  onClose,
  prevDisabled,
  nextDisabled,
  labels,
  showCloseLabel = false,
  className,
}: ModalNavBarProps) => (
  <div
    className={cn(
      "flex items-center gap-3 rounded-[100px] bg-[#0f0f0f]",
      showCloseLabel ? "py-4 pl-8 pr-4" : "p-4",
      className
    )}
  >
    {showNavigation && (
      <>
        <CircleButton
          onClick={onPrev}
          disabled={prevDisabled}
          label={labels?.prev ?? "Elemento precedente"}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </CircleButton>
        <CircleButton
          onClick={onNext}
          disabled={nextDisabled}
          label={labels?.next ?? "Elemento successivo"}
        >
          <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
        </CircleButton>
        <span aria-hidden className="h-10 w-px shrink-0 bg-white/25" />
      </>
    )}
    {showCloseLabel ? (
      <button
        type="button"
        onClick={onClose}
        aria-label={labels?.close ?? "Chiudi"}
        className="flex shrink-0 items-center gap-3 text-white opacity-100 transition-opacity duration-200 ease-out hover:opacity-70 active:opacity-50 motion-reduce:transition-none"
      >
        <span aria-hidden className="text-sm">
          {labels?.close ?? "Chiudi"}
        </span>
        <span aria-hidden className="flex h-10 w-10 items-center justify-center">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </button>
    ) : (
      <CircleButton onClick={onClose} label={labels?.close ?? "Chiudi"}>
        <X className="h-5 w-5" strokeWidth={1.5} />
      </CircleButton>
    )}
  </div>
);

export default ModalNavBar;
