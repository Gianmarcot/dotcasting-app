import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Rende **grassetto** all'interno del corpo del messaggio. */
export const renderBody = (body: string): ReactNode =>
  body.split("\n").map((line, li) => (
    <span key={li} className="block">
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-medium">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  ));

/** Pill di azione: bordo hairline, fondo bianco 30% con blur. */
export const ActionPill = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn("dc-action-pill", className)}
    {...props}
  >
    {children}
  </button>
);

export const AgencyAvatar = ({
  logoUrl,
  name,
}: {
  logoUrl?: string | null;
  name?: string | null;
}) =>
  logoUrl ? (
    <img
      src={logoUrl}
      alt={name || "Agenzia"}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
      {(name || "D").charAt(0).toUpperCase()}
    </span>
  );

/**
 * Bolla della comunicazione: larghezza massima 632px, angolo alto-sinistra
 * squadrato per agganciarsi all'immagine dell'agenzia.
 */
export const CommunicationBubble = ({
  label,
  body,
  time,
  action,
  className,
}: {
  label: string;
  body: ReactNode;
  time?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "w-full max-w-[632px] rounded-3xl rounded-tl-none bg-[hsl(var(--bubble))] p-6",
      className
    )}
  >
    <div className="flex flex-col gap-2">
      <p className="text-[15px] font-medium leading-[1.4] text-[#686868]">{label}</p>
      <div className="text-[15px] leading-[1.4] text-[#1a1a1a]">{body}</div>
    </div>

    <div
      className={cn(
        "mt-6 flex flex-wrap items-center gap-3",
        action ? "justify-between" : "justify-end"
      )}
    >
      {action}
      {time && (
        <span className="ml-auto text-xs font-medium text-[#686868]">{time}</span>
      )}
    </div>
  </div>
);
