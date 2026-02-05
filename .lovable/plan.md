

## Piano: Sfondo bianco per Dialog e Alert Dialog

### Obiettivo
Cambiare lo sfondo delle finestre di dialogo da `bg-background` (beige) a `bg-card` (bianco) per avere un contrasto visivo migliore e un aspetto più pulito.

### Situazione attuale

Attualmente entrambi i componenti usano `bg-background`:

| Componente | Classe attuale | Colore risultante |
|------------|----------------|-------------------|
| `DialogContent` | `bg-background` | Beige (colore base) |
| `AlertDialogContent` | `bg-background` | Beige (colore base) |

### Modifiche previste

**1. `src/components/ui/dialog.tsx`**

Cambiare lo sfondo del DialogContent:

```tsx
// Riga 39 - Prima
"... bg-background p-6 ..."

// Dopo
"... bg-card p-6 ..."
```

**2. `src/components/ui/alert-dialog.tsx`**

Cambiare lo sfondo dell'AlertDialogContent:

```tsx
// Riga 37 - Prima
"... bg-background p-6 ..."

// Dopo
"... bg-card p-6 ..."
```

### File coinvolti

| File | Azione |
|------|--------|
| `src/components/ui/dialog.tsx` | `bg-background` → `bg-card` |
| `src/components/ui/alert-dialog.tsx` | `bg-background` → `bg-card` |

### Nota sui colori

Nel design system del progetto:
- `bg-background` = colore beige di sfondo generale
- `bg-card` = bianco (usato per sidebar e card)

### Risultato atteso

- Tutti i dialog avranno sfondo bianco
- Maggiore contrasto con lo sfondo beige dell'applicazione
- Aspetto più moderno e pulito
- Coerenza con le card che già usano lo sfondo bianco

