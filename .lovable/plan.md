# Distribuire le colonne in modo più uniforme

Oggi la prima colonna (titolo del casting / nome del talent) si prende tutto lo spazio libero, mentre le altre hanno larghezze fisse e strette, e così finiscono schiacciate sulla destra. Sulle pagine larghe (fino a 1600px) le colonne diventeranno proporzionali e si allargheranno insieme.

## Lista casting (pagina Casting e Design System)
- Stella e azioni restano strette come adesso.
- Titolo, Selezione (avatar) e Stato si dividono lo spazio in proporzione circa 2 : 1.5 : 1, con una larghezza minima per ciascuna colonna.
- L'intestazione delle colonne usa la stessa griglia, così le etichette restano allineate alle righe.

## Vista compatta del database talenti
- Nome, Città/età, Foto/video ed Etichette si dividono lo spazio in proporzione circa 2 : 1.5 : 1 : 1.5, con una larghezza minima per ciascuna colonna; la freccia resta a 20px.
- Su schermi piccoli le colonne si nascondono progressivamente come adesso.

## Dettagli tecnici
- `CastingRow.tsx` e l'intestazione in `OwnerCastings.tsx`: un'unica costante di griglia condivisa, ad esempio `grid-cols-[32px_minmax(200px,2fr)_minmax(160px,1.5fr)_minmax(120px,1fr)_120px]`.
- `TalentCompactList.tsx`: sostituire le colonne fisse con colonne `minmax(...,Nfr)` a ogni breakpoint, ad esempio a lg `[minmax(220px,2fr)_minmax(160px,1.5fr)_minmax(132px,1fr)_minmax(200px,1.5fr)_20px]`.
- Verifica visiva con Playwright a 1280px e a 1773px.
