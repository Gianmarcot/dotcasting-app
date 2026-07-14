## Modifiche pagina dettaglio casting

### 1. `src/pages/owner/OwnerCastingDetail.tsx`
- **Dropdown stato casting**: sostituire l'attuale pill+Popover con lo stesso pattern del filtro stato in `CastingFilters` (`Select` shadcn, trigger rounded-full più grande, h-10).
- **Titolo "Ruoli"**: applicare stile "Etichetta base" del DS → `text-sm font-display uppercase tracking-wider text-foreground` (rimuovere `text-muted-foreground`).
- **Pulsante "Elimina casting"**: convertirlo in `Button` `size="lg"` `variant="ghost"` con icona Trash2, testo `text-[hsl(var(--destructive))]`, allineato a sinistra sotto la card.

### 2. `src/components/castings/rounds/RoleRoundsCompartment.tsx`
- **Titolo ruolo nel box**: stile "Etichetta base" (`text-sm font-display uppercase tracking-wider text-foreground`) al posto dell'attuale `text-2xl`.
- **Rimuovere linea divisoria** sotto l'header del ruolo (`<div className="border-t border-border/60" />`).
- **Rimuovere header tabella** (riga "Round · Stato · Selezione · Talent · Azioni").
- **Pulsante "Dettagli ruolo"**: aggiungere `iconPosition="right"` e rimuovere `ml-1` sull'icona così i padding matchano il DS.
- **Grid tabella**: aggiornare template columns per rimuovere colonna Talent.

### 3. `src/components/castings/rounds/RoleRoundRow.tsx`
- **Rimuovere colonna Talent** (conteggio "N talent"): grid da `grid-cols-[1fr_140px_1fr_140px_120px]` a `grid-cols-[1fr_140px_1fr_120px]`; togliere la cella conteggio.
- **Icone status badge**: `CheckCheck` da `h-4 w-4` a `h-5 w-5` (md 20px).
- **Colore icona "Condiviso"** (stato condiviso senza selezione client): `text-[#C7C7C7]` al posto di `text-muted-foreground`.
- **Titolo invio bold + regular**: split del `round.label` sul primo ` - ` / ` – `; prima parte `font-semibold`, seconda parte `font-normal`. Fallback: tutto regular se nessun separatore.

### Dettaglio tecnico
- Stile "Etichetta base" preso dal SubBlock del DS: `text-sm font-display uppercase tracking-wider text-foreground`.
- Dropdown stato: `Select` shadcn coerente con `CastingFilters`.
- Button md padding con `iconPosition="right"`: gestito dalla variant (`pl-6 pr-4`), quindi niente margin custom.
