## Allineamento pagina Database Talenti al DS

Solo presentazione: nessuna modifica a hook, filtri, dati o navigazione.

### 1. Header (`OwnerTalents.tsx`)
- Rimuovere sottotitolo "Cerca e gestisci i talenti registrati" (coerente con Casting).
- H1 + bottone "Nuovo talent" a destra: `<Button size="md" iconPosition="left">` con `UserPlus` a 20px.

### 2. Toolbar unificata (nuovo layout come pagina Casting)
Una sola riga, `flex items-center justify-between gap-4`, wrap su mobile.

```text
[ 🔍 Cerca talent (max 450px) ] [ Filtri: Ruolo | Anagrafica | Aspetto | Misure | ... ]        [ N talent trovati ] [ Ordina ▾ ] [ ▦ ▤ ]
```

- **Sinistra**: search bar (spostata da `TalentFilterBar` a `OwnerTalents`), stessa dc-input (48px), icona `Search` 20px, `max-w-[450px] w-full`. Accanto, i FilterGroup popover esistenti.
- **Destra**: conteggio `"{n} talent trovati{ su {totalCount}}"` (`text-sm text-muted-foreground`), poi `Select` ordinamento (`h-12` da DS, `w-52 rounded-full`), poi `ToggleGroup` board/portfolio con item `h-12 w-12` e icone 20px.

### 3. `TalentFilterBar.tsx`
- Rimuovere blocco Search interno (ora vive in OwnerTalents).
- Bottone `FilterGroup` (Popover trigger): passare a `variant="secondary" size="md"` con `rounded-full`, altezza allineata (48px), gap coerente; chevron 20px; badge counter invariato (pill piccolo).
- Bottone "Reset" trasformato in link testuale coerente (`text-sm text-primary hover:underline`).
- Etichette e input interni ai popover restano identici (dc-select-trigger già a 48px dal DS aggiornato).

### 4. Chip filtri attivi
- Restano `Badge variant="secondary"` cliccabili con `X` (20px) — spostati subito sotto la toolbar, gap invariato.

### 5. Contenitore lista/griglia
- Avvolgere `TalentBoardGrid` / `TalentPortfolioList` / stato vuoto / skeleton dentro un `.dc-card p-6` come nella pagina Casting e Round Detail.
- Empty state coerente: icona `Users` 20px in bloc centrato, titolo, testo muted, CTA `variant="secondary" size="md"` "Nuovo talent" quando non ci sono filtri attivi.

### 6. Icone
- Tutte le icone dentro toolbar (search, chevron, UserPlus, X, LayoutGrid, List): 20px (`h-5 w-5`).

### Fuori scope
- `TalentBoardCard`, `TalentPortfolioList` interna, `TalentPreviewDrawer`, `CreateTalentDialog`, logiche di filtro e ordinamento.
