
## Piano: Stile unificato per le Tabs con underline

### Obiettivo
Creare uno stile uniforme, semplice e minimal per tutte le tabs dell'applicazione, con una linea sotto la tab attiva invece dello stile "pill" attuale.

### Situazione attuale

L'applicazione utilizza due pattern diversi per i filtri con tabs:

| Componente | Pattern attuale | Pagine |
|------------|-----------------|--------|
| `CastingFilters.tsx` | Radix UI Tabs (stile pill con sfondo) | Casting owner |
| `ApplicationFilters.tsx` | Button con variant toggle | Candidature owner |

### Approccio

Modificare il componente UI base `Tabs` per avere uno stile underline minimal, in modo che tutte le pagine che lo utilizzano ereditino automaticamente il nuovo design. Inoltre, aggiornare `ApplicationFilters` per utilizzare il componente `Tabs` invece dei `Button`, garantendo uniformità.

### Design proposto

```text
┌──────────────────────────────────────────────────┐
│                                                  │
│   Tutti    Bozza    Attivo    Chiuso            │
│   ─────                                          │
│                                                  │
│   (linea sotto la tab attiva)                   │
└──────────────────────────────────────────────────┘
```

**Caratteristiche dello stile:**
- Sfondo trasparente per la TabsList (nessun contenitore visibile)
- Bordo inferiore sottile per separare le tabs dal contenuto
- Linea colorata (primary) sotto la tab attiva
- Transizione fluida al cambio tab
- Nessuna ombra o effetti 3D

### Modifiche previste

**1. Aggiornare `src/components/ui/tabs.tsx`**

Modificare gli stili di `TabsList` e `TabsTrigger`:

| Elemento | Stile attuale | Nuovo stile |
|----------|---------------|-------------|
| `TabsList` | `bg-muted rounded-md p-1` | `bg-transparent border-b border-border` |
| `TabsTrigger` | `bg-background shadow-sm` (quando attivo) | `border-b-2 border-primary` (quando attivo) |

**2. Aggiornare `src/components/applications/ApplicationFilters.tsx`**

Convertire i `Button` in vere `Tabs` per uniformità:
- Importare `Tabs`, `TabsList`, `TabsTrigger` 
- Rimuovere la logica manuale di toggle
- Mantenere le icone e i badge di conteggio

### Dettagli tecnici

**Nuovo stile TabsList:**
```tsx
className={cn(
  "inline-flex h-10 items-center gap-1 border-b border-border bg-transparent",
  className,
)}
```

**Nuovo stile TabsTrigger:**
```tsx
className={cn(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all border-b-2 border-transparent -mb-px",
  "data-[state=active]:text-foreground data-[state=active]:border-primary",
  "hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-50",
  className,
)}
```

**Punti chiave:**
- `-mb-px` per sovrapporre il bordo della lista
- `border-b-2 border-transparent` come base
- `data-[state=active]:border-primary` per la linea colorata
- Transizione smooth per hover e active

### File coinvolti

| File | Azione |
|------|--------|
| `src/components/ui/tabs.tsx` | Modifica stili base |
| `src/components/applications/ApplicationFilters.tsx` | Refactor per usare Tabs |

### Risultato atteso

- Stile visivo coerente su tutte le pagine con filtri tabs
- Design minimal e pulito con linea di accento sotto la tab attiva
- Nessuna modifica necessaria alle pagine esistenti che già usano il componente Tabs (come CastingFilters)
- Le icone e i badge in ApplicationFilters continueranno a funzionare all'interno delle TabsTrigger
