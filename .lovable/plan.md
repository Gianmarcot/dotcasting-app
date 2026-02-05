

## Piano: Modifica stile Progress Bar Completamento Profilo

### Obiettivo
Aggiornare lo stile della sezione progress bar secondo le specifiche:
- Sfondo a tinta unita `#ECE5DE` (rimuovere gradiente)
- Rimuovere il bordo dalla card
- Progress bar: rosso (parte completata), bianco (parte non completata)

### Modifiche richieste

**File: `src/components/profile/ProfileCompletionBar.tsx`**

| Elemento | Prima | Dopo |
|----------|-------|------|
| Card (loading) | `bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20` | `bg-[#ECE5DE] border-0` |
| Card (main) | `bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20` | `bg-[#ECE5DE] border-0` |
| Progress bar | Classe default | Aggiungo `className="h-3 bg-white"` per sfondo bianco |

### Dettaglio tecnico

La progress bar usa il componente `Progress` da `@radix-ui/react-progress`:
- `bg-secondary` (grigio) è lo sfondo attuale della parte non completata
- `bg-primary` (rosso) è già il colore della parte completata

Devo sovrascrivere solo il colore di sfondo della parte non completata passando la classe `bg-white` al componente Progress.

### Codice modificato

```tsx
// Card - rimuovo gradiente e bordo
<Card className="bg-[#ECE5DE] border-0">

// Progress bar - sfondo bianco per parte non completata
<Progress value={percentage} className="h-3 bg-white" />
```

### Risultato atteso

- Sfondo uniforme beige `#ECE5DE` senza bordo
- Barra progress: rosso (completato) + bianco (non completato)
- Nessun altro stile modificato

