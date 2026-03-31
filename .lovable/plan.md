

## Uniformare tema interno area Owner a quello Talent

### Problema
L'area Owner usa `bg-white` come sfondo del contenuto interno e `bg-[#1A1A1A]` come cornice esterna. L'area Talent usa `bg-background` (crema) come sfondo interno e `bg-card` come cornice esterna. I box (Card) nell'area Owner appaiono su sfondo bianco invece che crema, rompendo la coerenza visiva.

### Soluzione

**`src/components/layout/OwnerLayout.tsx`** — 2 modifiche:

1. Riga 12: `bg-white` → `bg-background` (sfondo crema come area Talent)
2. La cornice esterna `bg-[#1A1A1A]` resta invariata (sidebar scura Owner)

| Riga | Da | A |
|------|----|---|
| 12 | `bg-white md:rounded-[3rem]` | `bg-background md:rounded-[3rem]` |

Un solo file, una sola riga da modificare.

