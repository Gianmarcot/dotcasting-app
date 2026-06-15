## Obiettivo

Sostituire la striscia di miniature affiancate nelle schede invio (`RoundFolderCard`) con uno **stack a ventaglio** stile provino: foto sovrapposte, leggermente ruotate, con bordo bianco a stacco. Solo presentazione; nessuna modifica a dati, schema, hook, board interna dell'invio o cover di PDF/TalentCardWeb.

## File da toccare

- `src/components/castings/rounds/RoundFolderCard.tsx` — solo il blocco "Photo strip".

Nessun altro file modificato. Hook `useRoundPreviewPhotos` resta com'è (fornisce già `items` con `photoUrl` e `name`, e `total`).

## Comportamento

- Contenitore con altezza fissa (riusa l'attuale ingombro verticale della striscia, es. ~`h-44` o equivalente basato su `aspect-[5/7]` della card frontale + padding laterale) per garantire che la scheda invio mantenga la stessa altezza indipendentemente dal numero di talent.
- Fino a **4 card frontali** sovrapposte (`position: absolute`), ciascuna con la foto principale (sort_order = 0 — già quanto restituito dall'hook).
- Ogni card:
  - aspect-ratio **5:7**, `object-fit: cover`
  - bordo **2px** del colore di sfondo della scheda (bianco), `rounded-md`
  - nessuna ombra pesante (al massimo una sottilissima per leggibilità)
- Offset orizzontale crescente (~**24px** tra una card e l'altra) e rotazione alternata contenuta (es. `0deg, -4deg, +6deg, -3deg, +9deg`). Card in primo piano (`z-index` più alto) dritta o quasi.
- Centratura: lo stack è centrato orizzontalmente nel contenitore (translate baseline + offset cumulativo per-card).

## Conteggio eccedenza

- Se `total > 4`: l'ultima card (dietro, z-index più basso, leggermente sfumata con `opacity ~0.85` o overlay neutro) mostra **`+N`** dove `N = total − 4`.
- Se `total ≤ 4`: niente card "+N", solo le foto reali (1..4).
- Se `total === 0`: placeholder testuale "Nessun talent" come oggi, centrato nel contenitore (nessuno stack).

## Ordine di presentazione (solo nello stack)

- Calcolo locale: ordina `items` mettendo prima quelli con `photoUrl` non nullo, poi quelli senza, **stabile**. Prendi i primi 4 per le card foto, poi eventualmente +N.
- I talent senza foto (placeholder iniziali su `#2C2C2A`) finiscono dietro nello stack, mai come card frontale, **a meno che** non esista nemmeno un talent con foto: in quel caso la card frontale è un placeholder iniziali (caso degenere accettabile).
- Non modifica l'ordine dei talent altrove (questa è una `[...items].sort()` locale al componente).

## Interazione

- Hover (solo desktop, `@media (hover: hover)` o `group-hover` di Tailwind sul container scheda): le card aumentano l'offset orizzontale (~da 24px a ~36px) e leggermente la rotazione, con `transition: transform 200ms ease`. Effetto "sfogliato".
- Nessun elemento dello stack è cliccabile/interattivo: `pointer-events-none` sulle card interne; il click sulla scheda invio continua a navigare all'invio (gestito dal contenitore esistente).
- Touch: nessun hover (default — non aggiungiamo handler touch), stack statico.

## Responsive

- Lo stack scala con la larghezza della scheda. Su mobile (scheda a colonna singola, più larga) lo stack resta statico (l'hover non si applica). Altezza fissa del contenitore preserva l'allineamento delle schede nella griglia 2 colonne con `auto-rows-fr`.

## Vincoli ribaditi

- Nessun cambiamento a header, badge stato, footer "N talent · data", icone azione (Edit/Share/Copy/Regen).
- Nessun cambiamento a `RoleRoundsCompartment`, board interna invio, `TalentCardPDF`, `TalentCardWeb`, `fetchRoundTalents`, schema DB, query.

## Diagramma stack (schematico)

```text
            [card1 frontale, rot 0°, z=40]
          [card2 dietro, +24px, rot -4°, z=30]
        [card3 dietro, +48px, rot +6°, z=20]
      [card4 / "+N" dietro, +72px, rot -3°, z=10]
```
