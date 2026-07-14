
# Riorganizzazione dettaglio casting

Solo UI/presentazione, nessuna modifica di schema o logica dati.

## 1. Header pagina (`OwnerCastingDetail.tsx`)

Layout editoriale come da mock:

- Breadcrumb "← Tutti i casting" (ghost sm, come ora).
- Riga titolo: `FavoriteCastingStar` + `h1` in `font-display uppercase text-4xl` (Tenor Sans) col titolo casting.
- A destra della riga titolo, due azioni allineate a destra: `Modifica` (ghost md, icona a sx) e `Nuovo ruolo` (primary md, icona a sx). Usa le varianti del DS.
- Metadata row sotto il titolo, in `text-sm text-muted-foreground`, separati da `·`: Badge stato + budget + `locations` + date. Rimuovi il nome company come blocco separato (accorpalo alla stessa riga se presente).
- Il `Select` di cambio stato inline sparisce. Il badge stato diventa un `Popover` cliccabile: al click apre un piccolo menu con `Bozza / Attivo / Archiviato` che chiama `handleStatusChange`.

## 2. Sezione RUOLI

- Titolo sezione: `h2` "RUOLI" in `font-display uppercase tracking-wider text-sm text-muted-foreground` (etichetta editoriale).
- Rimuovi bottone full-width "Aggiungi ruolo" in fondo (la CTA è già in header).
- Per ogni ruolo, una card `dc-card p-6 space-y-4`:
  - Header ruolo: nome ruolo `font-display uppercase text-2xl` + specs (`gender · age · budget · location`) in `text-sm text-muted-foreground` sotto.
  - A destra: pulsante `Dettagli ruolo` (secondary md, con chevron a dx) → `openRole`.
  - Sotto: **tabella dei rounds** al posto della griglia cartelle attuale.

## 3. Nuova componente `RoleRoundRow`

File: `src/components/castings/rounds/RoleRoundRow.tsx`. Struttura ispirata a `CastingRow`:

- Grid: `grid-cols-[1fr_120px_1fr_140px_120px] items-center gap-4 px-4 h-20 border-b border-border/40 hover:bg-muted/50 cursor-pointer group`.
- Colonne:
  1. **Label round**: `font-medium` (es. "1° invio"), sotto data breve `text-xs text-muted-foreground`.
  2. **Stato**: badge stato round (Bozza / Condiviso), stile coerente col DS (`font-semibold`).
  3. **Selezione**: stack avatar `size="md"` con `-ml-3` overlap, max 3 + pill `+N` (stessa logica di `CastingRow`). Dati dal `useRoundPreviewPhotos` esistente.
  4. **Conteggio**: `X/Y confermati` in `text-sm` (X = confermati del round, Y = fabbisogno ruolo). Se 0/0 → "nessun talent".
  5. **Azioni**: icona `LinkIcon` (copia link, solo se condiviso) e `Trash2` (elimina round con AlertDialog) — ghost `size="icon-md"`, `opacity-0 group-hover:opacity-100`. Chevron sempre visibile.
- Click sulla riga → `navigate` al dettaglio round.
- Riutilizza `useDeleteRound`, `useShareRound` e i pattern di `RoundFolderCard`.

Sotto la tabella, una riga tratteggiata "+ Aggiungi invio" full-width (variante compatta del bottone dashed attuale) che apre `RoundWizardDialog`.

## 4. Aggiornamento `RoleRoundsCompartment`

Sostituisce la griglia `grid-cols-2` di `RoundFolderCard` con:
- Header tabella: `Round | Stato | Selezione | Confermati | ` in `text-sm font-medium text-muted-foreground` (coerente con OwnerCastings).
- `RoleRoundRow` per ogni round ordinati per data.
- Riga finale "Aggiungi invio".

Rimuovi dal compartment il vecchio dropdown MoreVertical del ruolo e il bottone "Vai alla selezione" (le azioni ora sono nell'header della card ruolo — `Dettagli ruolo` + accesso via card).

## 5. Design System (`src/pages/DesignSystem.tsx`)

Aggiungi nuova SubBlock "Casting role row (rounds table)" nella sezione tabelle:
- Header tabella con le 5 colonne.
- 2–3 righe mock con stati diversi (bozza, condiviso, 0/0), avatar stack, conteggi variabili.
- Mostra hover-state con azioni visibili.

## Dettagli tecnici

- Nessuna modifica DB, RPC o hooks di data (`useCastingRoles`, `useRoundsByRole`, `useRoleTalents`, `useRoundPreviewPhotos`, `useDeleteRound`, `useShareRound`, `useUpdateCastingStatus`).
- `RoundFolderCard.tsx` resta nel repo per eventuali usi futuri ma non più referenziato da `RoleRoundsCompartment`.
- Il conteggio "confermati per round" richiede il conteggio dei `role_talents` con `company_status='confirmed'` scoped per round: già disponibile per ruolo tramite `confirmedByRole`, ma non per round. **Nel primo giro uso il totale del round** (`round.talents_count` o `preview.total`) come Y e il conteggio confermati del round derivato da un piccolo `useMemo` sui `role_talents` già fetchati in `OwnerCastingDetail` (filtrando per `round_id` se esiste sulla tabella; verifico in build mode e in caso ricado su `role.role_talents_count`). Nessuna nuova query aggiunta.
- Tutti i colori/badge/font tramite token semantici e classi esistenti (`.dc-card`, `bg-muted`, `font-display`, `bg-primary`, `text-primary-foreground`, `bg-[hsl(var(--success))]`). Nessun hex hardcoded nuovo.
- Icone ereditano `currentColor`.

## File toccati

- `src/pages/owner/OwnerCastingDetail.tsx` (header + sezione ruoli riorganizzati)
- `src/components/castings/rounds/RoleRoundsCompartment.tsx` (tabella al posto della griglia)
- `src/components/castings/rounds/RoleRoundRow.tsx` (**nuovo**)
- `src/pages/DesignSystem.tsx` (SubBlock per la nuova riga)
