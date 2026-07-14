## Aggiornamenti pagina dettaglio casting

Solo UI/presentazione. Nessun cambio di schema.

### 1. `src/pages/owner/OwnerCastingDetail.tsx` — header

- Titolo: da `text-4xl` a `text-3xl` (H1), stellina preferiti resta a sinistra.
- Nuovo paragrafo con `casting.description` (se presente) sotto il titolo, `text-muted-foreground max-w-3xl`, prima della riga metadati.
- Riga metadati:
  - Pill stato: mantenere il Popover funzionante ma aggiungere `ChevronDown` come indicatore a destra dell'etichetta.
  - Range date: sostituire `Calendar` con `Clock`.
  - Budget: sostituire `Euro` con `Wallet`.
  - Aggiungere `<hr />` (border-border) subito sotto la riga metadati.
- Pulsante "Modifica": passare da `variant="ghost"` a `variant="secondary"` (DS).
- In fondo alla pagina, sotto la sezione Ruoli, aggiungere link testuale rosso "Elimina casting" con icona `Trash2` (usa `useDeleteCasting`, con `AlertDialog` di conferma, redirect a `/owner/castings`).

### 2. `src/components/castings/rounds/RoleRoundsCompartment.tsx` — header ruolo

- Sottotitolo: costruire stringa estesa "{Gender} • {min} – {max} anni", rimuovere location e budget.
  - Mappa gender: `male → Maschio`, `female → Femmina`, `other → Altro` (fallback: valore raw).
- Aggiungere linea divisoria (`<div class="border-t border-border/60" />`) fra header ruolo e tabella invii.
- Cambiare hover del box tratteggiato "+ Aggiungi invio": `hover:border-[#1a1a1a]` (rimuovere `hover:border-primary/40`).

### 3. `src/components/castings/rounds/RoleRoundRow.tsx` — riga invio

- Aggiungere icona `Folder` (`h-5 w-5 text-muted-foreground shrink-0`) prima del label del round.
- Colonna Stato: sostituire `Badge` colorata con testo + icona `CheckCheck`:
  - `shared` + `hasClientSelection` (almeno un `role_talents.company_status === "confirmed"` nel round): testo "Selezionati" + `CheckCheck` verde (`text-[hsl(var(--success))]`).
  - `shared` senza selezione cliente: testo "Condiviso" + `CheckCheck` grigio (`text-muted-foreground`).
  - Non condiviso: solo testo "Non condiviso" `text-muted-foreground`, nessuna icona.
- Per sapere se il cliente ha selezionato, estendere `useRoundPreviewPhotos` (o passare un prop `hasClientSelection`) — dettaglio tecnico sotto.

### Dettagli tecnici

- Verificare la struttura del prop `preview` in `useRoundPreviewPhotos`: se non contiene già l'info di conferma cliente, aggiungere un campo `hasClientSelection: boolean` calcolato dalla presenza di almeno un `role_talents.company_status = 'confirmed'` associato al round (via `casting_round_talents` / vista già in uso).
- Nessuna migration richiesta: `castings.description`, `role_talents.company_status`, `casting_rounds.status` esistono già.
- Riutilizzare `useDeleteCasting` esistente per il link "Elimina casting".

### Fuori scope

- Nessuna modifica al Design System in questa iterazione (il pattern `RoleRoundRow` nel DS resterà con l'estetica corrente finché non confermi di volerlo aggiornare in parallelo).
