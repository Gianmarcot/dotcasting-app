## Altezza 48px + icone 20px per input e select

### 1. Altezza 48px (globale via DS)
In `src/index.css`:
- `.dc-input`: `h-10` → `h-12` (48px)
- `.dc-select-trigger`: `h-10` → `h-12` (48px)

### 2. Icone a 20px dentro Input e Select
- `src/components/ui/select.tsx`: chevron trigger `h-4 w-4` → `h-5 w-5` (20px).
- `src/components/castings/CastingFilters.tsx`: icona `Search` nella search bar `h-4 w-4` → `h-5 w-5`.
- Ricognizione via `rg` di eventuali altre search bar / input con icone leading (`h-4 w-4 text-muted-foreground` dentro `relative`) per allineare tutte a 20px, senza toccare icone dentro button, badge o altri contesti.

### Fuori scope
Nessuna modifica a radius, padding, tipografia, textarea o icone dentro altri componenti (button, badge, list row, ecc.).
