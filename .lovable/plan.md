

## Uniformare lo stile dei box (Card) in tutta la piattaforma

### Problema

Lo stile di riferimento per le Card è `border-0 shadow-sm` (usato in tutte le sezioni del profilo). Tuttavia diverse pagine usano `<Card>` senza classi aggiuntive, risultando in uno stile diverso (con bordo visibile e senza ombra).

### Soluzione

Invece di modificare ogni singolo file, aggiornare la classe base `.dc-card` in `src/index.css` per includere `border-0 shadow-sm` di default. Poi rimuovere tutte le occorrenze ridondanti di `border-0 shadow-sm` dai componenti.

### Modifiche

#### 1. `src/index.css` — Aggiornare stile base `.dc-card`

```css
/* Da */
.dc-card {
  @apply rounded-3xl border bg-card text-card-foreground;
}

/* A */
.dc-card {
  @apply rounded-3xl border-0 shadow-sm bg-card text-card-foreground;
}
```

Questo rende tutte le Card automaticamente uniformi.

#### 2. Pulizia — Rimuovere `border-0 shadow-sm` ridondante

Rimuovere `border-0 shadow-sm` da tutti i ~22 file che lo specificano inline, dato che ora è nel base. I file con varianti (es. `shadow-lg`, `hover:shadow-md`, `opacity-60`) mantengono solo le classi aggiuntive.

| File | Modifica |
|------|----------|
| Tutti i componenti profile (`AboutMe`, `Address`, `Basic`, `Contact`, `Documents`, `Languages`, `Measurements`, `Physical`, `Photo`, `Roles`, `Skills`, `Travel`, `Work`, `Appearance`) | Rimuovere `border-0 shadow-sm` |
| `CastingCard.tsx` | Rimuovere `border-0 shadow-sm` |
| `OwnerDashboard.tsx` | Rimuovere `border-0 shadow-sm` |
| `OwnerApplications.tsx` | Rimuovere `border-0 shadow-sm` |
| `OwnerCompanies.tsx` | Rimuovere `border-0 shadow-sm` (mantenere `hover:shadow-md`) |
| `OwnerSettings.tsx` | Rimuovere `border-0 shadow-sm` |
| `OwnerTargets.tsx` | Rimuovere `border-0 shadow-sm` |
| `TalentApplications.tsx` | Rimuovere `border-0 shadow-sm` |
| `TalentSettings.tsx` | Rimuovere `border-0 shadow-sm` (mantenere `border-destructive/20` su danger zone) |
| `TalentOnboarding.tsx` | Cambiare `border-0 shadow-lg` → `shadow-lg` |
| `TargetCard.tsx` | Cambiare `dc-card hover:shadow-md` → `hover:shadow-md` |

### File da modificare

| File | Modifica |
|------|----------|
| `src/index.css` | `.dc-card` base con `border-0 shadow-sm` |
| ~22 file componenti | Rimuovere classi ridondanti |

