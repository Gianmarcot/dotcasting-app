# Selezione cliente su /round/:token

Refactor della sola UI/UX pubblica del round. La RPC `confirm_round_selection` resta invariata: tutte le selezioni sono locali finché il cliente non preme "Conferma selezione" e inserisce la password.

## Obiettivi

- Pagina autoesplicativa per un cliente non tecnico, spesso da mobile.
- Distinzione netta tra "apri/ispeziona" e "conferma/seleziona": mai lo stesso tap fa entrambe le cose nella stessa modalità.
- Conferme reversibili finché il round è l'ultimo.

## Layout

### Header (sempre visibile, sticky in alto)
- Logo + nome agenzia da `branding` (payload RPC).
- Titolo: "Casting · Ruolo" su una riga; sotto, etichetta del round in caps discreto.
- Riga istruzione esplicita in bordeaux chiaro: "Seleziona i talent che vuoi confermare."
- Sotto-nota piccola: "Potrai modificare la selezione finché il round è attivo."
- A destra (o sotto su mobile): toggle "Seleziona / Fine" (vedi modalità).

Quando la modalità selezione è attiva, l'header cambia chiaramente:
- Sfondo header passa a bordeaux tenue (`#A30A2B`/10), comparsa di un chip "Modalità selezione" + bottone "Fine".

### Galleria
- Griglia foto-first: 2 col mobile, 3 tablet, 4 desktop (più densa di oggi per scansione rapida).
- Card foto formato 5:7 (era 3:4). Placeholder beige + iniziali del nome quando manca la foto.
- Sotto la foto solo: nome + città. Nessun blocco attributi inline (sposta nel dettaglio).
- Card già confermate al caricamento: già spuntate localmente (come oggi via `useEffect` su `company_status === 'confirmed'`).
- Indicatori visivi selezione: bordo bordeaux 2px + check verde (#729128) in alto a destra + leggero overlay scuro 5% sulla foto. Badge testuale "Confermato" solo in modalità selezione.

### Modalità di interazione

Stato locale `mode: 'browse' | 'select'`, default `browse`.

- Modalità `browse` (default):
  - Tap card → apre `TalentDetailSheet` (Sheet shadcn, full-screen su mobile, side-sheet su desktop).
  - Nessun checkbox visibile sulle card; solo il bordo/check se già selezionato (per non perdere il riscontro visivo).
  - Dentro il dettaglio: galleria foto completa (carosello), dati anagrafici + attributi + città, link PDF.
  - In fondo al dettaglio: toggle grosso "Conferma questo talent / Rimuovi dalla selezione" (aggiorna solo lo stato locale). Niente conferma server qui.
  
- Modalità `select` (attivata dal toggle "Seleziona" in header):
  - Tap card → toggle immediato della selezione, niente Sheet.
  - Tap target generosi, hit-area su tutta la card.
  - Le card mostrano sempre un checkbox in alto a sinistra (vuoto / pieno bordeaux con check bianco).
  - Pulsante "Fine" per uscire dalla modalità.

Se `selectable` è false (vedi sotto): il toggle modalità non compare; il tap apre comunque il dettaglio in read-only (senza il toggle di conferma).

### Barra azione (selezione)
- Visibile solo se `selectable === true` e ci sono talent.
- Mobile: fissa in basso, full-width, safe-area inset bottom.
- Desktop: floating pill centrata in basso (max-w-md), shadow elegante.
- Contenuto: contatore "N selezionati" (o "Nessuno selezionato") + bottone "Conferma selezione".
- Disattivata se la selezione coincide esattamente con i `confirmed` correnti dal server (niente cambi da inviare); tooltip "Nessuna modifica da confermare".

### Dialog password
- Titolo: "Conferma selezione".
- Testo: "Inserisci la password che ti abbiamo comunicato. Confermerai N talent. I non selezionati saranno marcati come scartati. Potrai modificare la selezione finché il round è attivo."
- Input password (autoFocus su desktop, no autoFocus su mobile per evitare tastiera fuori posto).
- Errore generico "Password non corretta" (nessun dettaglio). Mappatura errori RPC invariata.
- Successo: toast + chiusura dialog + refetch payload. Stato resta modificabile.

### Round non più l'ultimo (`is_latest_round === false`)
- Banner gentile in cima alla galleria: "Questa selezione è chiusa. È disponibile una versione più recente. Contatta l'agenzia per il link aggiornato."
- Galleria read-only: nessun toggle "Seleziona", nessuna barra azione, nessun checkbox.
- Tap card apre il dettaglio in sola lettura, con badge "Confermato"/"Scartato" sulle card e nel dettaglio.

## Dettaglio tecnico

### File toccati
- `src/pages/shared/SharedRound.tsx` — riscrittura del layout della pagina con header sticky, gestione `mode`, e wiring con i due nuovi componenti.
- `src/pages/shared/_TalentTile.tsx` (nuovo, locale alla pagina shared) — tile compatta foto-first 5:7, nome+città, indicatori selezione, no attributi inline, no bottone PDF (spostato nel dettaglio).
- `src/pages/shared/_TalentDetailSheet.tsx` (nuovo, locale) — Sheet con carosello foto (riusa estetica `TalentCardWeb` per pannello dati e tipografia), attributi, bottone PDF (chiama `get-round-pdf-url`), toggle conferma locale.

Nessun cambio a hook, RPC, edge function, schema, o componenti condivisi.

### Stato locale in `SharedRound`
- `selected: Set<string>` (esistente).
- `initialConfirmed: Set<string>` — derivato dal payload, usato per il diff "ci sono modifiche da inviare?".
- `mode: 'browse' | 'select'` (nuovo).
- `detailId: string | null` (nuovo) — id del role_talent aperto nel Sheet.
- `pwdOpen`, `password` (esistenti).

### Comportamento del tap (riepilogo)
| `selectable` | `mode`  | Tap card                |
|--------------|---------|-------------------------|
| true         | browse  | apre Sheet              |
| true         | select  | toggle selezione        |
| false        | —       | apre Sheet read-only    |

### Stile
- Palette esistente: bg `#F5F0E8`, bordeaux `#A30A2B`, verde `#729128`, charcoal `#1A1A1A`. Tipografia `font-tenor` (titoli caps) / `font-dm` (corpo).
- Nessuna nuova dipendenza. Uso `Sheet`, `Button`, `Dialog`, `Input`, `Label` già presenti.

### Fuori scope
- Nessuna modifica a `confirm_round_selection`, `get_shared_round`, edge functions, o policy.
- Niente verifica password lato client.
- Niente cambi al comportamento del round congelato a parte la rimozione della selezione e l'aggiunta del banner.
