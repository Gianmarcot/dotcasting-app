

## Piano: Aggiornamento Stile Pulsanti Primary e Secondary

### Obiettivo
Modificare lo stile dei pulsanti `default` (primary) e `secondary` per avere una forma a pillola (rounded-full) come nello screenshot di riferimento.

### Analisi dello screenshot

| Tipo | Sfondo | Bordo | Testo | Forma |
|------|--------|-------|-------|-------|
| Primary | Bordeaux (#8C1F3F circa) | Nessuno | Bianco | Pillola (rounded-full) |
| Secondary | Trasparente | Scuro sottile | Scuro | Pillola (rounded-full) |

### Modifiche richieste

**File: `src/components/ui/button.tsx`**

| Variante | Prima | Dopo |
|----------|-------|------|
| `default` (primary) | `rounded-md` (da base) | Aggiungo `rounded-full` |
| `secondary` | `bg-secondary text-secondary-foreground` | `border border-foreground bg-transparent text-foreground hover:bg-muted rounded-full` |

**File: `src/index.css`**

Aggiorno anche le classi CSS centralizzate per consistenza:

| Classe | Prima | Dopo |
|--------|-------|------|
| `.dc-btn` | `rounded-md` | `rounded-full` (applicato a tutti i bottoni base) |
| `.dc-btn-secondary` | `bg-secondary text-secondary-foreground` | `border border-foreground bg-transparent text-foreground hover:bg-muted` |

### Codice modificato

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "dc-btn",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-full h-10 px-6 py-2",
        secondary: "border border-foreground bg-transparent text-foreground hover:bg-muted rounded-full h-10 px-6 py-2",
        // ... altre varianti
      },
      // ...
    },
  },
);
```

```css
/* src/index.css */
.dc-btn {
  @apply inline-flex items-center justify-center gap-2 
         whitespace-nowrap rounded-full text-sm font-medium /* rounded-full invece di rounded-md */
         /* ... resto invariato */
}

.dc-btn-secondary {
  @apply dc-btn border border-foreground bg-transparent text-foreground hover:bg-muted h-10 px-6 py-2;
}
```

### Impatto sulle altre varianti

- `outline`: mantiene il suo stile con bordo `border-input`, separato da secondary
- `ghost`: nessun cambiamento
- `destructive`: eredita `rounded-full` dalla base
- `castingAction`: già ha `rounded-full`, nessun cambiamento

### Risultato atteso

- **Primary**: Pulsante bordeaux con forma pillola, testo bianco
- **Secondary**: Pulsante trasparente con bordo scuro, forma pillola, testo scuro
- Tutti i pulsanti avranno la forma a pillola come standard del design system

