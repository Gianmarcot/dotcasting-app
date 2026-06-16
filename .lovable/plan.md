## Obiettivo
Ridurre il peso delle immagini caricate sulla piattaforma applicando una compressione leggera lato client (nel browser), prima di inviarle allo storage. Vantaggi: upload più veloci, meno banda usata, caricamento gallerie più fluido, nessun costo server.

## Approccio
Aggiungere un'unica utility condivisa `src/lib/media/compressImage.ts` basata su `browser-image-compression` (libreria leggera, ~10KB gzip, già usa Web Worker per non bloccare la UI). La utility viene poi invocata in tutti i punti di upload immagine esistenti.

### Limiti proposti (modificabili)
| Tipo immagine | Lato max | Peso target | Formato output |
|---|---|---|---|
| Avatar / foto profilo | 1024 px | ~300 KB | JPEG q≈0.85 |
| Galleria media talent (foto book, polaroid, ecc.) | 2000 px | ~800 KB | JPEG q≈0.85 |
| Altre immagini (casting, allegati) | 1920 px | ~600 KB | JPEG q≈0.85 |

PNG con trasparenza e WebP vengono preservati nel loro formato; solo i JPEG/PNG pesanti vengono ricompressi. File già sotto soglia vengono passati invariati. GIF animate, PDF e video sono ignorati (passano così come sono).

## Punti di intervento (file già individuati)
1. `src/components/profile/ProfilePhotoSection.tsx` — upload avatar → preset "avatar"
2. `src/pages/talent/TalentOnboarding.tsx` (riga ~148) — foto profilo onboarding → preset "avatar"
3. `src/hooks/useTalentMedia.ts` (riga ~91) — upload media galleria → preset "gallery"
4. `src/hooks/useTalentMediaByProfileIdEditable.ts` — variante owner → preset "gallery"
5. `src/hooks/useUpdateRound.ts` e `src/lib/casting/generateRound.tsx` — eventuali immagini casting → preset "generic"

In ogni punto: `const compressed = await compressImage(file, "avatar" | "gallery" | "generic")` subito prima del `.upload()`. Le crop blob generate dal cropper esistente passano comunque dalla utility (sono già JPEG ma vengono ulteriormente normalizzate).

## Dettagli tecnici
- Dipendenza: `browser-image-compression` (~10KB gzip, MIT, attivamente mantenuta).
- La utility espone una funzione tipata `compressImage(file: File | Blob, preset: Preset): Promise<File>` con i 3 preset sopra.
- Mantiene EXIF orientation (importante per foto da smartphone).
- Restituisce sempre un `File` con nome originale e content-type corretto, così i nomi dei file in storage non cambiano.
- Fallback: se la compressione fallisce per qualunque motivo, si carica il file originale e si logga un warning (non blocca mai l'utente).
- Nessuna modifica allo schema DB né alle RLS — è puramente frontend.

## Cosa NON viene fatto
- Nessuna ricompressione retroattiva delle immagini già caricate (si potrebbe fare in un secondo step con un'edge function on-demand, ma non rientra in questo intervento).
- Nessuna conversione automatica in WebP/AVIF (si può aggiungere in futuro; richiede valutare compatibilità del download).
- Nessuna modifica al limite di dimensione massima accettata da Supabase Storage.