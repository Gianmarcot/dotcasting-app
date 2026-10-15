# Tooltip in stile moderno (come i toast)

## Obiettivo
Le tooltip dell'app (menu admin compresso, Design System, righe casting, ecc.) passano dallo stile shadcn di default (beige con bordo e angoli piccoli) allo stile scuro e moderno già usato per i toast sonner: fondo `#0f0f0f`, testo bianco, senza bordo, angoli ampi e ombra morbida.

## Stato attuale (verificato)
- `src/components/ui/tooltip.tsx` è l'unico punto di stile: `TooltipContent` usa `rounded-md border bg-popover ... shadow-md`.
- Tutti i punti d'uso importano questo componente (sidebar admin, `OwnerSidebar`, `CastingRow`, `RoleRoundRow`, `RoleTalentRow`, pagina Design System) — una modifica qui si propaga ovunque.
- `chart.tsx` ha un tooltip grafico separato (`ChartTooltipContent`) per i grafici: non viene toccato.
- I toast usano: fondo `#0f0f0f`, testo bianco, `border-0`, `rounded-2xl`, `shadow-lg`.

## Modifiche
1. **`src/components/ui/tooltip.tsx`** — nuovo stile di `TooltipContent`:
   - `rounded-2xl border-0 bg-[#0f0f0f] text-white shadow-lg`
   - `px-3 py-1.5 text-sm font-medium` ( testo secondario resta ≥ 14px, regola del design system)
   - `sideOffset` aumentato da 4 a 8 per staccare la pillola dall'elemento
   - mantenute le animazioni di ingresso/uscita esistenti (fade + zoom + slide)
2. Nessun'altra modifica: la pagina Design System mostrerà automaticamente la nuova tooltip nell'esempio "Tooltip".

## Verifica
- Typecheck e build.
- Anteprima con Playwright: tooltip nel menu admin compresso (hover su una voce) e nell'esempio della pagina Design System — pillola scura, angoli ampi, nessun bordo; nessuna sovrapposizione col logo/le voci di menu.
