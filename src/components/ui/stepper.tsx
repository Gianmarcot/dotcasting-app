import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: readonly string[];
  currentStep: number;
}

/** Linear progress with explicit current/completed states, not a second navigation. */
export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Avanzamento selezione" className="mt-6 max-w-3xl">
      <ol className="grid auto-cols-fr grid-flow-col gap-3 sm:gap-6">
        {steps.map((label, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={label} aria-current={active ? "step" : undefined} className="min-w-0">
              <div className={cn("mb-3 h-1 rounded-full transition-colors duration-200 motion-reduce:transition-none", index <= currentStep ? "bg-primary" : "bg-border")} />
              <div className={cn("flex items-center gap-2 text-sm sm:text-base", active ? "font-medium text-primary" : complete ? "text-foreground" : "text-muted-foreground")}>
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums", active ? "bg-primary text-primary-foreground" : complete ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span className="min-w-0 break-words">{label}</span>
                {complete && <span className="sr-only">Completato</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}