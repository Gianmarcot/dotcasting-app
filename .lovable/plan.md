## Diagnosi

Il componente `src/components/ui/progress.tsx` usa:
- **Traccia**: `bg-secondary` → token `--secondary: 78 22% 38%` = **verde oliva saturo**. È il motivo per cui una barra a 0% sembra "piena di verde": è la *traccia* a essere verde, non il riempimento.
- **Riempimento**: `bg-primary` (bordeaux). Corretto ma invisibile sopra la traccia verde a basso contrasto in alcune condizioni.

Quindi 0/1 non è un bug di stato: è la traccia stessa a sembrare un riempimento.

## Intervento (un solo file)

Modificare **solo** `src/components/ui/progress.tsx`. Nessuna chiamata cambia, nessun consumatore va toccato.

### Cambi
1. **Traccia**: `bg-secondary` → `bg-muted` (token `--muted: 40 15% 88%` = beige tenue, bassa saturazione, coerente con la palette cream del progetto). Aggiungo `border border-border/50` opzionale per garantire una hairline visibile anche su fondi bianchi/`dc-card`.
2. **Riempimento default**: resta `bg-primary` (bordeaux `347 88% 34%`). Contrasto su beige `40 15% 88%` ≈ 7:1, ben oltre AA.
3. **Stato eccezionale 100%**: aggiungo logica `value >= 100 ? "bg-[hsl(var(--olive))]" : "bg-primary"` per indicare visivamente il completamento (olive = green status #729128, già nel design system). Niente cambi API.
4. **Stato 0% garantito**: la traccia ora è chiaramente diversa dal riempimento, quindi una barra 0/1 mostra solo la traccia beige vuota. Inoltre normalizzo `value` con `Math.max(0, Math.min(100, Number(value) || 0))` per evitare che `NaN`/`undefined`/valori negativi facciano apparire l'indicatore pieno (oggi un value sporco renderebbe `translateX(NaN%)` lasciando l'indicatore a `w-full` visibile).
5. Mantengo l'API attuale di shadcn: nessuna prop nuova, nessun breaking change.

### Snippet risultante (riferimento)
```tsx
const safe = Math.max(0, Math.min(100, Number(value) || 0));
const isComplete = safe >= 100;
// Root: "relative h-4 w-full overflow-hidden rounded-full bg-muted"
// Indicator: cn("h-full w-full flex-1 transition-all",
//   isComplete ? "bg-[hsl(var(--olive))]" : "bg-primary")
// style: { transform: `translateX(-${100 - safe}%)` }
```

## Verifica
- Contrasto: bordeaux `hsl(347 88% 34%)` su beige `hsl(40 15% 88%)` ≈ 7:1 (AA large+normal OK). Olive su stesso beige ≈ 4.6:1 (AA per non-text/UI). Entrambi > 3:1 richiesto per componenti UI.
- 0%: la traccia rimane visibile in beige; nessuna porzione bordeaux.
- 100%: indicatore vira a olive per segnalare completamento.
- Tutte le 7 sedi che importano `Progress` ereditano la modifica senza changes.

## File toccati
- `src/components/ui/progress.tsx` (unica modifica)
