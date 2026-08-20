import { forwardRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

/* --------------------------------------------------------------------------
 * Campi standard del Design System: floating label + colori surface-aware.
 * Nessun colore proprio: tutto arriva dai token --field-* della Surface.
 * ------------------------------------------------------------------------ */

const shellBase =
  "relative flex w-full flex-col justify-center rounded-2xl px-4 py-3 transition-colors border";

export const FieldShell = ({
  filled,
  focused,
  disabled,
  className,
  children,
  minHeight = "min-h-16",
  as: Tag = "div",
}: {
  filled: boolean;
  focused: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  minHeight?: string;
  as?: "div" | "label";
}) => (
  <Tag
    className={cn(
      shellBase,
      minHeight,
      disabled
        ? "bg-[var(--field-bg-disabled)] text-[var(--field-fg-disabled)]"
        : "bg-[var(--field-bg)] text-[var(--field-fg)]",
      focused && !disabled
        ? "border-[var(--field-border-focus)]"
        : "border-[var(--field-border)]",
      className
    )}
    data-filled={filled}
  >
    {children}
  </Tag>
);

/**
 * Label in posizione assoluta: non partecipa al flusso, così l'altezza del
 * campo resta identica tra stato di riposo e stato floating (nessun salto).
 */
export const FloatLabel = ({
  children,
  floating,
  disabled,
  align = "center",
}: {
  children: ReactNode;
  floating: boolean;
  disabled?: boolean;
  align?: "center" | "top";
}) => (
  <span
    className={cn(
      "pointer-events-none absolute left-4 right-10 origin-left truncate transition-all duration-150 ease-out",
      floating
        ? "top-3 text-xs font-medium leading-[1.2]"
        : align === "top"
          ? "top-[18px] text-base font-normal leading-[1.2]"
          : "top-1/2 -translate-y-1/2 text-base font-normal leading-[1.2]",
      disabled
        ? "text-[var(--field-label-disabled)]"
        : "text-[var(--field-label)]"
    )}
  >
    {children}
  </span>
);

/* -------------------------------- Text input ------------------------------- */

interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  prefix?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel" | "url";
  className?: string;
  maxLength?: number;
  name?: string;
  autoComplete?: string;
  /** Messaggio di errore (bordo rosso + testo sotto il campo) */
  error?: string | null;
  /** Messaggio di avviso non bloccante */
  warning?: string | null;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      disabled,
      prefix,
      type = "text",
      inputMode,
      className,
      maxLength,
      name,
      autoComplete,
      error,
      warning,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const floating = focused || value !== "";
    const message = error || warning;

    return (
      <div className={cn("flex w-full flex-col", className)}>
        <FieldShell
          as="label"
          filled={value !== ""}
          focused={focused}
          disabled={disabled}
          className={cn("cursor-text", error && "border-destructive")}
        >
          <FloatLabel floating={floating} disabled={disabled}>
            {label}
          </FloatLabel>
          {/* Offset fisso: la riga del valore non si muove, si anima solo la label */}
          <div className="mt-[18px] flex items-center gap-1">
            {prefix && (
              <span
                className={cn(
                  "shrink-0 text-base leading-[1.4] text-[var(--field-label)] transition-opacity",
                  floating ? "opacity-100" : "opacity-0"
                )}
              >
                {prefix}
              </span>
            )}
            <input
              ref={ref}
              aria-label={label}
              aria-invalid={!!error}
              type={type}
              inputMode={inputMode}
              maxLength={maxLength}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                onBlur?.();
              }}
              className="dc-autofill w-full border-0 bg-transparent p-0 text-base leading-[1.4] text-inherit outline-none"
            />
          </div>
        </FieldShell>
        {message && (
          <span
            className={cn(
              "mt-2 px-4 text-[13px] leading-[1.3]",
              error ? "text-destructive" : "text-[var(--field-label)]"
            )}
          >
            {message}
          </span>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

/* --------------------------------- Textarea -------------------------------- */

export const FloatingTextarea = ({
  label,
  value,
  onChange,
  onBlur,
  disabled,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const floating = focused || value !== "";

  return (
    <FieldShell
      filled={value !== ""}
      focused={focused}
      disabled={disabled}
      as="label"
      minHeight="min-h-36"
      className={cn("cursor-text justify-start", className)}
    >
      <FloatLabel floating={floating} disabled={disabled} align="top">
        {label}
      </FloatLabel>
      <textarea
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        className="dc-autofill mt-[18px] h-24 w-full resize-none border-0 bg-transparent p-0 text-base leading-[1.4] text-inherit outline-none"
      />
    </FieldShell>
  );
};

/* ---------------------------------- Select --------------------------------- */

export const FloatingSelect = ({
  label,
  value,
  onValueChange,
  options,
  disabled,
  className,
  error,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
  /** Messaggio di errore (bordo rosso + testo sotto il campo) */
  error?: string | null;
}) => {
  const filled = value !== "";
  const selected = options.find((o) => o.value === value);
  const message = error?.trim() ? error : null;

  return (
    <div className={cn("flex flex-col", className)}>
      <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          aria-invalid={!!error}
          className={cn(
            shellBase,
            "min-h-16 h-auto items-stretch pr-11 text-left shadow-none",
            error
              ? "border-destructive"
              : "border-[var(--field-border)] focus:border-[var(--field-border-focus)]",
            disabled
              ? "bg-[var(--field-bg-disabled)] text-[var(--field-fg-disabled)]"
              : "bg-[var(--field-bg)] text-[var(--field-fg)]",
            "[&>svg]:absolute [&>svg]:right-4 [&>svg]:top-1/2 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:-translate-y-1/2 [&>svg]:opacity-70"
          )}
        >
          <FloatLabel floating={filled} disabled={disabled}>
            {label}
          </FloatLabel>
          {filled && (
            <span className="mt-[18px] block w-full truncate text-base leading-[1.2] text-inherit">
              {selected?.label ?? value}
            </span>
          )}
        </SelectTrigger>

        <SelectContent className="max-h-72">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {message && <p className="mt-1.5 px-1 text-xs text-destructive">{message}</p>}
    </div>
  );
};


export const toOptions = (values: readonly string[]) =>
  values.map((v) => ({ value: v, label: v }));

/**
 * Gruppo di campi che si comportano come un unico componente
 * (es. giorno/mese/anno): spazio orizzontale 8px invece di 32px.
 */
export const FieldCluster = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("flex gap-2", className)}>{children}</div>;
