# Variante "Chiudi" della barra modale

Aggiungere alla barra scura di chiusura usata nelle finestre a tutto schermo una variante con la scritta "Chiudi" accanto alla X, come nell'immagine allegata.

## Comportamento

- Nuova opzione `showCloseLabel` sul componente della barra (default disattivata: nessuna schermata attuale cambia aspetto).
- Quando attiva: pill scura con testo "Chiudi" a sinistra e icona X a destra, entrambi cliccabili come un unico pulsante.
- Padding asimmetrico per bilanciamento ottico: 32px sul lato del testo, 16px sul lato dell'icona.
- Nessuna modifica alle frecce avanti/indietro: se presenti restano prima del divisore.

## Dettagli tecnici

- File: `src/components/ui/modal-nav-bar.tsx`
- Prop `showCloseLabel?: boolean`; con label attiva il contenitore usa `pl-8 pr-4` invece di `p-4`, e il close diventa un unico `button` con testo (DM Sans, `text-sm`, bianco) + icona, stessi stati hover/active esistenti.
- `aria-label` resta su `labels.close`; il testo visibile è `aria-hidden` per evitare doppia lettura.
- Aggiungere l'esempio della nuova variante nella sezione ModalNavBar di `src/pages/DesignSystem.tsx`.
- Attivare la variante nelle finestre foto e video del profilo talent (`src/components/profile/v2/photos/MediaGalleryModal.tsx`), lasciando invariata la barra della scheda talent.
