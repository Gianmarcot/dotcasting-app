Due fix al `TalentDetailSheet` in `src/pages/shared/SharedRound.tsx`:

1. **Hero image sempre 5:7 verticale, senza lightbox**
   - Sostituire il wrapper `flex items-center justify-center` + `object-contain` con un contenitore `aspect-[5/7]` centrato (`max-h-full`, `mx-auto`) contenente `<img className="w-full h-full object-cover rounded-2xl" />`.
   - Rimuovere lo stato `lightbox`, la `<button onClick={setLightbox}>` intorno all'immagine (torna a `<div>`) e l'intero blocco `{lightbox && ...}` in fondo al componente. Rimuovere anche `Maximize2` dall'import se non più usato.

2. **Doppio "Chiudi"**
   - `DialogContent` di shadcn renderizza già una `×` in alto a destra. Il pulsante `×` custom nell'header è duplicato → rimuoverlo (mantenere solo il pulsante "Scarica PDF" nel cluster azioni).

Fuori scope: nessuna modifica a dati, layout header/strip, colonna info, footer.