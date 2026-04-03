

## Uniformare colori badge tra CastingCard e CastingRoleCard / CastingDetail

### Problema
La `CastingCard` usa la palette semantica brand (charcoal, verde #729128, rosso #A30A2B con opacità 15%), mentre `CastingRoleCard` e `OwnerCastingDetail` usano colori Tailwind generici (emerald-100, blue-100, red-100).

### Soluzione

Allineare i badge di `CastingRoleCard` e `OwnerCastingDetail` alla palette della `CastingCard`.

**`src/components/castings/CastingRoleCard.tsx`** (riga 57):
- "Attivo": `bg-blue-100 text-blue-700` → `bg-[#729128]/15 text-[#729128]`
- "Completato": `bg-emerald-100 text-emerald-700` → `bg-[#333333]/10 text-[#333333]` (stato concluso, non più attivo)

**`src/pages/owner/OwnerCastingDetail.tsx`** (righe 22-26):
- `statusColors` da:
  - `draft: "bg-muted text-muted-foreground"` → `"bg-[#333333]/10 text-[#333333]"`
  - `active: "bg-emerald-100 text-emerald-700"` → `"bg-[#729128]/15 text-[#729128]"`
  - `closed: "bg-red-100 text-red-700"` → `"bg-[#A30A2B]/15 text-[#A30A2B]"`

| File | Modifica |
|------|----------|
| `src/components/castings/CastingRoleCard.tsx` | Badge colori allineati alla palette brand |
| `src/pages/owner/OwnerCastingDetail.tsx` | `statusColors` allineato alla `CastingCard` |

