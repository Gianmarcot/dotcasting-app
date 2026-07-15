## Modifiche a hover liste, radius preferiti e drag & drop preferiti sidebar

### 1. Hover più leggero sulle liste nei box
Ridurre l'opacità del background hover nelle righe di elenco all'interno dei box `.dc-card`:

- `src/components/castings/CastingRow.tsx` (riga 55): `hover:bg-muted/50` → `hover:bg-muted/30`
- `src/components/castings/rounds/RoleRoundRow.tsx`: `hover:bg-muted/50` → `hover:bg-muted/30`

Solo queste due righe (le liste principali dentro i box). Gli altri hover restano invariati.

### 2. Border radius `md` sui link della lista Preferiti (sidebar)
In `src/components/layout/OwnerSidebar.tsx` (FavoritesSection):

- Aggiungere `rounded-md` alle classi dei `<Link>` delle voci preferite e del link "Visualizza tutti".
- Rientrare leggermente la lista con `px-2` sull'`<ul>` così i background hover/active arrotondati non toccano i bordi della sidebar (i link mantengono padding orizzontale ridotto: `px-2` invece di `px-4`, allineati visivamente all'header "Preferiti").

### 3. Drag & drop dei Preferiti nella sidebar
Rendere l'ordine dei preferiti riordinabile persistendo la scelta nel backend.

**Backend (Lovable Cloud)**
- Migration: aggiungere colonna `favorite_order integer` a `public.castings` (default null). Nessuna nuova policy/GRANT necessaria: si sfruttano quelle esistenti su `castings`.

**Hook**
- `src/hooks/useFavoriteCastings.ts`: cambiare `order` a `favorite_order asc nullsLast, updated_at desc` per usare il nuovo campo con fallback ordinato.
- Nuovo hook `useReorderFavoriteCastings` (mutation) che riceve la nuova lista di id e fa update batch di `favorite_order` (indice progressivo) usando `supabase.from("castings").update(...).eq("id", ...)` in Promise.all, poi invalida `["favorite-castings"]`.

**UI**
- In `FavoritesSection` (`OwnerSidebar.tsx`):
  - Stato locale `items` sincronizzato con `favorites`.
  - Avvolgere la lista in `DndContext` + `SortableContext` (verticale) di `@dnd-kit/sortable` (già installato).
  - Estrarre il singolo `<li>` in un componente `SortableFavoriteItem` che usa `useSortable`: applica `transform`/`transition` inline, mostra il cursore `grab`/`grabbing`, e aggiunge un piccolo handle icona (`GripVertical` lucide) visibile in hover a sinistra della stella.
  - `onDragEnd`: `arrayMove` sugli items e chiama la mutation di reorder.
  - "Visualizza tutti" resta fuori dal contesto sortable.

Il drag riguarda solo la sezione Preferiti della sidebar; nessuna modifica a comportamento o UI della pagina Casting.