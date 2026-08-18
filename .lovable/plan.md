# Dimensioni proporzionali del carosello nella modale di dettaglio talent

Rendo la zona immagini della modale `TalentDetailModal` scalabile in modo proporzionale rispetto alla larghezza del viewport, eliminando il cap fisso in pixel che la rende piccola su schermi grandi. Su mobile e tablet la modale passa da layout a due pannelli fissi a colonna unica scrollabile.

## 1. Carousel foto

- Sostituisco l'attuale `height: min(600px, 58.6vh)` con dimensioni basate su percentuali/vw.
- Mantengo il rapporto d'aspetto 2:3.
- L'immagine principale si dimensiona in larghezza con `vw` e/o percentuali, e l'altezza deriva dall'aspect-ratio.
- Su mobile/tablet la larghezza si adatta al viewport, mantenendo margini laterali.
- Imposto un `max-width` e `max-height` ragionevoli per evitare che su schermi ultra-wide l'immagine diventi sproporzionatamente grande.

## 2. Layout responsive della modale

- Su desktop (`lg:`): resta il layout a due metà — carosello fisso a sinistra e dettagli scrollabili a destra.
- Su mobile e tablet (sotto `lg`): il pannello immagini non è più fisso; la modale diventa una colonna unica scrollabile e il carosello scorre insieme ai dati del talento.
- Il container principale acquisisce `overflow-y-auto` sotto `lg`, mentre il pannello dati perde il proprio scroll interno in favore dello scroll globale.
- La barra di navigazione rimane fissa in alto a destra anche in colonna, per permettere la chiusura rapida.

## 3. Verifica responsive

- Controllo con screenshot su viewport desktop largo e mobile/tablet che:
  - il carosello cresca proporzionalmente senza troncamenti o overflow;
  - la colonna unica mobile scorra correttamente con il carosello in cima;
  - il pulsante "Scarica PDF" e le sezioni dati siano leggibili.

## Note tecniche

- File modificato: `src/components/talents/detail/TalentDetailModal.tsx`.
- Nessuna nuova dipendenza.
- Uso solo classi Tailwind e CSS inline per `aspect-ratio`.
