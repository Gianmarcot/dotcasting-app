# Transizioni smooth nella modale di dettaglio talent

Aggiungo due movimenti alla modale `TalentDetailModal`: apertura/chiusura morbide e scorrimento fluido del carosello foto. Solo presentazione, nessun cambio di dati o logica.

## 1. Apertura e chiusura della modale

- Overlay: dissolvenza in entrata e in uscita.
- Pannello: dissolvenza abbinata a una leggera salita (pochi pixel) in entrata, movimento inverso in uscita.
- Le animazioni sono agganciate allo stato aperto/chiuso di Radix, così anche la chiusura viene animata invece di sparire di colpo.
- Durata contenuta (circa 250-300 ms) con easing morbido, in linea con il resto dell'app.
- La barra di navigazione in alto a destra entra con la stessa dissolvenza del pannello, senza sfasature.

## 2. Scorrimento del carosello

- Le foto passano da comparsa istantanea a scorrimento orizzontale continuo: la striscia di immagini si trasla e la foto corrente si allinea al centro, con easing morbido (circa 400 ms).
- Vale sia per le frecce laterali, sia per i pallini indicatori, sia per le frecce da tastiera.
- I pallini indicatori animano il cambio di colore/dimensione durante la transizione.
- Le frecce e i pallini hanno un feedback hover/press più fluido (transizione di opacità).
- Passando da un talent all'altro il carosello riparte dalla prima foto senza animazione di scorrimento residua.

## 3. Rispetto delle preferenze di accessibilità

Se il sistema dell'utente richiede movimento ridotto, le animazioni vengono ridotte a semplici dissolvenze molto brevi, mantenendo la funzionalità invariata.

## Note tecniche

- File modificato: `src/components/talents/detail/TalentDetailModal.tsx` (più `src/components/ui/modal-nav-bar.tsx` solo per la transizione di opacità dei pulsanti).
- Le animazioni di apertura/chiusura usano le utility `data-[state=open]` / `data-[state=closed]` del plugin `tailwindcss-animate` già presente nel progetto, quindi nessuna nuova dipendenza e nessun keyframe extra da aggiungere alla configurazione.
- Il carosello passa da rendering della singola foto a una traccia con tutte le foto e `translateX` calcolato sull'indice corrente, con `transition-transform`; ogni foto resta in proporzione 2:3 con la stessa altezza attuale.
- La regola di movimento ridotto viene gestita con la variante `motion-reduce` di Tailwind, senza toccare i token globali.
