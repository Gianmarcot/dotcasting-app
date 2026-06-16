## Semplificazioni dashboard owner (`/owner`)

Solo presentazione e una rimozione di logica. Nessuna modifica allo schema DB.

### 1. Striscia "Nuovi talent" → vetrina

**File:** `src/hooks/useOwnerDashboard.ts`
- `useTriageQueue`: rimuovere il filtro `.is("triaged_at", null)`. La query mostra i profili con `onboarding_completed = true` degli ultimi 30 giorni, ordinati per `created_at` desc. Aggiungere `.gte("created_at", since)`.

**File:** `src/components/owner/dashboard/TriageQueueStrip.tsx`
- Titolo: "Nuovi talent" (rimuovere "da valutare" e il counter tra parentesi).
- Rimuovere `useTriageTalent`, `handleShortlist`, `handleDiscard`, e l'`extraAction` "Scarta" sul drawer.
- `TalentPreviewDrawer` resta in sola consultazione.
- Stato vuoto: "Nessun nuovo talent".

**File:** `src/components/owner/dashboard/TriageTalentCard.tsx`
- Rimuovere il bottone stellina shortlist e la prop `onShortlist`.
- Click sulla card → `onOpen` (drawer di consultazione), nessun'altra azione.

`triaged_at` / `is_shortlisted` restano nel DB (non rimossi per sicurezza), semplicemente non più usati dalla dashboard.

### 2. Card metriche: colore sul box, non sul testo

**File:** `src/components/owner/dashboard/ActionableStatCard.tsx`
- Rimuovere `text-[hsl(var(--warning))]` sul numero.
- Quando `value > 0`: applicare alla `Card` un fondo oliva (`bg-[hsl(var(--olive))]`) con `text-charcoal-foreground` (o classe analoga chiara), così titolo/numero/icona ereditano un testo chiaro leggibile su fondo scuro.
- Quando `value === 0`: card resta `.dc-card` (fondo bianco, testo scuro) come ora.
- Niente colore sul numero in nessun caso; l'icona usa `currentColor` (regola di progetto già attiva).

### 3. Casting attivi: solo badge, niente progress bar

**File:** `src/components/owner/dashboard/ActiveCastingsList.tsx`
- Rimuovere `<Progress>` e l'import relativo.
- Per ogni ruolo, mostrare a destra del nome un solo badge testuale:
  - `total > 0` → `"{confirmed}/{total} approvati"` (X = `company_status = confirmed`, Y = totale `role_talents` nel ruolo, come confermato).
  - `total === 0` → `"nessun talent"` (al posto di "0/0 approvati").
- Badge non interattivo, stile coerente con le linee badge esistenti (nessun hover/colore stato), allineato a destra del nome ruolo.

### Note

- Nessuna modifica a schema, RLS, query lato server oltre al filtro `triaged_at` rimosso e al `.gte(created_at)` aggiunto.
- Responsive invariato: la striscia resta scrollabile orizzontalmente, le due colonne casting/attività restano come ora.
- Palette: il fondo acceso delle metriche riusa l'oliva già definito nei token (`--olive`), nessun colore nuovo.
