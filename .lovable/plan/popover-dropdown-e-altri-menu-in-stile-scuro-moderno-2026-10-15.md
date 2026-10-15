# Popover, dropdown e altri menu in stile scuro moderno

## Obiettivo
Tutte le superfici "flottanti" (popover, menu a tendina, menu dei select, menu contestuale, palette comandi, hover card, menubar, navigation menu) adottano lo stesso stile scuro già usato per toast e tooltip: fondo `#0f0f0f`, testo bianco, nessun bordo, angoli ampi (`rounded-2xl`), ombra morbida.

## Scenario
- Oggi questi componenti usano lo stile shadcn di default: `bg-popover` beige con bordo e angoli piccoli.
- L'utente ha scelto la copertura completa: tutti i menu e i popover, per coerenza.

## Componenti da modificare (in `src/components/ui/`)
1. **popover.tsx** — `PopoverContent`: fondo scuro, `rounded-2xl border-0 shadow-lg`, testo bianco; `sideOffset` 4 → 8.
2. **dropdown-menu.tsx** — contenuto e sotto-menu scuri; voci con hover/focus `bg-white/10 text-white`; separatori e etichette in bianco trasparente; scorciatoie `text-white/50`.
3. **select.tsx** — solo il menu a tendina aperto (`SelectContent`, voci, separatori, frecce di scroll) diventa scuro; il campo Select chiuso resta com'è (è un field su sfondo chiaro).
4. **context-menu.tsx** — come il dropdown.
5. **command.tsx** — palette comandi scura, voci hover `bg-white/10`.
6. **hover-card.tsx** — scura, angoli ampi.
7. **menubar.tsx** e **navigation-menu.tsx** — contenuti a tendina scuri (presenti nel Design System).
8. **alert-dialog.tsx / dialog.tsx / sheet.tsx** — NON toccati: sono finestre e pannelli, non menu.

## Contenuti dei popover già in app (contrasto su fondo scuro)
Tre popover contengono contenuto ricco e vanno adattati alla lettura su scuro:
- `NotificationBell.tsx` (elenco notifiche: testi, separatori, bottoni)
- `TalentFilterBar.tsx` (filtri)
- `ActionAttachPopover.tsx` (allegati in messaggi)
Adattamento: testi in bianco/bianco trasparente, separatori `bg-white/10`, elementi interattivi con hover chiari. Eventuali campi interni mantengono il loro sfondo.

## Verifica
- Typecheck e build.
- Anteprima con Playwright: menu "…" di una riga casting (dropdown), menu di un Select nei filtri, popover notifiche dal campanello, esempi Popover/Dropdown/Select/Context menu/Command/Hover card nella pagina Design System — tutti pillola scura leggibile, nessun testo illeggibile.
