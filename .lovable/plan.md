

## Semplificare colori nelle select di stato e dropdown

### Problema
Le voci nei dropdown di `TalentStatusSelect` e `CompanyStatusSelect` hanno badge colorati dentro le opzioni, creando sovrapposizione visiva con il colore del trigger. L'hover delle voci usa l'accent di default invece di un grigio chiaro neutro.

### Soluzione

**1. `src/pages/owner/OwnerCastingRoleDetail.tsx`** (righe 368-406) — nei due componenti select:

- **Trigger**: mantiene il colore di sfondo semantico attuale (funziona come badge dello stato corrente)
- **Dropdown items**: rimuovere il `<span>` colorato, mostrare solo il testo label senza colori
- **Hover items**: aggiungere `focus:bg-[#333333]/5` (grigio chiaro dalla palette charcoal) tramite className su `SelectItem`

**2. `src/hooks/useRoleTalents.ts`** — nessuna modifica, i colori servono ancora per il trigger

### File da modificare

| File | Modifica |
|------|----------|
| `src/pages/owner/OwnerCastingRoleDetail.tsx` | Rimuovere span colorati dalle voci dropdown, aggiungere hover grigio chiaro |

