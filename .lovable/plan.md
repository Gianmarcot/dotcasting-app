## Obiettivo

Spostare le notifiche dalla parte alta della sidebar Owner alla zona in basso (vicino a Impostazioni) e trasformarle da popup in una pagina dedicata con lista cronologica e dettaglio della singola notifica.

## Modifiche

### 1. Nuova rotta `/owner/notifications`
- Aggiungere in `src/App.tsx` la rotta `notifications` dentro il blocco `/owner` (protetta, dentro `OwnerLayout`).
- Aggiungere anche `notifications/:notificationId` per il dettaglio.

### 2. Nuova pagina `src/pages/owner/OwnerNotifications.tsx`
- Lista cronologica (più recenti in alto) di tutte le notifiche dell'utente, usando `useNotifications()` esistente (nessuna modifica al data layer).
- Layout in stile editoriale coerente col resto del backoffice: titolo "Notifiche", contatore non lette, pulsante "Segna tutte come lette".
- Raggruppamento per data (Oggi / Ieri / Questa settimana / Più vecchie).
- Ogni riga: icona tipo, titolo, descrizione, timestamp relativo, dot "non letta". Click sulla riga → naviga a `/owner/notifications/:id` e marca come letta.
- Stato vuoto e stato loading (skeleton).

### 3. Nuova pagina dettaglio `src/pages/owner/OwnerNotificationDetail.tsx`
- Mostra una singola notifica: icona + titolo grande, timestamp completo (data/ora), tipo, descrizione/payload formattato in modo leggibile (chiave/valore per i campi noti del `payload_json`).
- Pulsante "Indietro" verso `/owner/notifications`.
- Se la notifica ha un riferimento azionabile nel payload (es. `casting_id`, `thread_id`), mostrare un pulsante CTA che porta alla risorsa relativa. Solo se il payload lo contiene — nessuna logica nuova lato dati.
- Marca automaticamente come letta all'apertura.

### 4. Sidebar Owner (`src/components/layout/OwnerSidebar.tsx`)
- Rimuovere `<NotificationBell />` dall'header in alto.
- Nel blocco footer (sotto il divider, sopra Impostazioni) aggiungere una voce di navigazione "Notifiche" con icona `Bell`, link a `/owner/notifications`, con badge contatore non lette accanto al label (riusando `useUnreadNotificationsCount`).
- Stessa stilistica di "Impostazioni" (active/inactive).

### 5. Mobile (solo se rilevante)
- `MobileHeader` / `MobileBottomNavOwner`: se mostrano la bell come popover, sostituire con link alla pagina `/owner/notifications`. Da verificare in build mode e adeguare in modo minimale.

## Cosa NON cambia
- `useNotifications`, `useMarkNotificationAsRead`, `useMarkAllNotificationsAsRead`: invariati.
- Componente `NotificationBell` resta nel codebase ma non più montato nella sidebar Owner (può essere rimosso in seguito se non più usato altrove).
- Nessuna modifica DB, RLS, edge functions, i18n core.
- Lato Talent: nessuna modifica (richiesta riguarda backoffice Owner).

## Dettagli tecnici
- Titoli/descrizioni notifica: riusare le funzioni `getNotificationTitle` / `getNotificationDescription` estraendole da `NotificationBell.tsx` in un piccolo helper `src/lib/notifications.ts` per condividerle tra lista e dettaglio.
- Stile coerente con `.dc-card`, Tenor Sans per heading, DM Sans body, palette esistente.
