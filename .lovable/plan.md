

## Piano: Uniformare Colore Bordo Radio Button e Checkbox

### Obiettivo
Modificare il colore del bordo di radio button e checkbox quando sono deselezionati per allinearlo al colore del bordo dei pulsanti secondary (`border-foreground`).

### Analisi corrente

| Componente | Bordo attuale (deselezionato) | Bordo richiesto |
|------------|-------------------------------|-----------------|
| Checkbox | `border-primary` (rosso bordeaux) | `border-foreground` (scuro) |
| RadioGroupItem | `border-primary` (rosso bordeaux) | `border-foreground` (scuro) |
| Button secondary | `border-foreground` (scuro) | - (riferimento) |

### Modifiche richieste

**File: `src/components/ui/checkbox.tsx`**

Cambio da `border-primary` a `border-foreground`:

```tsx
// Prima
"border border-primary ring-offset-background data-[state=checked]:bg-primary..."

// Dopo  
"border border-foreground ring-offset-background data-[state=checked]:bg-primary..."
```

**File: `src/components/ui/radio-group.tsx`**

Cambio da `border-primary` a `border-foreground`:

```tsx
// Prima
"border border-primary text-primary ring-offset-background..."

// Dopo
"border border-foreground text-primary ring-offset-background..."
```

### Comportamento finale

| Stato | Checkbox | Radio Button |
|-------|----------|--------------|
| Deselezionato | Bordo `foreground` (scuro) | Bordo `foreground` (scuro) |
| Selezionato | Sfondo `primary` (bordeaux) + checkmark bianco | Cerchio `primary` (bordeaux) |

### Risultato atteso

- Checkbox e radio button deselezionati avranno lo stesso colore di bordo scuro dei pulsanti secondary
- Quando selezionati manterranno il colore `primary` (bordeaux) per lo sfondo/indicatore
- Design system più coerente in tutti i controlli form

