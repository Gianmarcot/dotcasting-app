import { type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* I campi con floating label vivono nel Design System: qui li ri-esportiamo
   per non duplicare la logica e mantenere le API usate nelle card di profilo. */
export {
  FieldShell,
  FloatLabel,
  FloatingInput,
  FloatingTextarea,
  FloatingSelect,
  FieldCluster,
  toOptions,
} from "@/components/ui/field";

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
      <header className="mb-16 flex flex-col items-center text-center">
        {icon && <div className="h-16 w-16 text-foreground [&>svg]:h-16 [&>svg]:w-16">{icon}</div>}
        {title && (
          <h2 className="mt-6 font-display text-base uppercase tracking-wide text-foreground">
            {title}
          </h2>
        )}
      </header>
    )}
    <div className="space-y-8">{children}</div>
  </section>
);

/** Horizontal rule with a fixed 32px breathing space above and below. */
export const SectionDivider = ({ className }: { className?: string }) => (
  <hr className={cn("my-8 border-t border-divider", className)} />
);

export const GroupLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 text-[15px] font-medium leading-5 text-group-label">{children}</p>
);

export const GroupHeading = ({ children }: { children: ReactNode }) => (
  <p className="mb-8 text-base font-medium leading-5 text-group-label">{children}</p>
);

/** Label + radio group: the gap between the two is always 32px. */
export const RadioField = ({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <p className="mb-8 text-[15px] font-medium leading-5 text-group-label">{label}</p>
    {children}
  </div>
);

/** Grid of checkboxes: 24px between rows, 32px between columns. */
export const CheckboxGrid = ({
  cols = 3,
  children,
  className,
}: {
  cols?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "grid gap-x-4 gap-y-6 sm:gap-x-8",
      cols === 2 && "grid-cols-1 sm:grid-cols-2",
      cols === 3 && "grid-cols-1 sm:grid-cols-3",
      cols === 4 && "grid-cols-2 sm:grid-cols-4",
      className
    )}
  >
    {children}
  </div>
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
  <label
    className={cn(
      "flex items-center gap-3",
      disabled ? "cursor-default" : "cursor-pointer",
      className
    )}
  >
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
        checked ? "border-primary bg-primary" : "border-border bg-transparent",
        disabled && !checked && "border-border bg-field"
      )}
    >
      {checked && <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />}
    </button>
    <span className={cn("text-[15px]", disabled ? "text-field-label" : "text-foreground")}>
      {label}
    </span>
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
  <Button
    type="button"
    variant="secondary"
    size="icon-lg"
    onClick={onClick}
    disabled={disabled}
    aria-label="Conferma"
  >
    <Check className="h-5 w-5" />
  </Button>
);

export const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    type="button"
    variant="secondary"
    size="icon-lg"
    onClick={onClick}
    aria-label="Annulla"
  >
    <X className="h-5 w-5" />
  </Button>
);
