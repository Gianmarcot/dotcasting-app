

## Piano: Sfondo bianco per tutti gli input

### Obiettivo
Impostare il colore di sfondo bianco per tutti i campi di input dell'applicazione.

### Approccio
Modificare il design system centralizzato aggiungendo una variabile CSS dedicata per lo sfondo degli input, mantenendo la coerenza con l'architettura esistente.

### Modifiche previste

**1. Aggiornare le variabili CSS (`src/index.css`)**
- Aggiungere una nuova variabile `--input-background` impostata a bianco puro
- Configurare sia per tema light che dark

**2. Aggiornare i componenti UI**
I seguenti componenti verranno modificati per usare `bg-white` invece di `bg-background`:

| Componente | File |
|------------|------|
| Input | `src/components/ui/input.tsx` |
| Textarea | `src/components/ui/textarea.tsx` |
| Select (trigger) | `src/components/ui/select.tsx` |

### Dettagli tecnici

**Modifica CSS (src/index.css):**
```css
:root {
  --input-background: 0 0% 100%; /* bianco puro */
}

.dark {
  --input-background: 0 0% 100%; /* bianco anche in dark mode, o altro colore se preferito */
}
```

**Modifica componenti:**
Sostituire `bg-background` con `bg-white` (o `bg-[hsl(var(--input-background))]` se si vuole usare la variabile) nei seguenti punti:
- `input.tsx` riga 11
- `textarea.tsx` riga 11  
- `select.tsx` riga 20 (SelectTrigger)

### Risultato atteso
Tutti i campi input, textarea e select avranno sfondo bianco, migliorando il contrasto visivo rispetto allo sfondo beige/crema della pagina.

