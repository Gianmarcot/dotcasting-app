## Redesign lista Casting (`/owner/castings`)

### 1. Struttura tabella
Trasformare la lista attuale (righe con testo concatenato) in una **tabella con header di colonna** e larghezze fisse tranne il Titolo (flex/1fr).

Colonne, in ordine:

```text
[★ 32px] [Titolo 1fr] [Stato 140px] [Cliente 200px] [Location 180px] [Periodo 180px] [⋮ 40px]
```

Header sopra la lista: `Titolo | Stato | Cliente | Location | Periodo` (piccolo, uppercase, muted). Stella e menu senza etichetta.

### 2. Riga (`CastingRow.tsx`)
Riscrivere il markup usando le stesse larghezze dell'header (grid o flex con classi coerenti).

- **Stella**: `FavoriteCastingStar` esistente. Aggiornare i colori interni: attiva `text-[#BA7517]`, non attiva `text-muted-foreground` (rimuovere `text-primary` bordeaux). Cambio applicato al componente condiviso — impatta anche card/dettaglio (accettabile, coerente col nuovo linguaggio).
- **Titolo**: `font-semibold`, truncate.
- **Stato**: pallino 8px (colori attuali: verde `#729128`, grigio muted per bozza, rosso `#A30A2B` per chiuso) + etichetta testuale (`Attivo` / `Bozza` / `Chiuso`).
- **Cliente / Location / Periodo**: testo semplice, truncate. Location = primo elemento di `casting.locations`. Periodo = stesso `formatDates()` esistente.
- **Dati mancanti**: rendering di `<span className="text-muted-foreground">–</span>` per cella vuota. Rimuovere la logica di fallback concatenato "· —".
- **Rimuovere** la cella "N candidature".
- Menu tre puntini invariato (stesse azioni).

Click sulla riga (esclusi stella e menu) apre `/owner/castings/:id` — invariato.

### 3. Filtri e controlli (`CastingFilters.tsx` + `OwnerCastings.tsx`)

- **Tabs**: aggiungere `Preferiti` come quinto tab, dopo `Chiuso`. Valore `favorites`.
- **Ordinamento**: nuovo `Select` (shadcn) accanto alla barra di ricerca con opzioni:
  - `Più recenti` (default, `created_at desc` — comportamento attuale)
  - `Cliente` (`company.name` asc, client-side)
  - `Periodo` (`start_date` asc, null in fondo, client-side)
- **Barra di ricerca** e **bottone "+ Crea Casting"** in alto a destra: invariati.

### 4. Wiring filtro Preferiti
`OwnerCastings.tsx` oggi legge `?favorites=1` dal query string. Unificare:

- Se `statusFilter === "favorites"` oppure query string `?favorites=1` → filtro client-side `is_favorite = true`, e il fetch usa `status: "all"`.
- Quando l'utente clicca il tab `Preferiti`, aggiornare anche il titolo pagina come già fa il ramo `favoritesOnly` esistente.
- L'ordinamento scelto viene applicato client-side dopo il filtro (semplice `[...list].sort(...)`), così non serve toccare la query Supabase.

### 5. File toccati

- `src/components/castings/CastingRow.tsx` — riscrittura layout tabellare + fallback "–", rimozione conteggio.
- `src/components/castings/CastingFilters.tsx` — nuovo tab `Preferiti`, nuovo `Select` di ordinamento (esposto via prop `sort` / `onSortChange`).
- `src/components/castings/FavoriteCastingStar.tsx` — palette ambra `#BA7517` invece del bordeaux.
- `src/pages/owner/OwnerCastings.tsx` — header colonne, stato `sort`, filtro preferiti via tab, applicazione ordinamento client-side, sincronia con `?favorites=1`.

### 6. Fuori scope

- Nessuna modifica a `CastingCard.tsx` (non usata nella lista principale), dashboard, notifiche, DB, o pagina dettaglio (a parte l'effetto del nuovo colore stella già condiviso).
