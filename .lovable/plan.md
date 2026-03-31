

## Creare una classe CSS per link-action (pulsanti inline tipo "Vai al profilo")

### Problema

I link di azione (come "Vai al profilo per completarlo", "Vedi tutti") usano classi Tailwind inline ripetute (`text-sm text-primary hover:underline`). Non c'è un modo centralizzato per modificarne lo stile senza toccare tutti i `<a>` generici.

### Soluzione

Aggiungere una classe utility `.dc-link-action` in `src/index.css` e applicarla ai link di azione nelle pagine.

### Modifiche

#### 1. `src/index.css` — Nuova classe

```css
.dc-link-action {
  @apply inline-flex items-center gap-1 text-sm text-primary hover:underline;
}
```

#### 2. `src/pages/talent/TalentDashboard.tsx` — Sostituire le classi inline

- Link "Vai al profilo per completarlo": `className="dc-link-action mt-2"`
- Link "Vedi tutti" (casting): `className="dc-link-action"`
- Link "Vedi tutti" (messaggi): `className="dc-link-action"`

#### 3. `src/pages/shared/TalentPublicProfile.tsx` — Link social

- I link social (`text-sm text-primary hover:underline`): `className="dc-link-action truncate"`

### File da modificare

| File | Modifica |
|------|----------|
| `src/index.css` | Aggiungere `.dc-link-action` |
| `src/pages/talent/TalentDashboard.tsx` | Usare `.dc-link-action` su 3 link |
| `src/pages/shared/TalentPublicProfile.tsx` | Usare `.dc-link-action` su link social |

