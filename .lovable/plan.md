
## Problema
Alcuni PDF degli invii risultano "sfasati" o senza immagini anche dopo la rigenerazione. Tre cause distinte, tutte lato client di generazione (`src/lib/casting/generateRound.tsx` + `TalentCardPDF.tsx` + `fetchRoundTalents.ts`).

## Cause individuate

**1. Collisione dei path in Storage**  
Il file viene salvato come `castings/{castingId}/rounds/{roundId}/{slug(nome)}.pdf`. Se due talent hanno lo stesso `stage_name`/nome (o uno ha `nome` vuoto → slug `""`), il secondo upload sovrascrive il primo con `upsert:true`. Risultato: due `role_talents` puntano allo stesso `pdf_path`, il cliente vede lo stesso PDF su due card diverse o un PDF "sfasato" (dati di un altro talent).

**2. Immagini mancanti nel PDF**  
`@react-pdf/renderer` fa `fetchImage` in fase di render. Le foto passano per l'endpoint `/storage/v1/render/image/public/…?width=1500&resize=contain` che può fallire (rate limit, source troppo grande, timeout). react-pdf in quel caso non alza errore visibile: produce un PDF senza quelle immagini. Non c'è alcun pre-fetch né fallback all'URL originale.

**3. Overflow del pannello centrale**  
La pagina è di altezza fissa (421pt). Se il talent ha `nome` molto lungo (Tenor Sans 19pt va a capo) + molte righe misure + più contatti, il blocco superiore cresce oltre lo spazio disponibile e "spinge" il footer fuori, oppure il contenuto viene tagliato. Non ci sono clamp sulle righe visibili né limiti sul wrap del nome.

## Interventi (solo generazione PDF, nessuna modifica UI)

### A. Path per PDF stabile e univoco
`src/lib/casting/generateRound.tsx`: sostituire lo slug del nome con `roleTalentId` (uuid, sempre univoco):
```
castings/{castingId}/rounds/{roundId}/{roleTalentId}.pdf
```
Aggiungere migrazione light: la prossima rigenerazione riscrive i `pdf_path` in DB → nessun cleanup richiesto, i vecchi file restano orfani ma non sono più referenziati.

### B. Immagini affidabili
`src/lib/casting/fetchRoundTalents.ts` + `generateRound.tsx`:
- Prima della `pdf(...).toBlob()`, pre-fetchare in parallelo tutte le foto del talent con `fetch(url)`; per ogni URL fallito, provare il fallback all'URL originale (senza transform). Sostituire nell'array `photos` solo gli URL confermati raggiungibili.
- Se un'immagine fallisce anche l'originale, escluderla dall'elenco (meglio meno foto che una griglia con buchi).
- Aggiungere `timeout` (es. 15s) per evitare hang.

### C. Layout robusto in `TalentCardPDF.tsx`
- Nome: limitare a max 2 righe (`maxLines: 2` via `Text` + fontSize dinamico se supera N caratteri) per non spingere il footer.
- Contatti: limitare a 2 righe (email + telefono), troncare eventuali extra.
- Rows misure: se le righe visibili superano una soglia (es. 18 totali su 2 colonne), ridurre `fontSize` da 6.5 a 6 automaticamente.
- Aggiungere `overflow: "hidden"` al `panel` così un edge case non "sfonda" mai la pagina.

### D. QA
- Rigenerare l'invio di test con talent reali (`Corrie`) + mock, verificare:
  - file salvati con nome uuid,
  - pdf sempre con immagini corrispondenti al talent,
  - nessun overflow (screenshot pdf con pdfjs come in `CardPreview`).

## File toccati
- `src/lib/casting/generateRound.tsx` — path uuid + pre-check foto
- `src/lib/casting/fetchRoundTalents.ts` — helper `resolvePhotoUrl(url)` con fallback
- `src/lib/casting/TalentCardPDF.tsx` — clamp nome/contatti, overflow hidden, fontSize adattivo

Nessuna modifica a schema DB, a `SharedRound.tsx`, o alla UI del wizard/round detail.
