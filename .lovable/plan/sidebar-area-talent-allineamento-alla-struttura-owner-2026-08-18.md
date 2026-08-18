# Sidebar area talent: allineamento alla struttura owner

Obiettivo: la sidebar dell'area talent adotta la stessa struttura/gerarchia della sidebar owner, mantenendo la palette chiara attuale (sfondo bianco/crema, testo scuro, attivo bordeaux). Le notifiche passano dal popup in alto a una voce nel footer che apre una pagina dedicata.

## 1. Struttura sidebar (chiara)

- Header: logo (versione scura attuale) + etichetta testuale accanto in Tenor Sans, uppercase, tracking largo, colore attenuato — come "ADMIN" in owner, qui "Talent".
- Nav principale invariata nelle voci (Home, Profilo, I miei casting, Messaggi), stessa spaziatura e dimensione icone della owner.
- Footer, nello stesso ordine della owner:
  1. divider
  2. blocco account: avatar grande + nome e cognome su due righe, Tenor Sans 15px uppercase regular (colore scuro)
  3. voce "Notifiche" con badge contatore non lette
  4. voce "Impostazioni"
  5. pulsante "Esci"
- Larghezza ridimensionabile con drag (stesso range e indicatore pill dell'owner) e reset al doppio click, riusando l'hook di larghezza esistente; la larghezza minima resta quella attuale (256px) così il layout non cambia di default.
- Nessuna sezione "Preferiti": non esiste un equivalente per i talent.

## 2. Notifiche come pagina

- Nuove rotte `/talent/notifications` (lista cronologica) e `/talent/notifications/:id` (dettaglio), con la stessa impaginazione e gli stessi stati delle pagine owner.
- Rimozione della campanella popup dall'header della sidebar talent; il conteggio non letto compare come badge sulla voce di footer.

## Dettagli tecnici

- `src/components/layout/TalentSidebar.tsx`: riscrittura del markup sullo schema di `OwnerSidebar.tsx`, usando le classi chiare `dc-sidebar-*` (non le `dc-sidebar-admin-*`); rimozione di `NotificationBell`.
- `src/index.css`: eventuali classi mancanti nella variante chiara (voce nav footer con badge, blocco utente) aggiunte accanto alle `dc-sidebar-*` esistenti, senza toccare le varianti admin.
- Pagine notifiche talent: estrazione della UI comune da `OwnerNotifications.tsx` / `OwnerNotificationDetail.tsx` in componenti condivisi, o pagine talent parallele che riusano gli hook di `useNotifications`; link di dettaglio adattati alle rotte `/talent/...`.
- `src/App.tsx`: registrazione delle due nuove rotte sotto `TalentLayout`.
- `TalentLayout.tsx`: `left-64` fisso sostituito da un offset legato alla larghezza della sidebar, come in `OwnerLayout.tsx`.
- Nessuna modifica a schema DB, RLS o logica notifiche.
