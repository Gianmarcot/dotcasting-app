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
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity",
      disabled ? "opacity-30" : "opacity-100 hover:opacity-70"
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
  className,
}: ModalNavBarProps) => (
  <div
    className={cn(
      "flex items-center gap-3 rounded-[100px] bg-[#0f0f0f] p-4",
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
    <CircleButton onClick={onClose} label={labels?.close ?? "Chiudi"}>
      <X className="h-5 w-5" strokeWidth={1.5} />
    </CircleButton>
  </div>
);

export default ModalNavBar;
