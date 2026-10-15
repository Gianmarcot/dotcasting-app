# Dropdown come prima del tema scuro

I menu a tendina (il "…" delle righe, il menu dei breadcrumbs, "Altro" nella shortlist) tornano esattamente com'erano prima del passaggio al tema scuro: fondo bianco, bordo sottile, angoli poco arrotondati, voci compatte con fondo chiaro al passaggio del mouse.

## Cosa resta com'è adesso
- **Popover** (notifiche, filtri) e **menu a tendina dei campi**: restano nella versione chiara attuale, molto arrotondata.
- **Tooltip** e **toast**: restano scuri.

Se preferisci riportare alla versione di prima anche popover e menu a tendina dei campi, dimmelo e li includo.

## Dettagli tecnici
- `src/components/ui/dropdown-menu.tsx` torna alle classi shadcn originali: Content/SubContent `rounded-md border bg-popover p-1 text-popover-foreground shadow-md`, Item/Checkbox/Radio/SubTrigger `rounded-sm px-2 py-1.5 focus:bg-accent focus:text-accent-foreground` (data-[state=open]:bg-accent), Separator `-mx-1 my-1 h-px bg-muted`, Label `font-semibold`, Shortcut `opacity-60`.
- Lo stesso per `context-menu.tsx` e per i menu di `menubar.tsx`, così restano coerenti con i dropdown.
- La resa delle voci "Elimina" in rosso (`text-destructive`) resta invariata.
- Aggiorno la memoria "Floating surfaces": dropdown in stile shadcn originale, popover e select chiari arrotondati, tooltip e toast scuri.
