# Striscia video nella metà sinistra della modale di dettaglio talent

Aggiungo i video del talent (fino a tre: Presentazione, Showreel, Altri video) al pannello sinistro della modale a tutta pagina, sotto gli indicatori a pallini del carosello foto. La metà destra e la barra di navigazione in alto a destra non vengono toccate.

## 1. Dati

- La modale legge i media con l'hook "lite" per profilo, che oggi non porta la categoria: aggiungo `category` alla select così i video possono essere etichettati.
- Ricavo l'elenco video filtrando `media_type = "video"`, ordinati come già avviene per `sort_order`.
- Le etichette derivano dalla categoria tramite la mappa già esistente delle categorie media, in forma breve: Presentazione, Showreel, Altri video.

## 2. Striscia anteprime

- Compare solo se esiste almeno un video: nessun segnaposto, nessuna intestazione vuota.
- Una tessera per video: fotogramma di anteprima (thumbnail salvata; in mancanza, il primo fotogramma senza precaricare il file), contrassegno di riproduzione sovrapposto al centro, etichetta categoria sotto.
- La tessera del video aperto resta evidenziata (bordo/contorno di stato attivo, coerente con il design system).

## 3. Comportamento del pannello sinistro

- Stato locale "video aperto": quando è attivo, il video sostituisce l'immagine nella stessa area, mantenendo le proporzioni native (contain, bande dove serve) e senza ritaglio 2:3.
- Sopra l'area compare il rimando "Torna alle foto", che chiude il video e riporta il carosello all'ultima foto visualizzata (l'indice foto non viene azzerato).
- Con video aperto, le frecce laterali e i pallini del carosello non sono attivi/visibili; tornano appena si rientra nelle foto.
- Nessun autoplay, nessun audio automatico: il video parte solo su azione esplicita dell'utente (controlli nativi).
- `preload="none"` più `poster` con l'anteprima: il file completo si scarica solo alla riproduzione.

## 4. Tastiera

- Con le foto attive: le frecce continuano a scorrere il carosello come oggi.
- Con un video aperto: le frecce non fanno più avanzare la galleria e passano al controllo della riproduzione (avanti/indietro nel tempo del video).
- Il cambio talent o la chiusura della modale riportano allo stato foto.

## Note tecniche

- File modificati: `src/components/talents/detail/TalentDetailModal.tsx` (UI e stato), `src/hooks/useTalentMediaByProfileId.ts` (aggiunta `category` alla select).
- Etichette brevi mappate dalle chiavi `intro_video`, `showreel`, `other_videos`.
- Nessuna migrazione, nessuna modifica allo schema o alle policy.
