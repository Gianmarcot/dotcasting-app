// =============================================================
// TalentCardWeb.tsx — Versione web responsive della card
// Stesso dato (ResolvedCard) del PDF: i due renderer sono solo
// "pelle" sopra resolveCard(talent, preset).
// Tailwind. Desktop: 3 colonne come il mock; mobile: stack.
// NOTA: il sorgente nel prompt aveva JSX corrotto (tag mancanti)
// — qui ricostruito in modo funzionale e fedele al layout PDF.
// =============================================================

import React from "react";
import { ResolvedCard } from "./roundPreset";

// Registra il display serif anche sul web (stesso file del PDF):
// in index.css → @font-face { font-family: 'DotDisplay'; src: url(/fonts/DotDisplay-Regular.otf); }
// e in tailwind.config → fontFamily: { display: ['DotDisplay','serif'] }

const CoverPhoto = ({ src, alt }: { src?: string; alt: string }) =>
  src ? (
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-neutral-200" />
  );

export const TalentCardWeb = ({ card }: { card: ResolvedCard }) => (
  <div className="w-full">
    {/* ---------- blocco principale ---------- */}
    <div className="grid grid-cols-1 md:grid-cols-3 w-full aspect-auto md:aspect-[16/9] bg-white">
      <div className="h-64 md:h-auto">
        <CoverPhoto src={card.coverPhotos[0]} alt={card.nome} />
      </div>

      <div className="bg-[#0E0E0E] text-white px-6 py-8 flex flex-col justify-between">
        <h2 className="font-display text-3xl text-center leading-tight mt-2">
          {card.nome}
        </h2>

        <div>
          <div className="border-t border-white/30 my-3" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {card.columns.flat().map(r => (
              <div key={r.label} className="text-[11px]">
                <span className="font-bold">{r.label}: </span>
                <span className="text-white/85">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/30 my-3" />
          {card.contacts.map(r => (
            <div key={r.label} className="text-xs mt-1">✉  {r.value}</div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-7 h-7 rounded-full bg-white text-[#0E0E0E] flex items-center justify-center font-display text-sm">
            .C
          </div>
          {card.showAgencyContact && (
            <span className="text-xs">info@dotcasting.com</span>
          )}
        </div>
      </div>

      <div className="h-64 md:h-auto">
        <CoverPhoto src={card.coverPhotos[1]} alt={card.nome} />
      </div>
    </div>

    {/* ---------- galleria ---------- */}
    {card.galleryPages.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 p-1.5">
        {card.galleryPages.flat().map(src => (
          <div key={src} className="aspect-[4/5] md:aspect-square">
            <img src={src} alt={card.nome} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    )}
  </div>
);
