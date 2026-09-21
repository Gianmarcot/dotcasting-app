# Entrata più lenta e visibile per le modali media

## Cosa cambia per l'utente

Nelle finestre "Le mie foto" e "Tutti i video":

- L'apertura diventa chiaramente percepibile: la finestra sale dal bordo inferiore dello schermo con una corsa lunga e una durata di circa 500 ms, con un rallentamento morbido finale.
- Il velo scuro dietro compare un po' prima e più gradualmente (circa 400 ms), così si vede la pagina sottostante oscurarsi mentre la finestra sale.
- La chiusura resta rapida (circa 250 ms), con la finestra che scende e il velo che svanisce.

Con la preferenza di sistema "movimento ridotto" resta solo una breve dissolvenza.

## Note tecniche

- Unico file: `src/components/profile/v2/photos/MediaGalleryModal.tsx`.
- Sostituzione delle utility `slide-in-from-bottom-*` con un keyframe dedicato (`slide-up-panel`) aggiunto a `tailwind.config.ts`: da `translateY(100%)` + opacità 0 a posizione naturale, durata 500 ms, easing `cubic-bezier(0.16,1,0.3,1)`; uscita con `slide-out-to-bottom-8` e `duration-[250ms]`.
- Overlay: `duration-[400ms]` in entrata, `duration-[250ms]` in uscita.
- `motion-reduce` continua ad annullare la traslazione.
- Nessun cambio di logica, dati o schema.
