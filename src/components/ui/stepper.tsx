import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: readonly string[];
  currentStep: number;
  /** Se presente, i passi completati diventano cliccabili per tornare indietro. */
  onStepSelect?: (stepIndex: number) => void;
}

/** Compact dot progress: filled dots, current label only, completed steps optionally clickable. */
export function Stepper({ steps, currentStep, onStepSelect }: StepperProps) {
  return (
    <nav aria-label="Avanzamento selezione" className="min-w-0">
      <ol className="flex min-w-0 items-center">
        {steps.map((label, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          const clickable = Boolean(onStepSelect) && complete;

          const dot = (
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs tabular-nums transition-colors duration-200 motion-reduce:transition-none",
                active || complete ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"
              )}
            >
              {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
            </span>
          );

          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="flex min-w-0 shrink-0 items-center"
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepSelect?.(index)}
                  title={`Torna al passo ${label}`}
                  className={cn(
                    "flex shrink-0 items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    "cursor-pointer"
                  )}
                >
                  {dot}
                  <span className="sr-only">Torna al passo {label}</span>
                </button>
              ) : (
                dot
              )}

              {active && (
                <span className="ml-3 max-w-[14rem] truncate text-sm font-medium text-foreground sm:text-base">
                  {label}
                </span>
              )}

              {index < steps.length - 1 && <span className="mx-3 h-px w-6 shrink-0 bg-border sm:w-8" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
