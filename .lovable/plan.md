# Salvataggio automatico della valutazione foto

## Cosa cambia per l'utente
- Stelle e tag si salvano subito quando li cambi.
- Le note private si salvano da sole circa 0,8 secondi dopo che smetti di scrivere, oppure appena esci dal campo.
- Il pulsante "Salva valutazione" e l'icona di salvataggio nella versione compatta spariscono.
- Al posto del pulsante compare un piccolo stato discreto: "Salvataggio…" e poi "Salvato". Non ci sono più notifiche "Valutazione salvata" a ogni modifica; resta solo una notifica di errore se il salvataggio fallisce.
- Se passi a un'altra foto o chiudi il lightbox mentre una nota è in attesa di salvataggio, viene salvata comunque, sulla foto giusta.

## Dettagli tecnici
- `MediaRatingPanel.tsx`: una funzione `persist(next)` chiama `saveRating` con `mediaId` più rating/tag/note.
  - Rating e tag: `persist` immediato dentro gli handler.
  - Note: debounce di 800ms con `useRef` per il timer, flush su `onBlur`.
  - Flush nel cleanup dell'effetto legato a `mediaId` e all'unmount, usando un ref che conserva i valori e il mediaId in attesa, così il salvataggio non finisce sulla foto sbagliata.
  - `onSaved` viene chiamato al successo. Toast solo in caso di errore.
- Rimuovere `hasChanges`, i due pulsanti Salva e l'import `Save`; aggiungere la riga di stato (`text-xs text-muted-foreground`) usando `isSaving` e un flag `savedOnce`.
- Verifica con Playwright: cambiare le stelle, ricaricare e controllare che il valore sia persistito; scrivere una nota, cambiare subito foto, tornare indietro e controllare che la nota sia salvata.
