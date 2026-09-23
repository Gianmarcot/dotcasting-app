# Pulsante "Indietro" nelle finestre foto e video

## Cosa cambia

Nella finestra di gestione foto e in quella dei video, il pulsante nero per uscire si sposta da in alto a destra a **in alto a sinistra**, e diventa una freccia verso sinistra seguita dal testo **"Indietro"** (come nel riferimento allegato). Il comportamento resta identico: chiude la finestra e riporta al profilo.

Il resto del contenuto della finestra resta com'è, con lo spazio in alto adattato: oggi il titolo "FOTOGRAFIE" lascia spazio libero a destra per il pulsante, ora lo spazio serve a sinistra.

## Dettagli tecnici

- `src/components/ui/modal-nav-bar.tsx`: aggiunta variante `backLabel` (o `variant="back"`) che mostra `ArrowLeft` a sinistra + testo a destra, padding 16px lato icona / 32px lato testo (specchiato rispetto a `showCloseLabel`), gap-2, stesso pill `#0f0f0f`, stesso hover/active e `aria-label`.
- `src/components/profile/v2/MediaGalleryModal.tsx`: `ModalNavBar` passa alla nuova variante con etichetta "Indietro" e `className="fixed left-8 top-8 z-10"`; rimosso `pr-20` dal blocco titolo (sostituito da padding a sinistra solo se necessario per non finire sotto il pill).
- Nessuna modifica a logica media, dati o altre modali (anteprima profilo e dettaglio talent restano con la X).

## Design System

Aggiunto un esempio della nuova variante nella sezione ModalNavBar di `/design-system`.
