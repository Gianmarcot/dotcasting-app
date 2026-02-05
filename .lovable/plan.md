

## Piano: Centralizzazione degli stili CSS con classi componente

### Obiettivo
Ristrutturare il sistema di styling per centralizzare tutti gli stili degli elementi UI in classi CSS definite in `src/index.css`, permettendo modifiche globali senza dover editare i singoli componenti React.

### Approccio

Creare un sistema di classi CSS semantiche nel layer `@layer components` di Tailwind, raggruppate per categoria:

```text
┌──────────────────────────────────────────────────────────────┐
│                     src/index.css                             │
├──────────────────────────────────────────────────────────────┤
│  @layer base      → Design tokens (gia esistenti)            │
│  @layer components → Classi componente centralizzate (NUOVO) │
│  @layer utilities  → Utilities personalizzate                │
└──────────────────────────────────────────────────────────────┘
```

### Struttura delle nuove classi CSS

**1. Elementi interattivi**
| Classe | Descrizione |
|--------|-------------|
| `.dc-btn` | Stile base button |
| `.dc-btn-primary` | Variante primaria (bordeaux) |
| `.dc-btn-secondary` | Variante secondaria (olive) |
| `.dc-btn-outline` | Variante outline |
| `.dc-btn-ghost` | Variante ghost |
| `.dc-btn-sm`, `.dc-btn-lg` | Dimensioni |

**2. Form elements**
| Classe | Descrizione |
|--------|-------------|
| `.dc-input` | Input field base |
| `.dc-textarea` | Textarea base |
| `.dc-select` | Select trigger |
| `.dc-label` | Label form |
| `.dc-checkbox` | Checkbox |

**3. Layout containers**
| Classe | Descrizione |
|--------|-------------|
| `.dc-card` | Card container |
| `.dc-card-header` | Header card |
| `.dc-card-content` | Content card |
| `.dc-dialog` | Dialog/modal |
| `.dc-sidebar` | Sidebar container |

**4. Tipografia**
| Classe | Descrizione |
|--------|-------------|
| `.dc-heading-1` | H1 |
| `.dc-heading-2` | H2 |
| `.dc-heading-3` | H3 |
| `.dc-text` | Testo base |
| `.dc-text-muted` | Testo secondario |
| `.dc-text-sm` | Testo piccolo |

**5. Elementi decorativi**
| Classe | Descrizione |
|--------|-------------|
| `.dc-badge` | Badge base |
| `.dc-badge-success` | Badge successo |
| `.dc-badge-warning` | Badge warning |
| `.dc-avatar` | Avatar |
| `.dc-divider` | Divisore |

### Esempio di implementazione

**In `src/index.css`:**
```css
@layer components {
  /* Buttons */
  .dc-btn {
    @apply inline-flex items-center justify-center gap-2 
           whitespace-nowrap rounded-md text-sm font-medium 
           ring-offset-background transition-all duration-200 
           focus-visible:outline-none focus-visible:ring-2 
           focus-visible:ring-ring focus-visible:ring-offset-2 
           disabled:pointer-events-none disabled:opacity-50;
  }
  
  .dc-btn-primary {
    @apply dc-btn bg-primary text-primary-foreground 
           hover:bg-primary/90 shadow-sm h-10 px-4 py-2;
  }
  
  .dc-btn-outline {
    @apply dc-btn border border-input bg-card 
           hover:bg-muted hover:text-foreground h-10 px-4 py-2;
  }

  /* Cards */
  .dc-card {
    @apply rounded-3xl border bg-card text-card-foreground shadow-sm;
  }
  
  .dc-card-content {
    @apply p-6;
  }

  /* Inputs */
  .dc-input {
    @apply flex h-10 w-full rounded-md border border-input 
           bg-[hsl(var(--input-background))] px-3 py-2 text-base 
           ring-offset-background placeholder:text-muted-foreground 
           focus-visible:outline-none focus-visible:ring-2 
           focus-visible:ring-ring focus-visible:ring-offset-2 
           disabled:cursor-not-allowed disabled:opacity-50 md:text-sm;
  }

  /* Dialog */
  .dc-dialog {
    @apply fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg 
           translate-x-[-50%] translate-y-[-50%] gap-4 border 
           bg-card p-6 shadow-lg duration-200 rounded-3xl;
  }
}
```

**Nei componenti React:**
```tsx
// Prima (card.tsx)
className={cn("rounded-3xl border bg-card text-card-foreground shadow-sm", className)}

// Dopo
className={cn("dc-card", className)}
```

### File coinvolti

| File | Azione |
|------|--------|
| `src/index.css` | Aggiungere tutte le classi componente nel layer components |
| `src/components/ui/button.tsx` | Sostituire classi inline con classi `dc-btn-*` |
| `src/components/ui/card.tsx` | Sostituire con `dc-card`, `dc-card-header`, etc. |
| `src/components/ui/input.tsx` | Sostituire con `dc-input` |
| `src/components/ui/textarea.tsx` | Sostituire con `dc-textarea` |
| `src/components/ui/select.tsx` | Sostituire con `dc-select` |
| `src/components/ui/dialog.tsx` | Sostituire con `dc-dialog` |
| `src/components/ui/alert-dialog.tsx` | Sostituire con `dc-dialog` |
| `src/components/ui/badge.tsx` | Sostituire con `dc-badge-*` |
| `src/components/layout/OwnerSidebar.tsx` | Usare classi `dc-sidebar-*` |
| `src/components/layout/TalentSidebar.tsx` | Usare classi `dc-sidebar-*` |

### Vantaggi

1. **Controllo centralizzato**: modifichi una classe in `index.css` e si aggiorna ovunque
2. **Coerenza garantita**: stesso aspetto per tutti gli elementi dello stesso tipo
3. **Facilita manutenzione**: non devi cercare classi sparse nei componenti
4. **Override semplici**: puoi ancora aggiungere classi extra con `className` prop
5. **Namespace chiaro**: tutte le classi iniziano con `dc-` (dotCasting)

### Convenzioni di naming

- Prefisso `dc-` per tutte le classi (dotCasting)
- Modificatori separati con `-`: `dc-btn-primary`, `dc-btn-sm`
- Parti del componente: `dc-card-header`, `dc-card-content`
- Stati: `dc-btn-active`, `dc-input-error`

### Risultato atteso

- Tutti gli stili UI centralizzati in `src/index.css`
- Componenti React puliti con solo riferimenti a classi CSS
- Possibilita di cambiare look globale modificando un solo file
- Mantenimento della flessibilita con override tramite `className`

