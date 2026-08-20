import React, { useCallback, useId, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const generatedId = useId();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = index === 0 ? options.length - 1 : index - 1;
        onChange(options[nextIndex].value);
        refs.current[nextIndex]?.focus();
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = index === options.length - 1 ? 0 : index + 1;
        onChange(options[nextIndex].value);
        refs.current[nextIndex]?.focus();
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onChange(options[index].value);
      }
    },
    [onChange, options]
  );

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      id={generatedId}
      className={cn(
        "w-full flex gap-2 p-2 rounded-2xl",
        className
      )}
      style={{ backgroundColor: "var(--cream-dark)" }}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <div
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex-1 h-[130px] p-4 flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer text-[var(--ink)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream-dark)]",
              isSelected
                ? "bg-[var(--white)] shadow-[0_6px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.06)]"
                : "hover:bg-[var(--cream)]"
            )}
          >
            <span className="w-12 h-12 flex items-center justify-center" aria-hidden="true">
              {option.icon}
            </span>
            <span className="text-sm font-medium text-center leading-tight max-w-[120px]">
              {option.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
