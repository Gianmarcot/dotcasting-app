# Animazione di entrata per le modali Foto e Video

## Cosa cambia per l'utente

Aprendo "Le mie foto" o "Tutti i video" dal profilo talent, la finestra non appare più con una semplice dissolvenza rapida: entra salendo dal basso verso l'alto, con una dissolvenza abbinata. Il movimento resta breve (circa 300 ms) ma visibile, così si capisce subito che si tratta di una finestra sovrapposta.

Alla chiusura la finestra scende verso il basso dissolvendosi, con un movimento più rapido (circa 200 ms).

Se il sistema dell'utente richiede movimento ridotto, resta solo una dissolvenza molto breve.

## Note tecniche

- Unico file: `src/components/profile/v2/photos/MediaGalleryModal.tsx` (la modale condivisa usata sia dalle foto sia dai video, quindi entrambe cambiano insieme).
- Sul `DialogPrimitive.Content`: distanza di slide aumentata da `slide-in-from-bottom-4` a circa `slide-in-from-bottom-8`, aggiunto `slide-out-to-bottom-4` sullo stato chiuso, durata `duration-300` in entrata e `duration-200` in uscita, easing morbido.
- Overlay: mantiene la dissolvenza, allineata alle stesse durate.
- Variante `motion-reduce` per annullare la traslazione.
- Nessun cambio di logica, dati o schema.
