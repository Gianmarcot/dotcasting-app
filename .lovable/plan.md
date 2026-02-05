

## Piano: Border radius 1.5rem per Card, Dialog e Alert Dialog

### Obiettivo
Applicare un border radius uniforme di 1.5rem (24px) a tutte le Card e i Dialog dell'applicazione, incluse le card dei Talent, Casting e altre sezioni.

### Analisi

Le card come `TalentCard` e `CastingCard` utilizzano il componente base `Card` da `src/components/ui/card.tsx`. Aggiornando il componente base, tutte le istanze erediteranno automaticamente il nuovo stile.

| Componente | Utilizza | Effetto della modifica |
|------------|----------|------------------------|
| `TalentCard` | `Card` base | Angoli arrotondati automatici |
| `CastingCard` | `Card` base | Angoli arrotondati automatici |
| Altre Card | `Card` base | Angoli arrotondati automatici |
| Modal/Dialog | `Dialog` base | Angoli arrotondati automatici |

### Modifiche previste

**1. `src/components/ui/card.tsx`**

Aggiornare il border radius del Card:

```tsx
// Prima
className={cn("rounded-lg border bg-card...", className)}

// Dopo  
className={cn("rounded-3xl border bg-card...", className)}
```

**2. `src/components/ui/dialog.tsx`**

Aggiornare DialogContent:

```tsx
// Prima
className={cn("... sm:rounded-lg", className)}

// Dopo
className={cn("... sm:rounded-3xl", className)}
```

**3. `src/components/ui/alert-dialog.tsx`**

Aggiornare AlertDialogContent:

```tsx
// Prima
className={cn("... sm:rounded-lg", className)}

// Dopo
className={cn("... sm:rounded-3xl", className)}
```

### Valori Tailwind

| Classe | Valore |
|--------|--------|
| `rounded-lg` | 0.5rem (8px) - attuale |
| `rounded-3xl` | 1.5rem (24px) - nuovo |

### File coinvolti

| File | Azione |
|------|--------|
| `src/components/ui/card.tsx` | `rounded-lg` → `rounded-3xl` |
| `src/components/ui/dialog.tsx` | `sm:rounded-lg` → `sm:rounded-3xl` |
| `src/components/ui/alert-dialog.tsx` | `sm:rounded-lg` → `sm:rounded-3xl` |

### Gerarchia visiva risultante

```text
┌─────────────────────────────────────────┐
│           Cornice esterna (3rem)        │
│  ┌───────────────────────────────────┐  │
│  │      Card/Sezioni (1.5rem)        │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Risultato atteso

- Tutte le TalentCard con angoli arrotondati 1.5rem
- Tutte le CastingCard con angoli arrotondati 1.5rem
- Tutti i Dialog/Modal con angoli arrotondati 1.5rem
- Design coerente e moderno in tutta l'applicazione
- La cornice esterna (3rem) rimane più grande delle card interne (1.5rem)

