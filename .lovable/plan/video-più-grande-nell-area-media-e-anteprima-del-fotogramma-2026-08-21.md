# Video più grande nell'area media e anteprima del fotogramma

## Problema

Nella vista video il player resta piccolo perché, senza precaricamento, il browser non conosce le proporzioni del file e usa la sua dimensione di default (circa 300x150). Inoltre, se il video non ha una miniatura salvata, l'area resta nera invece di mostrare un fotogramma.

## Cosa cambia

1. **Il video riempie l'area media.** L'elemento viene racchiuso in un contenitore a cui viene applicato l'aspect-ratio nativo del video: la dimensione limitante arriva al 100% dell'area (altezza piena per i video verticali, larghezza piena per gli orizzontali) e l'altra si adatta in proporzione. Nessun ritaglio, video sempre centrato.

2. **Proporzioni note prima della riproduzione.** Le proporzioni si ricavano dai metadati del file (evento di caricamento metadati) e vengono memorizzate per video. Finché non sono note si usa un rapporto neutro di ripiego, così le fasce sopra e sotto non si spostano mai: l'altezza della fascia centrale resta fissa come oggi.

3. **Anteprima del fotogramma.** Se esiste la miniatura salvata resta il poster attuale. Se manca, si carica solo la porzione iniziale del file (metadati) per mostrare il primo fotogramma statico come anteprima, senza scaricare il video intero e senza riproduzione automatica né audio.

## Cosa non cambia

- Nessun autoplay, nessun audio automatico: la riproduzione parte solo su azione esplicita.
- Il file completo si scarica solo all'avvio della riproduzione.
- Selettore Foto/Video, fascia delle anteprime, pausa al ritorno alle foto, frecce da tastiera: invariati.
- Metà destra della modale e barra di navigazione in alto a destra: non toccate.

## Note tecniche

- File: `src/components/talents/detail/TalentDetailModal.tsx` (solo presentazione).
- Stato locale `videoAspect: Record<string, number>` popolato in `onLoadedMetadata` da `videoWidth / videoHeight`.
- Wrapper con `style={{ aspectRatio }}` più `max-h-full max-w-full h-full w-full`, video in `h-full w-full object-contain`.
- `preload="metadata"` quando manca `thumbnail_url` (per il fotogramma), `preload="none"` quando il poster esiste.
