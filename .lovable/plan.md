## Problema

Nella preview di Corrie (talent reale con 5 foto) il PDF mostra due difetti che non si vedono nel talent mock:

1. **Padding inferiore assente** nelle pagine galleria: le foto arrivano a filo del bordo pagina.
2. **Pagine bianche extra** nel documento risultante.

## Causa

In `TalentCardPDF.tsx` lo stile `s.cover` usa `width:"100%", height:"100%"` per l'`<Image />` dentro `s.col` (che ha `paddingVertical: 9`). Nel motore Yoga di `@react-pdf/renderer`:

- `height:"100%"` risolve sull'altezza del padding-box del genitore, non del content-box → l'immagine "invade" il padding inferiore. Nella pagina di copertina il difetto è mascherato dal `View.panel` interno (che ha `flex:1` e forza il layout a rispettare il padding), ma nelle colonne foto pure diventa visibile.
- Se una foto reale ha un intrinsic ratio molto diverso da 2:3, `objectFit:"cover"` in react-pdf non sempre clampa correttamente e il contenuto può eccedere l'altezza della Page 421pt, provocando auto-paginazione con Page bianche extra. Con le foto mock (ratio già compatibile) non succede; con quelle di Corrie sì.

## Soluzione

Un solo file toccato: `src/lib/casting/TalentCardPDF.tsx`. Nessuna modifica a preset, dati, generazione, UI drawer.

Sostituisco le dimensioni percentuali dell'immagine con altezza e larghezza numeriche esplicite, derivate dalle costanti già presenti:

```
COL_OUTER_WIDTH   = (842 - 2*PAGE_PAD_X) / 3            // ≈ 277.67pt
PHOTO_INNER_WIDTH  = COL_OUTER_WIDTH - 2*COL_PAD_X       // ≈ 268.67pt
PHOTO_INNER_HEIGHT = PHOTO_INNER_WIDTH * 1.5             // ≈ 403pt (2:3)
```

Cambio `s.cover` da `{ width:"100%", height:"100%", objectFit:"cover" }` a `{ width: PHOTO_INNER_WIDTH, height: PHOTO_INNER_HEIGHT, objectFit:"cover" }`. Aggiungo `overflow:"hidden"` a `s.col` come cintura di sicurezza contro eventuali arrotondamenti che spingono l'immagine di frazioni di pt oltre il box.

Effetti:
- L'immagine ha un box fisso che non entra in conflitto col padding del genitore → margine bianco uniforme su tutti e 4 i lati, sia in copertina sia in galleria.
- Il contenuto della Page non può più eccedere l'altezza di 421pt → niente pagine bianche generate da auto-paginazione.
- La cover del pannello centrale non è toccata (`s.panel` continua a usare `flex:1`).

## Verifica

1. In `/dev/card-preview`, generare la versione **Corrie (reale)** con preset Completo.
2. Confermare visivamente:
   - stessa pagina di copertina di prima, con padding corretto sui 4 lati delle due foto laterali;
   - pagina galleria unica con 3 foto affiancate, padding bianco identico su tutti e 4 i lati;
   - nessuna pagina bianca dopo l'ultima galleria.
3. Provare anche il preset Essenziale (photoCount = 3) e il mock talent per assicurarsi che nulla regredisca.
4. QA con `pdftoppm -jpeg -r 150` sul PDF scaricato per un controllo pixel-level dei margini.
