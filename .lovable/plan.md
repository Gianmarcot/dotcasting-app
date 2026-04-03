

## Testo scuro nel dropdown anche in hover

### Problema
Le voci del dropdown status hanno testo chiaro su sfondo chiaro in hover, risultando illeggibili. Il `focus:text-accent-foreground` di default del `SelectItem` sovrascrive il colore del testo.

### Soluzione

**`src/pages/owner/OwnerCastingRoleDetail.tsx`** — aggiungere `focus:text-[#333333]` alle className dei `SelectItem` in entrambi i componenti `TalentStatusSelect` e `CompanyStatusSelect`:

```
className="focus:bg-[#333333]/5 focus:text-[#333333] cursor-pointer"
```

| File | Modifica |
|------|----------|
| `src/pages/owner/OwnerCastingRoleDetail.tsx` | Aggiungere `focus:text-[#333333]` ai SelectItem (righe 339 e 357) |

