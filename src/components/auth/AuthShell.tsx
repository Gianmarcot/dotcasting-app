import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";
import slide1 from "@/assets/auth-slide-1.jpg.asset.json";
import slide2 from "@/assets/auth-slide-2.jpg.asset.json";
import slide3 from "@/assets/auth-slide-3.jpg.asset.json";
import slide4 from "@/assets/auth-slide-4.jpg.asset.json";

const SLIDES = [slide1.url, slide2.url, slide3.url, slide4.url];

export const TERMS_URL = "https://www.iubenda.com/termini-e-condizioni/35556124";

/**
 * Impaginazione condivisa delle schermate di autenticazione:
 * slider decorativo fisso a sinistra (540px), colonna di contenuto 384px
 * centrata nello spazio rimanente, logo ancorato in alto sullo stesso asse.
 */
export const AuthShell = ({
  children,
  showSlider = true,
}: {
  children: React.ReactNode;
  showSlider?: boolean;
}) => {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!showSlider) return;
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [showSlider]);

  const goPrev = () => setSlideIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const goNext = () => setSlideIndex((i) => (i + 1) % SLIDES.length);

  return (
    <div className="flex min-h-screen bg-background">
      {showSlider && (
        <div className="sticky top-0 hidden h-screen w-[540px] shrink-0 overflow-hidden bg-black md:block md:rounded-r-[2rem]">
          {SLIDES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out md:rounded-r-[2rem] [transform:translateZ(0)] ${
                i === slideIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 md:rounded-r-[2rem]" />

          <div className="relative z-10 flex h-full flex-col justify-end p-10">
            <div className="flex items-end justify-between gap-6">
              <div className="max-w-md text-white">
                <h2 className="font-tenor text-3xl uppercase leading-tight tracking-wide md:text-4xl">
                  La piattaforma di casting
                </h2>
                <p className="mt-3 text-sm text-white/80 md:text-base">
                  Crea il tuo profilo, carica i tuoi materiali e fatti notare dal mondo del casting.
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Precedente"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Successiva"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colonna di destra */}
      <div className="relative flex min-h-screen flex-1 items-center justify-center px-6 pb-20 pt-32 md:pt-40">
        {/* Logo fisso in alto, centrato sull'asse della colonna */}
        <div className="absolute left-0 right-0 top-16 flex justify-center px-6">
          <Link to="/auth" aria-label="dotCasting">
            <img src={logo} alt="dotCasting" className="h-[30px] w-[128px] object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-[384px]">{children}</div>

        <div className="absolute bottom-6 left-0 right-0 px-6 text-center">
          <a
            href={TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            Termini e condizioni
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
