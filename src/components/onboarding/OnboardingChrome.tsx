import { type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import logo from "@/assets/logo.png";

/* --------------------------------------------------------------------------
 * Chrome comune ai tre step dell'onboarding: header, stepper, card, footer.
 * Solo token, nessun colore hard-coded.
 * ------------------------------------------------------------------------ */

export const ONBOARDING_STEPS = ["Info di base", "I tuoi ruoli", "Immagine profilo"] as const;

export const OnboardingHeader = ({ onExit }: { onExit: () => void }) => (
  <header className="relative flex h-16 items-center justify-center">
    <button
      type="button"
      onClick={onExit}
      className="absolute left-0 flex items-center gap-2 text-[15px] text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="underline">Esci</span>
    </button>
    <img src={logo} alt="dotCasting" className="h-6" />
  </header>
);

export const OnboardingStepper = ({ current }: { current: number }) => (
  <div className="rounded-t-[24px] bg-cream-dark px-5 pb-8 pt-6 sm:px-8">
    <div className="grid grid-cols-3 gap-3 sm:gap-6">
      {ONBOARDING_STEPS.map((label, index) => {
        const reached = index + 1 <= current;
        return (
          <div key={label} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  reached
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white text-field-label"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "truncate text-[13px] sm:text-[15px]",
                  reached ? "text-foreground" : "text-field-label"
                )}
              >
                {label}
              </span>
            </div>
            <span
              className={cn(
                "h-1 w-full rounded-full",
                reached ? "bg-primary" : "bg-white"
              )}
            />
          </div>
        );
      })}
    </div>
  </div>
);

export const OnboardingCard = ({
  icon,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  loading,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  loading?: boolean;
}) => (
  <Surface variant="base" asChild>
    <section className="-mt-4 rounded-[24px] bg-profile-card px-5 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12">
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="h-14 w-14 text-foreground [&>svg]:h-14 [&>svg]:w-14">{icon}</div>
        <h1 className="mt-6 font-display text-base uppercase tracking-[0.12em] text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-[15px] text-field-label">{subtitle}</p>}
      </header>

      {children}

      <div className="mt-10 flex items-center justify-between gap-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[15px] text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="underline">Indietro</span>
          </button>
        ) : (
          <span />
        )}
        <Button type="button" size="lg" onClick={onNext} disabled={nextDisabled || loading}>
          {nextLabel}
          <ArrowRight />
        </Button>
      </div>
    </section>
  </Surface>
);

export const OnboardingFooter = ({ onLater }: { onLater?: () => void }) => (
  <div className="flex h-16 items-center justify-center">
    {onLater && (
      <button
        type="button"
        onClick={onLater}
        className="text-[15px] text-foreground underline"
      >
        Completa dopo
      </button>
    )}
  </div>
);
