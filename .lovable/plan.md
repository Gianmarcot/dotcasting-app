

## Sfondo bianco per tutti i box/card

### Modifica

**`src/index.css`** (riga 277): cambiare `bg-card` → `bg-white`

```css
/* Da */
.dc-card {
  @apply rounded-3xl border-0 shadow-sm bg-card text-card-foreground;
}

/* A */
.dc-card {
  @apply rounded-3xl border-0 shadow-sm bg-white text-card-foreground;
}
```

Un solo file, una sola riga.

