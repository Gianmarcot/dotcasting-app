## Obiettivo
Aggiungere un indicatore visivo (stile iOS) sul bordo destro della sidebar owner per comunicare che è trascinabile. Compare in hover, sparisce altrimenti.

## Modifiche

**File:** `src/components/layout/OwnerSidebar.tsx`

Modificare il `SidebarResizeHandle` (o il div equivalente sul bordo destro):
- Mantenere l'area di hit invisibile larga ~8px per il grab
- Aggiungere al suo interno una barretta verticale centrata:
  - larghezza 3px, altezza ~40px
  - `bg-white/30`, `rounded-full`
  - `opacity-0` di default → `opacity-100` su `hover` e durante `data-resizing`
  - transizione morbida (`transition-opacity duration-200`)
- Cursor `col-resize` sull'intera hit area

Nessuna modifica alla logica di drag/persistence già esistente.

## Note
Solo presentazione. Nessun cambio di stato, hook, o storage.