# Corsa più lunga e velo scuro dietro le modali media

## Cosa cambia per l'utente

Nelle finestre "Le mie foto" e "Tutti i video" del profilo talent:

1. La finestra sale da più in basso: la corsa passa da poco a un movimento più ampio e percepibile, sempre rapido (circa 350 ms).
2. Mentre sale, dietro compare un velo scuro sulla pagina sottostante, con una leggera sfocatura: nei primi istanti si intravede la pagina che si oscura, poi la finestra la copre. In chiusura il velo svanisce mentre la finestra scende.

Con la preferenza di sistema "movimento ridotto" resta solo la dissolvenza, senza scorrimento.

## Note tecniche

- Unico file: `src/components/profile/v2/photos/MediaGalleryModal.tsx` (modale condivisa foto/video).
- Overlay: da `bg-card` pieno a un velo scuro semi-trasparente (`bg-foreground/50` con `backdrop-blur-sm`), dissolvenza in entrata/uscita allineata alle durate.
- Content: `slide-in-from-bottom-8` → `slide-in-from-bottom-24`, uscita `slide-out-to-bottom-8`, durata entrata `duration-[350ms]`, uscita `duration-200`, easing morbido già presente. Resta `bg-card` a pieno schermo.
- Variante `motion-reduce` mantenuta per annullare la traslazione.
- Nessun cambio di logica, dati o schema.
