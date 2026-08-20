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
      className="absolute left-0 flex items-center gap-2 text-[15px] text-ink"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="underline">Esci</span>
    </button>
    <img src={logo} alt="dotCasting" className="h-[30px] w-[128px] object-contain" />
  </header>
);

/* Banda dello stepper: prosegue 57px sotto la barra + 32px di crema visibile,
   così la card bianca (che le sta sopra) non lascia affiorare il fondo pagina. */
export const OnboardingStepper = ({ current }: { current: number }) => (
  <div className="relative rounded-[24px] bg-cream-dark px-8 pt-8 pb-[89px]">
    <div className="flex gap-1">
      {ONBOARDING_STEPS.map((label, index) => {
        const reached = index + 1 <= current;
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium leading-none",
                  reached ? "bg-brand-600 text-white" : "border border-border bg-white text-ink"
                )}
              >
                {index + 1}
              </span>
              <span className="truncate text-[15px] font-medium text-ink">{label}</span>
            </div>
            <span
              className={cn(
                "h-2 w-full rounded-full",
                reached ? "bg-brand-600" : "bg-white"
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
    <section className="relative -mt-[57px] rounded-[24px] bg-profile-card px-5 pb-8 pt-[54px] sm:px-10 sm:pb-10">
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="h-16 w-16 text-ink [&>svg]:h-16 [&>svg]:w-16">{icon}</div>
        <h1 className="mt-6 font-display text-2xl uppercase text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-base leading-5 text-grey-600">{subtitle}</p>
        )}
      </header>

      {children}

      <div className="mt-10 flex items-center justify-between gap-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[15px] text-ink"
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
