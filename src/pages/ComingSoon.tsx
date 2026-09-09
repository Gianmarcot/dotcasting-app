import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { toast } from "sonner";
import logoWhite from "@/assets/logo-white.png";
import slide1 from "@/assets/auth-slide-1.jpg.asset.json";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("coming_soon_emails")
      .insert({ email: trimmed });
    setLoading(false);

    if (error) {
      // 23505 = unique_violation (email già registrata)
      if (error.code === "23505") {
        toast("Sei già registrato", {
          description: "Ti avviseremo non appena la piattaforma sarà aperta.",
        });
        setEmail("");
        return;
      }
      toast.error("Qualcosa è andato storto. Riprova.");
      return;
    }

    toast.success("Ti avviseremo all'apertura", {
      description: "Abbiamo salvato la tua email.",
    });
    setEmail("");
  };

  return (
    <Surface
      variant="inverse"
      className="relative min-h-screen w-full overflow-hidden text-white"
    >
      {/* Sfondo a pieno schermo */}
      <img
        src={slide1.url}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlay fade: più scuro in basso */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80"
      />

      {/* Contenuto */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Logo in alto */}
        <header className="flex justify-center px-6 pt-10 sm:pt-14">
          <img
            src={logoWhite}
            alt="dotCasting"
            className="h-7 w-auto sm:h-8"
          />
        </header>

        {/* Centro: titolo + form email */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-md text-center">
            <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">
              In arrivo
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/80">
              Stiamo preparando qualcosa di speciale. Lascia la tua email per
              restare aggiornato sull'apertura della piattaforma.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3"
              noValidate
            >
              <FloatingInput
                label="La tua email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Invio in corso…" : "Avvisami"}
              </Button>
            </form>
          </div>
        </main>

        {/* Marquee in basso */}
        <footer className="relative overflow-hidden border-t border-white/10 py-4">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="font-display text-lg uppercase tracking-[0.3em] text-white/70"
              >
                Coming Soon
                <span className="mx-8 text-white/30">•</span>
              </span>
            ))}
          </div>
        </footer>
      </div>
    </Surface>
  );
};

export default ComingSoon;
