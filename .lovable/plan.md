# Griglia invii: 2 colonne, altezze uniformi, miniature contenute

## Obiettivo
- La griglia invii resta a 2 colonne su desktop (1 su mobile), niente masonry.
- Tutte le schede invio e la cella "Aggiungi invio" hanno la STESSA altezza, indipendentemente dal numero di talent.
- Le miniature non sfondano più la card e il footer "N talent · data" resta sotto le foto senza sovrapposizioni.

## Cosa cambia

### 1) `RoleRoundsCompartment.tsx` (griglia)
- Mantieni `grid grid-cols-1 sm:grid-cols-2 gap-4`.
- Aggiungi `auto-rows-fr` così tutte le celle della stessa riga stirano alla stessa altezza.
- La cella "Aggiungi invio": rimuovi `h-44` e aggiungi `h-full min-h-44` per adattarsi all'altezza della scheda accanto, mantenendo un'altezza minima sensata anche quando è da sola.

### 2) `RoundFolderCard.tsx` (singola scheda)
Il problema attuale: la card ha `h-44` (176px) e la striscia foto ha celle con `aspect-ratio: 5/7` larghe 1/5 della card. Con 2 colonne le card sono più larghe (~380–460px), quindi ogni cella diventa ~106–129px di altezza e va in overflow sopra il footer.

Soluzione: fissare l'altezza della striscia miniature a quella di una riga piena da 5 thumbnail.

- Rimuovi `h-44` dalla card; l'altezza diventa intrinseca (header + striscia + footer) ed è la stessa per tutte perché la striscia ha aspect fisso.
- Striscia foto: container con `w-full aspect-[25/7] overflow-hidden` (≈ 5 celle 5/7 affiancate). Imposta `items-stretch` invece di `items-start` e rimuovi `min-h-0`.
- Celle (thumbnail, placeholder iniziali, badge `+N`): mantieni `aspectRatio: 5/7` e `flex: 0 0 calc((100% - (cellCount-1)*4px) / 5)`. Aggiungi `h-full` così rimangono allineate all'altezza della striscia; le celle "vuote" semplicemente non esistono e la card con 1 thumbnail mostra la miniatura a sinistra e spazio bianco a destra — l'altezza della striscia non cambia.
- Caso `total === 0`: il placeholder "Nessun talent" prende `w-full h-full` dentro la striscia (rimuovi `aspectRatio` su quel singolo elemento, eredita l'altezza dal container).
- Footer: rimane com'è (`mt-auto ...`). Con la striscia ad altezza fissa, sta sempre sotto le foto.

## Dettagli tecnici

Aspect ratio della striscia: 5 celle 5/7 affiancate → larghezza:altezza ≈ (5 · 5) / 7 = 25/7. Usiamo `aspect-[25/7]`, approssimazione corretta (i 4×4px di gap sono trascurabili al variare della larghezza e non causano overflow perché le celle hanno `flex-basis` calcolato sul gap reale).

Risultato: tutte le schede invio hanno la stessa altezza (header fisso + striscia ad aspect costante + footer fisso). La cella tratteggiata "Aggiungi invio" si stira con `h-full` grazie a `auto-rows-fr` sulla griglia.

## File toccati
- `src/components/castings/rounds/RoleRoundsCompartment.tsx` — aggiungi `auto-rows-fr` alla griglia; cambia classi del bottone "Aggiungi invio".
- `src/components/castings/rounds/RoundFolderCard.tsx` — rimuovi `h-44`, imposta aspect fisso sulla striscia foto, adatta placeholder vuoto.

Nessuna modifica a logica, dati o altri componenti.
