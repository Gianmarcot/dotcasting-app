# Campi bianchi nelle barre admin (parte alta con search bar)

## Obiettivo
Nelle pagine admin, i campi (Input, Select, Filtri) che oggi sono color cream — quindi invisibili perché uguali allo sfondo pagina — devono diventare bianchi, così da staccarsi dallo sfondo. Si applica solo alle aree in cui i campi poggiano direttamente sul fondo cream: le barre di ricerca/filtri in alto e i selettori di stato nelle intestazioni. Dentro le card bianche i campi restano cream (già visibili).

## Approccio: nuova superficie "raised"
Il Design System usa già campi surface-aware (`--field-*`, `src/components/ui/surface.tsx`). La variante `muted` dà campi bianchi ma dipinge il contenitore di cream. Si aggiunge la variante **`raised`**: campi bianchi, contenitore che non dipinge nulla (trasparente) — così la pagina resta cream e solo i campi cambiano.

Il vantaggio dell'uso di `Surface` è che il contesto React si propaga anche ai menu a tendina dei Select (portal): il trigger bianco avrà il menu aperto bianco, non cream.

## Modifiche

### 1. `src/index.css`
Nuovo blocco token, coerente con gli esistenti:
```css
[data-surface="raised"] {
  --surface: transparent;          /* la barra non dipinge nulla */
  --surface-fg: var(--ink);
  --field-bg: var(--white);        /* campo bianco su cream */
  --field-bg-disabled: var(--grey-200);
  --field-fg: var(--ink);
  --field-label: var(--grey-600);
  --field-border: transparent;
  --field-border-focus: var(--ink);
  --field-icon: var(--field-label);
  /* + varianti disabled, come negli altri blocchi */
}
```

### 2. `src/components/ui/surface.tsx`
Aggiungere `"raised"` al tipo `SurfaceVariant`.

### 3. Applicazione nelle aree admin (solo campi direttamente sul cream)
- `CastingFilters.tsx` (I miei casting): root della barra → `Surface variant="raised"` (stato, search, ordinamento).
- `TalentFilterBar.tsx` (Database talent): root → `Surface raised`; dentro `FilterGroup`, il contenuto del PopoverContent → `Surface raised` (i popover sono in portal, serve il wrapper per i campi interni).
- `OwnerTalents.tsx`: toolbar in alto (search, ordinamento, toggle vista) → `Surface raised` sulla riga.
- `ApplicationFilters.tsx` (Candidature): container della search → `Surface raised` (le tab di stato restano invariate).
- `OwnerCompanies.tsx` (Aziende): riga filtri (search + settore + ordina) → `Surface raised`.
- `OwnerRoundDetail.tsx`: riga search in alto ("Cerca un talent in questo invio") → `Surface raised` (asChild, senza nesting extra).
- `OwnerCastingDetail.tsx`: riga metadati dell'intestazione che contiene il selettore di stato → `Surface raised` (asChild), stesso motivo: il campo poggia sul cream.

Non toccate: le tabelle/righe, i campi dentro le card bianche, i selettori già su superficie bianca (es. OwnerTargets), la sidebar scura, l'area talent.

### 4. Design System (`src/pages/DesignSystem.tsx`)
Aggiungere la variante `raised` alla matrice superfici (riga `SurfaceFieldTokens`), con etichetta tipo "Raised (bianco su cream)".

## Verifica
- Build OK e typecheck.
- Playwright su desktop (1280px): /owner/talents, /owner/castings, /owner/applications, pagina aziende, dettaglio di un casting e di un round — campi bianchi visibili sul fondo cream, menu a tendina bianchi, nessun cambio di colore in aree non toccate.
- Controllo che sfondo pagina e card restino cream/bianchi come ora.
