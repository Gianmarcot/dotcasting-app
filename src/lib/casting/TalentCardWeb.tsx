// =============================================================
// TalentCardWeb.tsx — Versione web responsive della card (v3)
// Gemella del template PDF v5.
//
// Layout responsive (mobile-first):
//   base (mobile e tablet) → 1 colonna, misure in rem;
//                            panel ad altezza auto, foto 3:4
//   lg:  (desktop)         → 3 colonne come il PDF, misure in vw;
//                            colonne 2:3
//
// Le size si modificano SOLO nelle costanti qui sotto (stringhe
// complete: Tailwind non compila classi composte a pezzi).
//
// Prerequisiti (una volta sola):
// index.css →
//   @font-face { font-family: 'Tenor Sans'; src: url('/fonts/TenorSans-Regular.ttf'); }
//   @font-face { font-family: 'DM Sans'; src: url('/fonts/DMSans-Regular.ttf'); font-weight: 400; }
//   @font-face { font-family: 'DM Sans'; src: url('/fonts/DMSans-Bold.ttf'); font-weight: 700; }
// tailwind.config → fontFamily: { display: ['Tenor Sans','sans-serif'], card: ['DM Sans','sans-serif'] }
// =============================================================

import React from "react";
import { ResolvedCard, ResolvedRow } from "./roundPreset";

// Palette: identica al PDF
const INK = "#1a1a1a";
const CREAM = "#F4F0EC";

// --- Tipografia: rem fino a tablet, fluida da lg in su ----------
const NAME_SIZE = "text-[2.5rem] lg:text-[clamp(40px,2vw,56px)]";
const TEXT_SIZE = "text-[0.875rem] lg:text-[min(0.8vw,20px)]";

// --- Spaziature: rem fino a tablet, fluide da lg in su ----------
const ROW_GAP = "space-y-1 lg:space-y-[0.25vw]"; // tra le righe dati
const PANEL_PAD = "px-6 pt-6 pb-6 lg:px-[3vw] lg:pt-[3vw] lg:pb-8"; // padding panel

const FieldRow = ({ row }: { row: ResolvedRow }) => (
  <div className={`${TEXT_SIZE} leading-snug`}>
    <span className="font-bold">{row.label}: </span>
    <span className="text-[#F4F0EC]">{row.value}</span>
  </div>
);

const CoverPhoto = ({ src, alt }: { src?: string; alt: string }) =>
  src ? (
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-neutral-200" />
  );

export const TalentCardWeb = ({ card }: { card: ResolvedCard }) => (
  <article className="w-full bg-white font-card text-[#1a1a1a]">
    {/* ---------- 1. wrapper "pagina": 1 / 2 / 3 colonne ---------- */}
    <div className="grid grid-cols-1 lg:grid-cols-3 px-1.5">
      {/* ---------- 2. colonne con cornice propria (1 col fino a lg) ---------- */}
      <div className="px-1.5 py-3 aspect-[3/4] lg:aspect-[2/3]">
        <CoverPhoto src={card.coverPhotos[0]} alt={card.nome} />
      </div>

      <div className="px-1.5 py-3 lg:aspect-[2/3]">
        {/* ---------- 3. pannello scuro dentro la cornice ---------- */}
        <div className={`h-full bg-[#1a1a1a] text-[#F4F0EC] ${PANEL_PAD} flex flex-col justify-between`}>
          {/* container superiore: nome + dati */}
          <div>
            <h2 className={`font-display uppercase text-left leading-[1.25] ${NAME_SIZE}`}>{card.nome}</h2>

            <hr className="border-t border-[#F4F0EC]/100 border-b-0 my-8" />

            {/* due colonne come il PDF: lettura verticale, poi a destra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <div className={ROW_GAP}>
                {card.columns[0].map((r) => (
                  <FieldRow key={r.label} row={r} />
                ))}
              </div>
              <div className={ROW_GAP}>
                {card.columns[1].map((r) => (
                  <FieldRow key={r.label} row={r} />
                ))}
              </div>
            </div>

            <hr className="border-t border-[#F4F0EC]/100 border-b-0 my-8" />

            {card.contacts.map((r) => (
              <div key={r.label} className={`${TEXT_SIZE} mt-1`}>
                ✉&nbsp;&nbsp;{r.value}
              </div>
            ))}
          </div>

          {/* footer in basso */}
          <div className="flex items-center justify-center gap-2.5 mt-6">
            <span className="w-7 h-7 rounded-full bg-[#F4F0EC] text-[#1a1a1a] grid place-items-center font-display text-sm">
              .C
            </span>
            {card.showAgencyContact && <span className={TEXT_SIZE}>info@dotcasting.com</span>}
          </div>
        </div>
      </div>

      <div className="px-1.5 py-3 aspect-[3/4] lg:aspect-[2/3]">
        <CoverPhoto src={card.coverPhotos[1]} alt={card.nome} />
      </div>
    </div>

    {/* ---------- galleria: stesso scheletro, 1 / 2 / 3 colonne ---------- */}
    {card.galleryPages.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-3 px-1.5">
        {card.galleryPages.flat().map((src) => (
          <div key={src} className="px-1.5 py-3 aspect-[3/4] lg:aspect-[2/3]">
            <img src={src} alt={card.nome} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    )}
  </article>
);
