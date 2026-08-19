# Ritaglio 1:1 per l'avatar, oltre al 2:3

Oggi il ritaglio è unico (2:3) ed è distruttivo: il file originale viene sostituito dalla versione ritagliata, quindi non è possibile ricavare un secondo ritaglio (quadrato) dalla stessa foto. L'obiettivo è avere due ritagli indipendenti per ogni foto: **2:3** per galleria/copertina/PDF e **1:1** per la foto profilo.

## Come funzionerà

1. **La foto originale non viene più cancellata.** Ogni ritaglio genera un file derivato, così si può ritagliare e ri-ritagliare liberamente senza perdita di qualità.
2. **Il tab 1:1 compare solo sulla foto profilo.** Solo la prima foto della categoria "Foto principali" (quella che fa da foto profilo) offre due tab: `Copertina 2:3` e `Avatar 1:1`. Tutte le altre foto mantengono il solo ritaglio 2:3, esattamente come oggi. Ogni tab parte dal ritaglio già salvato o da un ritaglio centrato di default; si conferma con un unico pulsante.
3. **Anteprime nella galleria.** Sulla foto profilo si vedrà l'indicazione dei ritagli presenti (2:3 e 1:1); sulle altre nessun cambiamento visivo.
4. **Foto profilo diversa dalla copertina.** La prima foto principale userà il ritaglio 1:1 come avatar, mentre galleria, invii cliente e PDF continuano a usare il 2:3. Se il ritaglio 1:1 non è stato fatto, si usa un quadrato centrato automatico. Se l'ordine cambia e un'altra foto diventa la prima, il suo tab 1:1 diventa disponibile.


## Dettagli tecnici

- **Nessuna modifica allo schema**: si usa la colonna `crops` (JSONB) già presente su `talent_media`. Nuova forma del valore:
  `{ "original_url": "...", "2:3": { "url": "...", "rect": { x, y, w, h } }, "1:1": { "url": "...", "rect": { x, y, w, h } } }`
  con `rect` in percentuali dell'originale, per riaprire il ritaglio nella stessa posizione.
- `talent_media.url` resta il riferimento "principale" (variante 2:3 quando esiste, altrimenti l'originale), così tutti i consumer attuali (galleria, `SharedRound`, `TalentCardPDF`, tile owner) non cambiano.
- `src/components/profile/ImageCropModal.tsx`: aggiunta prop `ratios` (default `["2:3","1:1"]`), tab per proporzione, stato di crop per ratio, callback `onSave(results: { ratio, blob, rect }[])`. Rimane compatibile con l'uso attuale in `MediaGallerySection.tsx` passando una sola ratio.
- `src/hooks/useTalentMedia.ts`: `useReplaceMediaFile` viene sostituito da `useSaveMediaCrops` — carica i blob derivati su storage, non rimuove l'originale, fa il merge nel JSONB `crops` e aggiorna `url` con la variante 2:3. Pulizia dei vecchi file derivati sostituiti; l'originale viene rimosso solo alla cancellazione della foto (in `useDeleteMedia`, insieme a tutte le varianti).
- `src/components/profile/v2/photos/PhotoGalleryModal.tsx`: `handleCropSave` passa a più ritagli; la sincronizzazione della foto profilo usa `crops["1:1"].url` della prima foto principale con fallback all'`url`.
- Helper nuovo `src/lib/media/crops.ts` con tipi e utility (`getCropUrl(media, ratio)`, parsing sicuro del JSONB, ritaglio quadrato centrato di fallback).
- Compressione: le varianti passano da `compressImage` come oggi; l'avatar 1:1 con preset più leggero.
- Retrocompatibilità: foto già ritagliate (dove l'originale non esiste più) usano `url` come originale per il nuovo ritaglio 1:1.
