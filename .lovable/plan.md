

## Rimuovere hover state dai badge

### Problema
I badge hanno `hover:bg-*/80` e `transition-colors` che li fanno sembrare interattivi come pulsanti, creando confusione.

### Soluzione

**`src/index.css`** (riga 403-404): rimuovere `transition-colors` dalla classe base `dc-badge`

**`src/index.css`** (righe 408-417): rimuovere `hover:bg-primary/80`, `hover:bg-secondary/80`, `hover:bg-destructive/80` dalle classi `dc-badge-primary`, `dc-badge-secondary`, `dc-badge-destructive`

**`src/components/ui/badge.tsx`** (righe 11-13): rimuovere `hover:bg-primary/80`, `hover:bg-secondary/80`, `hover:bg-[#A30A2B]/80` dalle varianti `default`, `secondary`, `destructive`

| File | Modifica |
|------|----------|
| `src/index.css` | Rimuovere `transition-colors` e tutti gli `hover:` dalle classi badge |
| `src/components/ui/badge.tsx` | Rimuovere `hover:` dalle 3 varianti che lo hanno |

