

## Uniformare colori etichette alla palette brand

### Problema
Le etichette nella sezione "Confermati dall'azienda" e gli stati talent/azienda nel dettaglio ruolo usano colori Tailwind generici (`emerald-100`, `red-100`) invece della palette brand.

### Soluzione

**1. `src/hooks/useRoleTalents.ts`** — status options:

| Status | Attuale | Nuovo |
|--------|---------|-------|
| Confermato (talent) | `bg-emerald-100 text-emerald-700` | `bg-[#729128]/15 text-[#729128]` |
| Rifiutato (talent) | `bg-red-100 text-red-700` | `bg-[#A30A2B]/15 text-[#A30A2B]` |
| Confermato (azienda) | `bg-emerald-100 text-emerald-700` | `bg-[#729128]/15 text-[#729128]` |
| Scartato (azienda) | `bg-red-100 text-red-700` | `bg-[#A30A2B]/15 text-[#A30A2B]` |

**2. `src/pages/owner/OwnerCastingDetail.tsx`** — sezione confermati:

- Riga 273 avatar fallback: `bg-emerald-100 text-emerald-700` → `bg-[#729128]/15 text-[#729128]`
- Riga 284 badge ruolo: `bg-emerald-100 text-emerald-700` → `bg-[#729128]/15 text-[#729128]`

### File da modificare

| File | Modifica |
|------|----------|
| `src/hooks/useRoleTalents.ts` | Colori confirmed/rejected allineati a palette brand |
| `src/pages/owner/OwnerCastingDetail.tsx` | Avatar fallback e badge ruolo allineati |

