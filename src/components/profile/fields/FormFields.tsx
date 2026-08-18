import { forwardRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

/* ---------------------------------- Layout --------------------------------- */

export const SectionCard = ({
  icon,
  title,
  children,
  className,
}: {
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      "w-full rounded-[24px] bg-profile-card px-5 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-[54px]",
      className
    )}
  >
    {(icon || title) && (
      <header className="flex flex-col items-center text-center">
        {icon && <div className="h-16 w-16 text-foreground [&>svg]:h-16 [&>svg]:w-16">{icon}</div>}
        {title && (
          <h2 className="mt-6 font-display text-base uppercase tracking-wide text-foreground">
            {title}
          </h2>
        )}
      </header>
    )}
    <div className={cn(icon || title ? "mt-8" : "", "space-y-6")}>{children}</div>
  </section>
);

export const SectionDivider = ({ className }: { className?: string }) => (
  <hr className={cn("border-t border-border", className)} />
);

export const GroupLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 text-[15px] font-medium leading-5 text-group-label">{children}</p>
);

export const GroupHeading = ({ children }: { children: ReactNode }) => (
  <p className="mb-8 text-base font-medium leading-5 text-group-label">{children}</p>
);

export const FieldGrid = ({
  cols = 2,
  children,
  className,
}: {
  cols?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "grid gap-4 sm:gap-8",
      cols === 1 && "grid-cols-1",
      cols === 2 && "grid-cols-1 sm:grid-cols-2",
      cols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      className
    )}
  >
    {children}
  </div>
);

/**
 * Group of fields that behave as a single component (e.g. day/month/year):
 * horizontal spacing is 8px instead of the standard 32px.
 */
export const FieldCluster = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("flex gap-2", className)}>{children}</div>;

/* ------------------------------ Field shell -------------------------------- */

const shellBase =
  "relative flex w-full flex-col justify-center rounded-2xl px-4 py-3 transition-colors";

const FieldShell = ({
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
      disabled ? "bg-field-disabled" : focused ? "bg-field-focus" : "bg-field",
      focused && !disabled ? "ring-2 ring-inset ring-foreground" : "",
      className
    )}
    data-filled={filled}
  >
    {children}
  </Tag>
);

/**
 * Absolutely positioned label: it never takes part in the layout flow, so the
 * field height stays identical between resting and floating state (no jump).
 */
const FloatLabel = ({
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
      disabled ? "text-field-disabled-foreground" : "text-field-label"
    )}
  >
    {children}
  </span>
);


/* -------------------------------- Text input -------------------------------- */

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
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, value, onChange, onBlur, disabled, prefix, type = "text", inputMode, className }, ref) => {
    const [focused, setFocused] = useState(false);
    const floating = focused || value !== "";

    return (
      <FieldShell
        as="label"
        filled={value !== ""}
        focused={focused}
        disabled={disabled}
        className={cn("cursor-text", className)}
      >
        <FloatLabel floating={floating} disabled={disabled}>
          {label}
        </FloatLabel>
        {/* Fixed offset: the value row never moves, only the label animates */}
        <div className="mt-[18px] flex items-center gap-1">
          {prefix && (
            <span
              className={cn(
                "shrink-0 text-base leading-[1.4] text-field-label transition-opacity",
                floating ? "opacity-100" : "opacity-0"
              )}
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            aria-label={label}
            type={type}
            inputMode={inputMode}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            className={cn(
              "w-full border-0 bg-transparent p-0 text-base leading-[1.4] text-foreground outline-none",
              disabled && "text-field-disabled-foreground"
            )}
          />
        </div>
      </FieldShell>
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
        className="mt-[18px] h-24 w-full resize-none border-0 bg-transparent p-0 text-base leading-[1.4] text-foreground outline-none"
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
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}) => {
  const filled = value !== "";
  const selected = options.find((o) => o.value === value);

  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          shellBase,
          "min-h-16 items-stretch border-0 pr-11 text-left shadow-none focus:ring-2 focus:ring-inset focus:ring-foreground",
          "[&>svg]:absolute [&>svg]:right-4 [&>svg]:top-1/2 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:-translate-y-1/2 [&>svg]:opacity-70",
          disabled ? "bg-field-disabled" : "bg-field",
          className
        )}
      >
        <FloatLabel floating={filled} disabled={disabled}>
          {label}
        </FloatLabel>
        {filled && (
          <span
            className={cn(
              "mt-[18px] block w-full truncate text-base leading-[1.2] text-foreground",
              disabled && "text-field-disabled-foreground"
            )}
          >
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
  );
};

export const toOptions = (values: readonly string[]) =>
  values.map((v) => ({ value: v, label: v }));

/* ------------------------------- Checkbox/Radio ----------------------------- */

export const ProfileCheckbox = ({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
  className?: string;
}) => (
  <label className={cn("flex cursor-pointer items-center gap-3", className)}>
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
        checked ? "border-primary bg-primary" : "border-border bg-transparent"
      )}
    >
      {checked && <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />}
    </button>
    <span className="text-[15px] text-foreground">{label}</span>
  </label>
);

export const ProfileRadioGroup = ({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) => (
  <div className={cn("flex flex-wrap items-center gap-6", className)}>
    {options.map((o) => {
      const active = value === o.value;
      return (
        <label key={o.value} className="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
              active ? "border-primary" : "border-border"
            )}
          >
            {active && <span className="h-3 w-3 rounded-full bg-primary" />}
          </button>
          <span className="text-[15px] text-foreground">{o.label}</span>
        </label>
      );
    })}
  </div>
);

export const YesNoRadio = ({
  value,
  onValueChange,
}: {
  value: boolean | null;
  onValueChange: (value: boolean) => void;
}) => (
  <ProfileRadioGroup
    value={value === null || value === undefined ? "" : value ? "yes" : "no"}
    onValueChange={(v) => onValueChange(v === "yes")}
    options={[
      { value: "yes", label: "Si" },
      { value: "no", label: "No" },
    ]}
  />
);

/* ---------------------------------- Pills ---------------------------------- */

export const RolePill = ({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "flex h-10 items-center rounded-full text-[15px] transition-colors",
      selected
        ? "gap-[5px] bg-primary pl-4 pr-5 text-primary-foreground"
        : "border border-field-label bg-transparent px-5 text-foreground"
    )}
  >
    {selected && <Check className="h-[18px] w-[18px]" />}
    {label}
  </button>
);

export const ValueChip = ({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) => (
  <span className="flex h-10 items-center gap-2 rounded-full border border-border pl-5 pr-3 text-[15px] text-foreground">
    {children}
    <button type="button" onClick={onRemove} aria-label="Rimuovi" className="opacity-70 hover:opacity-100">
      <X className="h-4 w-4" />
    </button>
  </span>
);

/* ------------------------------ Inline actions ------------------------------ */

export const ConfirmButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Conferma"
    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
  >
    <Check className="h-5 w-5" />
  </button>
);

export const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Annulla"
    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"
  >
    <X className="h-5 w-5" />
  </button>
);
