## Fix Pagina Cliente (`/round/:token`)

Modifiche solo a `src/pages/shared/SharedRound.tsx`.

### 1. Drawer → Modale centrata
- Sostituire `Sheet/SheetContent` con `Dialog/DialogContent` per i dettagli talent.
- Dimensioni: `max-w-4xl w-[95vw] max-h-[90vh]`, contenuto interno scrollabile, angoli `rounded-3xl`, sfondo cream `#F5F0E8`.
- Header sticky con nome talent + azioni (PDF, chiudi).
- Footer sticky interno (non più `fixed`) con il CTA Seleziona/Rimuovi quando `selectable`.
- Griglia foto: passare a `grid-cols-2 md:grid-cols-3` per sfruttare la larghezza.

### 2. Pulsante "Dettagli" primario
- Sulla tile, sostituire il link testuale bordeaux con un `Button` pieno bordeaux a pill: `bg-[#A30A2B] text-white hover:bg-[#850822] rounded-full` con icona `Eye`, label "Vedi dettagli", `flex-1` per occupare la riga.
- Il bottone Download PDF resta come icon-button a fianco (stile invariato).

### 3. Etichetta "Selezionato" più visibile e ricollocata
- Spostare la `SelectedPill` dall'angolo in alto a destra ad accanto alla spunta in alto a sinistra (stesso contenitore flex già esistente).
- Cambiare lo stile in pill ad alto contrasto: `bg-white text-[#A30A2B] shadow-sm` (sfondo pieno chiaro, leggibile su qualsiasi foto).
- Rimuovere l'icona `Check` dalla pill (la spunta circolare a sinistra è già visibile → no ridondanza).
- L'angolo in alto a destra mostra ora solo lo `StatusPill` (confermato/scartato) quando applicabile.

### 4. Coerenza etichette nel detail modal
- Nell'header della modale rimuovere `StatusPill` (che mostrava "Confermato"/"Scartato" — stato lato agenzia, fuori contesto per il cliente).
- Mantenere solo `SelectedPill` quando `selectable && selected`. Se non selezionato, nessuna pill.

### Out of scope
- Nessun cambio a backend, RPC, edge functions, altre pagine.
