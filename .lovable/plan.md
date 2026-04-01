

## Filtri talent sopra ai risultati (layout orizzontale)

### Problema
I filtri occupano una colonna laterale fissa da 300px che sottrae spazio ai risultati e non funziona bene su schermi medi. Ci sono 6 gruppi accordion con molti campi, troppi per una barra orizzontale piatta.

### Soluzione: Popover per gruppo filtro

Sostituire la sidebar con una **barra orizzontale sopra ai risultati**. Ogni gruppo di filtri diventa un **pulsante** che apre un **Popover** con i campi del gruppo. La barra contiene: campo ricerca a sinistra, poi i 6 pulsanti gruppo (Ruolo, Anagrafica, Aspetto, Misure, Competenze, Lavoro), ciascuno con badge contatore se ha filtri attivi. Reset link a destra.

```text
┌──────────────────────────────────────────────────────────────────┐
│ [🔍 Cerca...]  [Ruolo ▾] [Anagrafica ▾] [Aspetto ▾] ...  Reset │
├──────────────────────────────────────────────────────────────────┤
│ 42 talent trovati su 150          Ordinamento: [Più recenti ▾]  │
│ [Ruolo: Attore ×] [Città: Milano ×]                             │
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ Card    │ │ Card    │ │ Card    │ │ Card    │               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│ ...griglia a 3 colonne (più spazio senza sidebar)...            │
└──────────────────────────────────────────────────────────────────┘
```

### Dettaglio tecnico

#### 1. `src/components/talents/TalentFilterSidebar.tsx` → Rinominare in `TalentFilterBar.tsx`
- Riscrivere completamente il componente
- Layout orizzontale: `flex flex-wrap items-center gap-2`
- Campo ricerca inline (w-[200px])
- 6 pulsanti `<Popover>` (uno per gruppo), ciascuno apre un pannello con gli stessi campi attuali
- Ogni pulsante mostra il nome del gruppo + badge con contatore filtri attivi
- Link "Reset" a destra

#### 2. `src/pages/owner/OwnerTalents.tsx`
- Rimuovere layout `flex gap-8` a due colonne
- Sostituire con layout verticale: filtri sopra, risultati sotto
- Importare `TalentFilterBar` al posto di `TalentFilterSidebar`
- Griglia risultati: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` (3 colonne possibili senza sidebar)

### File da modificare

| File | Modifica |
|------|----------|
| `src/components/talents/TalentFilterBar.tsx` | Nuovo file, filtri orizzontali con Popover per gruppo |
| `src/pages/owner/OwnerTalents.tsx` | Layout verticale, import nuovo componente, griglia a 3 colonne |
| `src/components/talents/TalentFilterSidebar.tsx` | Eliminare (o lasciare se usato altrove) |

