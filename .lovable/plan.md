

## Aggiornare stile `.dc-link-action`

### Modifica

**`src/index.css`** — Sostituire la definizione attuale di `.dc-link-action`:

```css
/* Da */
.dc-link-action {
  @apply inline-flex items-center gap-1 text-sm text-primary hover:underline;
}

/* A */
.dc-link-action {
  @apply inline-flex items-center gap-1 font-medium underline;
  color: #1A1A1A;
  font-size: 15px;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
}
```

Un solo file da modificare.

