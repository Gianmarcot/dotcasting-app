

## Rimuovere box-shadow di default dalle card

### Modifica

**`src/index.css`** — nella classe `.dc-card`, rimuovere `shadow-sm` e lasciare solo le card con hover che già hanno `hover:shadow-md` nei rispettivi componenti.

```css
/* Da */
.dc-card {
  @apply rounded-3xl border-0 shadow-sm bg-white text-card-foreground;
}

/* A */
.dc-card {
  @apply rounded-3xl border-0 shadow-none bg-white text-card-foreground;
}
```

Un solo file, una sola riga. Le card con `hover:shadow-md` (TalentCard, OwnerCompanies, ecc.) continueranno a mostrare l'ombra solo al passaggio del mouse.

