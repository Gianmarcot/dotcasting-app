## Obiettivo
Rendere la larghezza della sidebar owner ridimensionabile trascinando il bordo destro, entro un range definito. La larghezza attuale (`16rem` = 256px) diventa il **minimo**; il massimo consigliato è **384px** (24rem) per non compromettere il layout dei contenuti.

## Comportamento
- **Min**: 256px (attuale, valore di default all'apertura)
- **Max**: 384px
- **Handle**: sottile striscia verticale (2–4px) sul bordo destro della sidebar desktop, `cursor-col-resize`, evidenziata in hover con l'accent color.
- **Drag**: mouse/touch, aggiorna `--sidebar-width` in tempo reale via CSS variable inline sul `SidebarProvider` wrapper.
- **Persistenza**: valore salvato in `localStorage` (chiave `dc.sidebar.width`) e ripristinato al mount.
- **Reset**: doppio click sull'handle riporta al minimo (256px).
- **Mobile**: nessun resize (sheet off-canvas invariato). Nessun impatto sullo stato collapsed/icon.

## Implementazione tecnica
1. **`src/components/ui/sidebar.tsx`**
   - Estendere il `SidebarContext` con `width`, `setWidth`, costanti `SIDEBAR_WIDTH_MIN=256`, `SIDEBAR_WIDTH_MAX=384`.
   - In `SidebarProvider`: stato locale `width` inizializzato da `localStorage` (fallback 256), scritto nello style come `--sidebar-width: ${width}px`. Persistere on-change (debounced).
   - Nel componente `Sidebar` desktop (variante `sidebar`, non mobile, non `collapsible=icon` attivo): aggiungere un `<SidebarResizeHandle />` posizionato absolute sul bordo destro del wrapper fisso.
2. **Nuovo componente interno `SidebarResizeHandle`**
   - `onPointerDown` → `setPointerCapture`, calcola `startX` e `startWidth`.
   - `onPointerMove` → `newWidth = clamp(startWidth + (e.clientX - startX), MIN, MAX)` e aggiorna via context.
   - `onDoubleClick` → reset a MIN.
   - Nascosto quando `state === "collapsed"` o su mobile.
3. Nessuna modifica ai consumer (`OwnerSidebar`, `OwnerLayout`): tutto passa attraverso la CSS variable già in uso.

## Fuori scope
- Nessuna modifica a routing, dati, o altri componenti.
- Nessuna modifica alla sidebar mobile / stato collapsed-icon.
