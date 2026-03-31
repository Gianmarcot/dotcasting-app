

## Aggiungere stile globale per i link `<a>`

### Modifica

**`src/index.css`** — Aggiungere regola per `a` nel blocco `@layer base` (dopo la regola `h2, h3, h4`, prima della chiusura `}` a riga 171):

```css
a {
  @apply text-foreground font-semibold underline;
}
```

Questo applica colore del testo corrente, peso semibold e sottolineatura a tutti i link. I componenti di navigazione (sidebar, bottom nav) che usano classi custom sovrascriveranno questo stile dove necessario.

### File da modificare

| File | Modifica |
|------|----------|
| `src/index.css` | Aggiungere regola `a` in `@layer base` |

