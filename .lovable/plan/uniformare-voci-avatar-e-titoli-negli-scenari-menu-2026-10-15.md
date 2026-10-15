# Uniformare voci, avatar e titoli negli scenari menu

## Cosa cambia
- **Voci della ricerca (città ecc.)**: oggi sono più piccole (14px) perché il menu con ricerca usa la misura compatta. Passa alla misura normale (16px, stessa altezza delle altre select): è un campo di scelta, non un menu di azioni, quindi non c'è un motivo reale per differenziarlo. La misura compatta resta solo per i menu dei tre puntini e le notifiche.
- **Avatar e descrizione**: uso l'avatar del Design System nella misura piccola (32px) con foto vera e iniziali di riserva, come nella sezione Avatar.
- **Titoli della sezione "Menu · Scenari interattivi"**: titolo principale, titoli degli scenari, "Pannello filtri" e "Database talenti" in DM Sans (niente maiuscolo forzato), con gerarchia chiara: titolo sezione più grande e semibold, titolo scenario medio semibold, nome componente sotto in piccolo e grigio. I componenti mostrati negli esempi restano invariati.

## Dettagli tecnici
- `src/components/ui/search-select.tsx`: `PopoverContent` da `dc-menu-compact` a `dc-menu` normale (mantiene `w-[var(--radix-popover-trigger-width)]`). Aggiornare in AGENTS.md la riga "selects/filters normal, actions/search compact" → "selects/search/filters normal, actions compact".
- `src/pages/dev/MenuScenarios.tsx`: Avatar `size="sm"` + `AvatarImage` (pravatar) + `AvatarFallback`; h2 `font-sans text-2xl font-semibold`, h3 `font-sans text-base font-semibold`, `code` `text-xs text-muted-foreground`.
- Verifica in anteprima: altezza voci SearchSelect uguale a quella delle Select, avatar visibili.
