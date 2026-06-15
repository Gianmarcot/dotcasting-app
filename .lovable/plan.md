## Obiettivo

Evitare che le card della preview, quando si espandono a griglia in hover, vengano tagliate dai bordi del contenitore della scheda invio (problema visibile su card strette / mobile / quando ci sono 5 layer).

## Cambiamenti

Solo `src/components/castings/rounds/RoundFolderCard.tsx` — sezione `gridSlots` (righe 117-129). Nessuna modifica a dati, schema, board interna, PDF/Web card.

### Logica nuova per `gridSlots`

1. Mantieni l'altezza naturale della card a ventaglio come tetto: `maxCardH = STACK_HEIGHT * 0.88`, `maxCardW = (maxCardH * 5) / 7`.
2. Calcola la larghezza massima per card che entra nel contenitore tenendo conto dei gap e di un piccolo padding di sicurezza:
   - `available = max(0, stripWidth - SAFE_PADDING)` con `SAFE_PADDING = 4` (2px per lato, considerando il bordo bianco delle card).
   - `fitCardW = (available - (slots - 1) * GRID_GAP) / slots`.
3. `cardW = min(maxCardW, fitCardW)` e `cardH = (cardW * 7) / 5` (mantiene il rapporto 5:7, niente stretch).
4. Se `stripWidth === 0` (prima misurazione), fallback: usa `maxCardW`/`maxCardH` ma nascondi temporaneamente il transform (resta ventaglio, che è lo stato default → nessun problema percepito).
5. Centratura invariata (`startX` calcolato sui valori finali).

Effetti:
- Su card strette la griglia si rimpicciolisce uniformemente, restando dentro al contenitore.
- Su card larghe la dimensione resta identica a oggi (cap a `maxCardW`).
- Nessun reflow del layout esterno: il contenitore mantiene `height: STACK_HEIGHT` fisso e `overflow-hidden`; le card animano solo width/height/translate.

### Note

- Il `border-2 border-white` aggiunge 4px di larghezza visiva per card: il `SAFE_PADDING` lo compensa.
- Su mobile/touch lo stato resta ventaglio (nessun hover), quindi questo cambio impatta solo desktop hover. Il ventaglio non viene toccato.
- Transizione, z-index, opacità del layer "+N" invariati.

## Verifica

Dopo l'implementazione, controllo in preview a viewport desktop e a una larghezza ridotta (es. 1024 con sidebar) che in hover le 5 card stiano interamente dentro la scheda senza essere tagliate ai bordi.
