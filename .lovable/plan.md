# Dimensioni proporzionali del carosello nella modale di dettaglio talent

Rendo la zona immagini della modale `TalentDetailModal` scalabile in modo proporzionale rispetto alla larghezza del viewport, eliminando il cap fisso in pixel che la rende piccola su schermi grandi.

## 1. Carousel foto

- Sostituisco l'attuale `height: min(600px, 58.6vh)` con dimensioni basate su percentuali/vw.
- Mantengo il rapporto d'aspetto 2:3.
- L'immagine principale si dimensiona in larghezza con `vw` e/o percentuali, e l'altezza deriva dall'aspect-ratio.
- Su mobile/tablet la larghezza si adatta al viewport, mantenendo margini laterali.
- Imposto un `max-width` e `max-height` ragionevoli per evitare che su schermi ultra-wide l'immagine diventi sproporzionatamente grande.

## 2. Pannello laterale dati

- Verifico che il pannello destro conservi lo scroll corretto e non venga schiacciato dal carosello più grande.
- Le spaziature interne (margini/padding) vengono lasciati invariati.

## 3. Verifica responsive

- Controllo con screenshot su viewport desktop largo e mobile che il carosello cresca proporzionalmente senza troncamenti o overflow.

## Note tecniche

- File modificato: `src/components/talents/detail/TalentDetailModal.tsx`.
- Nessuna nuova dipendenza.
- Uso solo classi Tailwind e CSS inline per `aspect-ratio`.
