import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PillTabOption<T extends string> = {
  value: T;
  label: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number | string }>;
  count?: number;
};

/**
 * Selettore a pillole: traccia arrotondata, opzione attiva su fondo chiaro.
 * Estratto dal selettore Foto/Video della preview profilo.
 */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}): ReactNode {
  const move = (direction: 1 | -1) => {
    const index = options.findIndex((option) => option.value === value);
    if (index === -1) return;
    const next = (index + direction + options.length) % options.length;
    onChange(options[next].value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-1 rounded-[100px] bg-[#ece5de] p-1", className)}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
      }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-12 items-center gap-[10px] rounded-[58px] pl-6 pr-7 text-[15px] font-medium text-[#1a1a1a] transition-colors duration-200 motion-reduce:transition-none",
              isActive ? "bg-white" : "bg-transparent"
            )}
          >
            {Icon && <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />}
            <span>
              {option.label}
              {typeof option.count === "number" ? ` · ${option.count}` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PillTabs;
