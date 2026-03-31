

## Uniformare h1 con font-weight medium e padding top 4rem

### Modifiche

#### 1. `src/index.css` — Già `font-weight: 500` (medium) ✓

La regola attuale (riga 162) usa già `font-weight: 500` che corrisponde a `medium`. Nessuna modifica necessaria qui.

Tuttavia, rimuovo `text-transform: uppercase` e aggiungo una regola esplicita per h1 con `text-2xl` per uniformare la dimensione.

#### 2. Layout — Padding top 4rem

In `TalentLayout.tsx` e `OwnerLayout.tsx`, cambiare `md:pt-12` (3rem) → `md:pt-16` (4rem) nel wrapper interno.

#### 3. Pulire override inline dagli h1

| File | h1 attuale | Modifica |
|------|-----------|----------|
| `TalentDashboard.tsx` | `text-2xl sm:text-3xl font-semibold` | → `text-2xl` |
| `TalentPublicProfile.tsx` | `text-3xl font-bold` | → `text-2xl` |
| `NotFound.tsx` | `text-4xl` | → `text-2xl` |
| `Index.tsx` | `text-5xl sm:text-6xl` | Lasciare (landing page, design diverso) |
| Tutti gli altri | `text-2xl text-foreground` | OK, nessuna modifica |

### File da modificare

| File | Modifica |
|------|----------|
| `src/index.css` | Aggiungere `@apply text-2xl font-medium` nella regola h1 base |
| `src/components/layout/TalentLayout.tsx` | `md:pt-12` → `md:pt-16` |
| `src/components/layout/OwnerLayout.tsx` | `md:pt-12` → `md:pt-16` |
| `src/pages/talent/TalentDashboard.tsx` | Rimuovere `sm:text-3xl font-semibold` dall'h1 |
| `src/pages/shared/TalentPublicProfile.tsx` | Rimuovere `text-3xl font-bold` dall'h1 |
| `src/pages/NotFound.tsx` | Rimuovere `text-4xl` dall'h1 |

