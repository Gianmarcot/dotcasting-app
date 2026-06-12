// =============================================================
// TalentCardWeb.tsx — Versione web responsive della card (v2)
// Allineata al template PDF v5: cornice bianca, pannello scuro
// dentro la colonna centrale, container nome+dati in alto e
// footer in basso, Tenor Sans (nome) + DM Sans (testo).
//
// Tipografia fluida (costanti NAME_SIZE / TEXT_SIZE):
// nome clamp(40px, 2.5vw, 72px) · testi clamp(14px, 0.8vw, 20px).
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

// Tipografia fluida (stringhe complete: Tailwind non compila classi
// composte a pezzi, quindi modificare i valori SOLO dentro queste costanti)
const NAME_SIZE = "text-[clamp(40px,2.5vw,64px)]";
const TEXT_SIZE = "text-[clamp(14px,0.8vw,20px)]";

// Scheletro: equivalenti px dei pt del PDF (×1.333)
// PAGE_PAD_X 4.5pt → 6px · COL_PAD 9/4.5pt → 12/6px · panel 24pt → 32px

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
    {/* ---------- 1. wrapper "pagina": padding solo ai lati ---------- */}
    <div className="grid grid-cols-1 md:grid-cols-3 px-1.5">
      {/* ---------- 2. colonne: cornice propria, rapporto 2:3 -------- */}
      {/* (colonne verticali: larghezza 2, altezza 3 — se intendevi     */}
      {/*  l'opposto, sostituisci aspect-[2/3] con aspect-[3/2])        */}
      <div className="px-1.5 py-3 aspect-[3/4] md:aspect-[2/3]">
        <CoverPhoto src={card.coverPhotos[0]} alt={card.nome} />
      </div>

      <div className="px-1.5 py-3 md:aspect-[2/3]">
        {/* ---------- 3. pannello scuro dentro la cornice ------------ */}
        <div className="h-full bg-[#1a1a1a] text-[#F4F0EC] px-8 py-8 flex flex-col justify-between">
          {/* container superiore: nome + dati */}
          <div>
            <h2 className={`font-display uppercase text-left leading-[1.25] ${NAME_SIZE}`}>{card.nome}</h2>

            <hr className="border-t border-[#F4F0EC]/100 border-b-0 my-4" />

            {/* due colonne come il PDF: lettura verticale, poi a destra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <div className="space-y-3">
                {card.columns[0].map((r) => (
                  <FieldRow key={r.label} row={r} />
                ))}
              </div>
              <div className="space-y-3">
                {card.columns[1].map((r) => (
                  <FieldRow key={r.label} row={r} />
                ))}
              </div>
            </div>

            <hr className="border-t border-[#F4F0EC]/100 border-b-0 my-4" />

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

      <div className="px-1.5 py-3 aspect-[3/4] md:aspect-[2/3]">
        <CoverPhoto src={card.coverPhotos[1]} alt={card.nome} />
      </div>
    </div>

    {/* ---------- galleria: stesso scheletro ---------- */}
    {card.galleryPages.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-3 px-1.5">
        {card.galleryPages.flat().map((src) => (
          <div key={src} className="px-1.5 py-3 aspect-[3/4] md:aspect-[2/3]">
            <img src={src} alt={card.nome} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    )}
  </article>
);
